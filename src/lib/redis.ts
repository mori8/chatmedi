import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
});

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
  console.log("chats:", chats);
  console.log("fetchChatHistory called");
  return chats;
}

export async function saveUserMessage(
  userId: string,
  chatId: string,
  text: string,
  files?: string[]
): Promise<UserMessage> {
  if (!userId || !chatId || !text) {
    throw new Error("Invalid input");
  }
  console.log("saveUserMessage called", userId, chatId, text);
  const messageId = uuidv4();
  const timestamp = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).toISOString();

  const userMessage: UserMessage = {
    messageId,
    sender: "user",
    prompt: {
      text,
      files,
    },
  };

  await redis.hset(`chat:${userId}:${chatId}:${timestamp}:user`, {
    messageId: userMessage.messageId,
    sender: userMessage.sender,
    promptText: userMessage.prompt.text,
    promptFiles: userMessage.prompt.files?.join(",") || "",
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
  console.log("saveAIMessage called", userId, chatId, response);
  const messageId = uuidv4();
  const timestamp = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).toISOString();

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
  files?: string[]
) {
  if (!userId || !chatId || !prompt) {
    throw new Error("[redis.ts/saveNewChat] Invalid input");
  }

  console.log("saveNewChat called", userId, chatId, prompt);

  const savedMessage = await saveUserMessage(userId, chatId, prompt, files);

  const timestamp = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).toISOString().split("T")[0];
  await redis.hset(`chat:${userId}:history:${timestamp}:${chatId}`, { chatId, prompt });
  await redis.sadd(`user:${userId}:chats`, chatId);

  return savedMessage;
}

export async function fetchUserChats(
  userId: string
): Promise<{ [date: string]: { chatId: string; prompt: string }[] }> {
  if (!userId) {
    return {};
  }
  console.log("fetchUserChats called", userId);

  // Get all keys related to user's chat history
  const keys = await redis.keys(`chat:${userId}:history:*`);
  const chatsByDate: { [date: string]: { chatId: string; prompt: string }[] } =
    {};

  for (const key of keys) {
    const chat = (await redis.hgetall(key)) as unknown as Record<
      string,
      string
    >;
    if (!chat) {
      continue;
    }

    const timestamp = key.split(":")[3];
    const date = timestamp.split("T")[0];
    const chatId = chat.chatId;

    const chatData = {
      chatId,
      prompt: chat.prompt,
    };

    if (!chatsByDate[date]) {
      chatsByDate[date] = [];
    }

    chatsByDate[date].push(chatData);
  }

  return chatsByDate;
}
