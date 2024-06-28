import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
});

export async function fetchChatHistory(userId: string, chatId: string): Promise<Message[]> {
  if (!userId || !chatId) {
    return [];
  }
  const keys = await redis.keys(`chat:${userId}:${chatId}:message:*`);
  const chats: Message[] = [];
  
  for (const key of keys) {
    const chat = await redis.hgetall(key);
    if (chat && chat.sender && chat.text && chat.messageId) {
      chats.push(chat as unknown as Message);
    }
  }

  console.log("fetchChatHistory called");
  console.log("keys:", keys);
  console.log("chats:", chats);
  return chats;
}



export async function saveChatMessage(userId: string, chatId: string, message: Omit<Message, 'messageId'>): Promise<Message | void> {
  if (!userId || !chatId) {
    return;
  }

  const messageId = uuidv4();
  const timestamp = new Date().toISOString();
  console.log("saveChatMessage called", message, timestamp);

  const redisMessage = {
    messageId: messageId,
    sender: message.sender,
    text: message.text,
  };

  await redis.hset(`chat:${userId}:${chatId}:message:${timestamp}`, redisMessage);
  return { ...redisMessage };
}

export async function saveNewChat(userId: string, chatId: string, prompt: string): Promise<Message | void> {
  if (!userId || !chatId || !prompt) {
    return;
  }

  console.log("saveNewChat called", userId, chatId, prompt);
  
  const createdAt = new Date().toISOString().split("T")[0];
  const savedMessage = await saveChatMessage(userId, chatId, { sender: "user", text: prompt });
  await redis.hset(`chat:${userId}:history:${createdAt}:${chatId}`, { chatId, prompt });
  await redis.sadd(`user:${userId}:chats`, chatId);
  return savedMessage;
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

export async function saveChatMediResponse(userId: string, chatId: string, messageId: string, response: ChatMediResponse): Promise<void> {
  if (!userId || !chatId || !messageId || !response) {
    throw new Error("Invalid input: Missing required parameters.");
  }

  console.log("saveChatMediResponse called", userId, chatId, messageId, response);

  await redis.hset(`chat:${userId}:${chatId}:${messageId}:response`, response as unknown as Record<string, string>);
}

export async function getChatMediResponse(userId: string, chatId: string, messageId: string): Promise<ChatMediResponse | null> {
  if (!userId || !chatId || !messageId) {
    return null;
  }

  const response = await redis.hgetall(`chat:${userId}:${chatId}:${messageId}:response`);
  if (!response || Object.keys(response).length === 0) {
    return null;
  }

  return response as unknown as ChatMediResponse;
}

export async function getMessageInfo(userId: string, chatId: string, messageId: string): Promise<{ sender: string; text: string } | null> {
  if (!userId || !chatId || !messageId) {
    throw new Error("Invalid input: Missing required parameters.");
  }

  const key = `chat:${userId}:${chatId}:${messageId}`;
  const messageData = await redis.hgetall(key);

  if (!messageData || !messageData.sender || !messageData.text) {
    console.error(`Message data not found for key: ${key}`);
    return null;
  }

  return {
    sender: messageData.sender as string,
    text: messageData.text as string
  };
}