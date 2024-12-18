import AWS from "aws-sdk";
import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";
import { extractImageURL, formatDate, parseTimestamp } from "@/utils/utils";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadToS3(
  file: File,
  userId: string,
  chatId: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables");
  }
  console.log("Uploading file to S3:", file);
  // Convert Blob to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: bucketName,
    Key: `${userId}/${chatId}/${file.name}`,
    Body: buffer,
    ContentType: file.type,
  };

  console.log("Uploading to S3 with params:", params);

  return new Promise((resolve, reject) => {
    s3.upload(params, (err: Error, data: any) => {
      if (err) {
        console.error("Error uploading file:", err);
        return reject(err);
      }
      if (!data || !data.Location) {
        const errorMsg =
          "Upload succeeded but 'Location' is missing in response";
        console.error(errorMsg, data);
        return reject(new Error(errorMsg));
      }
      resolve(data.Location);
    });
  });
}

export async function fetchChatHistory(userId: string, chatId: string) {
  if (!userId || !chatId) {
    return [];
  }
  const keys = await redis.keys(`chat:${userId}:${chatId}:*`);
  const chats: (
    | (UserMessage & { timestamp: string })
    | (AIMessage & { timestamp: string })
  )[] = [];

  for (const key of keys) {
    const chat = (await redis.hgetall(key)) as unknown as Record<
      string,
      string
    >;

    if (!chat) {
      continue;
    }
    if (chat.sender === "user") {
      const userMessage: UserMessage & { timestamp: string } = {
        messageId: chat.messageId,
        sender: "user",
        prompt: {
          text: chat.promptText,
          files: chat.promptFiles ? chat.promptFiles.split(",") : [],
        },
        timestamp: chat.timestamp,
      };
      chats.push(userMessage);
    } else if (chat.sender === "ai") {
      let response: ChatMediResponse;
      try {
        response =
          typeof chat.response === "string"
            ? JSON.parse(chat.response)
            : chat.response;
      } catch (error) {
        console.error("Failed to parse response:", chat.response);
        continue;
      }

      const aiMessage: AIMessage & { timestamp: string } = {
        messageId: chat.messageId,
        sender: "ai",
        response: response,
        timestamp: chat.timestamp,
      };
      chats.push(aiMessage);
    }
  }
  return chats;
}

export async function saveUserMessage(
  userId: string,
  chatId: string,
  text: string,
  file: File | null
): Promise<UserMessage> {
  if (!userId || !chatId || !text) {
    throw new Error("Invalid input");
  }
  console.log(
    "saveUserMessage called",
    userId,
    chatId,
    text,
    file ? file.name : ""
  );
  const messageId = uuidv4();
  const timestamp = formatDate(
    new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  );

  let fileUrl: string | null = null;
  if (file) {
    fileUrl = await uploadToS3(file, userId, chatId);
  } else {
    const extractedUrl = extractImageURL(text);
    if (extractedUrl) {
      fileUrl = extractedUrl[0];
    }
  }

  const userMessage: UserMessage = {
    messageId,
    sender: "user",
    prompt: {
      text,
      files: fileUrl ? [fileUrl] : [],
    },
  };

  await redis.hset(`chat:${userId}:${chatId}:${timestamp}:user`, {
    messageId: userMessage.messageId,
    sender: userMessage.sender,
    promptText: userMessage.prompt.text,
    promptFiles: fileUrl || "",
    timestamp,
  });

  return userMessage;
}

export async function saveAIMessage(
  userId: string,
  chatId: string,
  response: ChatMediResponse
): Promise<AIMessage> {
  if (!userId || !chatId || !response) {
    throw new Error("Invalid input");
  }
  const messageId = uuidv4();
  const timestamp = formatDate(
    new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  );

  const aiMessage: AIMessage = {
    messageId,
    sender: "ai",
    response,
  };

  await redis.hset(`chat:${userId}:${chatId}:${timestamp}:ai`, {
    messageId: aiMessage.messageId,
    sender: aiMessage.sender,
    response: JSON.stringify(aiMessage.response),
    timestamp,
  });

  return aiMessage;
}

