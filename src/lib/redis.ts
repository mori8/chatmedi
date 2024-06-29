import { Redis } from '@upstash/redis';
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
  const chats: (UserMessage | AIMessage)[] = [];
  
  for (const key of keys) {
    const chat = await redis.hgetall(key) as unknown as Record<string, string>;

    if (!chat) {
      continue;
    }
    if (chat.sender === 'user') {
      const userMessage: UserMessage = {
        messageId: chat.messageId,
        sender: 'user',
        prompt: {
          text: chat.promptText,
          files: chat.promptFiles ? chat.promptFiles.split(',') : [],
        },
      };
      chats.push(userMessage);
    } else if (chat.sender === 'ai') {
      let response: ChatMediResponse;
      try {
        // Check if chat.response is a JSON string or already an object
        if (typeof chat.response === 'string') {
          response = JSON.parse(chat.response) as ChatMediResponse;
        } else {
          response = chat.response as unknown as ChatMediResponse;
        }
      } catch (error) {
        console.error("Failed to parse response:", chat.response);
        continue;
      }

      const aiMessage: AIMessage = {
        messageId: chat.messageId,
        sender: 'ai',
        response: response,
      };
      chats.push(aiMessage);
    }
  }
  console.log('chats:', chats);
  console.log("fetchChatHistory called");
  return chats.sort((a, b) => a.messageId.localeCompare(b.messageId)); // Assuming messageId is timestamp based
}

export async function saveUserMessage(userId: string, chatId: string, text: string, files?: string[]): Promise<UserMessage> {
  if (!userId || !chatId || !text) {
    throw new Error('Invalid input');
  }

  const messageId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const userMessage: UserMessage = {
    messageId,
    sender: 'user',
    prompt: {
      text,
      files,
    },
  };

  await redis.hset(`chat:${userId}:${chatId}:${timestamp}`, {
    messageId: userMessage.messageId,
    sender: userMessage.sender,
    promptText: userMessage.prompt.text,
    promptFiles: userMessage.prompt.files?.join(',') || "",
  });

  return userMessage;
}

export async function saveAIMessage(userId: string, chatId: string, response: ChatMediResponse): Promise<AIMessage> {
  if (!userId || !chatId || !response) {
    throw new Error('Invalid input');
  }
  console.log("saveAIMessage called", userId, chatId, response);
  const messageId = uuidv4();
  const timestamp = new Date().toISOString();

  const aiMessage: AIMessage = {
    messageId,
    sender: 'ai',
    response,
  };

  await redis.hset(`chat:${userId}:${chatId}:${timestamp}`, {
    messageId: aiMessage.messageId,
    sender: aiMessage.sender,
    response: JSON.stringify(aiMessage.response),
  });

  return aiMessage;
}

export async function saveNewChat(userId: string, chatId: string, prompt: string, files: string[] = []) {
  if (!userId || !chatId || !prompt) {
    throw new Error('[redis.ts/saveNewChat] Invalid input');
  }

  console.log("saveNewChat called", userId, chatId, prompt);
  
  await saveUserMessage(userId, chatId, prompt, files);
  await redis.sadd(`user:${userId}:chats`, chatId);
}

export async function fetchUserChats(userId: string): Promise<{ [date: string]: { chatId: string; prompt: string; }[] }> {
  if (!userId) {
    return {};
  }
  console.log("fetchUserChats called", userId);
  const keys = await redis.keys(`chat:${userId}:history:*`);
  const chatsByDate: { [date: string]: { chatId: string; prompt: string; }[] } = {};

  for (const key of keys) {
    const [_, __, ___, date, chatId] = key.split(':');
    const chat = await redis.hgetall(key) as { chatId: string; prompt: string; };
    if (chat) {
      if (!chatsByDate[date]) {
        chatsByDate[date] = [];
      }
      chatsByDate[date].push(chat);
    }
  }

  return chatsByDate;
}