export async function saveNewChat(
  userId: string,
  chatId: string,
  prompt: string,
  file: File | null
) {
  if (!userId || !chatId || !prompt) {
    throw new Error("[redis.ts/saveNewChat] Invalid input");
  }


  const savedMessage = await saveUserMessage(userId, chatId, prompt, file);

  const timestamp = formatDate(
    new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  );
  await redis.hset(`chat:${userId}:history:${timestamp}:${chatId}`, {
    chatId,
    prompt,
  });
  await redis.sadd(`user:${userId}:chats`, chatId);

  return savedMessage;
}

export async function fetchUserChats(
  userId: string
): Promise<{ [date: string]: { chatId: string; prompt: string }[] }> {
  if (!userId) {
    return {};
  }

  // Get all keys related to user's chat history
  const keys = await redis.keys(`chat:${userId}:history:*`);
  const chatsByDate: ChatHistory = {};

  // Use pipelining to fetch all chat histories in parallel
  const pipeline = redis.pipeline();
  keys.forEach((key) => {
    pipeline.hgetall(key);
  });

  const results:
    {
      chatId: string;
      prompt: string;

    }[] = await pipeline.exec();

  results.forEach((result, index) => {
    const dateTimeString = keys[index].split(":")[3];
    const date = dateTimeString.split("  ")[0];
    const chatId = result.chatId;

    const chatData = {
      chatId,
      prompt: result.prompt,
      timestamp: dateTimeString,
    };

    if (!chatsByDate[date]) {
      chatsByDate[date] = [];
    }

    chatsByDate[date].push(chatData);
  });

  // Convert date keys to Date objects, sort by date, and convert back to string keys
  const sortedChatsByDate = Object.entries(chatsByDate)
    .map(([dateString, chats]) => {
      const sortedChats = chats.sort((a, b) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime());
      return { date: dateString, sortedChats };
    })
    .sort((a, b) => {
      const aTimestamp = parseTimestamp(a.sortedChats[0].timestamp).getTime();
      const bTimestamp = parseTimestamp(b.sortedChats[0].timestamp).getTime();
      return bTimestamp - aTimestamp;
    })
    .reduce((acc, { date, sortedChats }) => {
      acc[date] = sortedChats;
      return acc;
    }, {} as ChatHistory);
  
  // console.log("fetchUserChats result:", sortedChatsByDate);

  return sortedChatsByDate;
}

export async function getMessageById(
  userId: string,
  chatId: string,
  messageId: string
): Promise<UserMessage | AIMessage | null> {
  if (!userId || !chatId || !messageId) {
    throw new Error("Invalid input");
  }

  const keys = await redis.keys(`chat:${userId}:${chatId}:*`);
  for (const key of keys) {
    const chat = (await redis.hgetall(key)) as unknown as Record<string, string>;
    if (chat.messageId === messageId) {
      if (chat.sender === "user") {
        const userMessage: UserMessage & { timestamp: string } = {
          messageId: chat.messageId,
          sender: "user",
          prompt: {
            text: chat.promptText,
            files: chat.promptFiles ? chat.promptFiles.split(",") : [],
          },
          timestamp: chat.timestamp,
        };
        return userMessage;
      } else if (chat.sender === "ai") {
        let response: ChatMediResponse;
        try {
          response =
            typeof chat.response === "string"
              ? JSON.parse(chat.response)
              : chat.response;
        } catch (error) {
          console.error("Failed to parse response:", chat.response);
          continue;
        }

        const aiMessage: AIMessage & { timestamp: string } = {
          messageId: chat.messageId,
          sender: "ai",
          response: response,
          timestamp: chat.timestamp,
        };
        return aiMessage;
      }
    }
  }

  return null;
}