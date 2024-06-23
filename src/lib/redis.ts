
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
});

export async function fetchChatHistory(userId: string, chatId: string) {
  // 특정 사용자와 채팅 ID에 대한 모든 채팅 기록을 가져옴
  if (!userId || !chatId) {
    return [];
  }
  const keys = await redis.keys(`chat:${userId}:${chatId}:*`);
  const chats = [];
  
  for (const key of keys) {
    const chat = await redis.hgetall(key);
    chats.push(chat);
  }
  console.log("fetchChatHistory called");
  // console.log("chats:", chats);
  return chats;
}

export async function saveChatMessage(userId: string, chatId: string, message: { sender: string; text: string }) {
  // 특정 사용자와 채팅 ID에 대한 개별 메시지를 저장
  if (!userId || !chatId) {
    return;
  }
  const timestamp = new Date().toISOString();
  console.log("saveChatMessage called", message, timestamp)
  await redis.hset(`chat:${userId}:${chatId}:${timestamp}`, message);
}

export async function saveNewChat(userId: string, chatId: string, prompt: string) {
  if (!userId || !chatId || !prompt) {
    return;
  }
  
  console.log("saveNewChat called", userId, chatId, prompt);
  
  const createdAt = new Date().toISOString();
  
  await saveChatMessage(userId, chatId, { sender: "user", text: prompt });
  await redis.hset(`chat:${userId}:${chatId}`, { prompt, createdAt });
  await redis.sadd(`user:${userId}:chats`, chatId);
}

export async function fetchUserChats(userId: string) {
  // 사용자가 생성한 모든 채팅 ID를 가져옴
  if (!userId) {
    return [];
  }
  console.log("fetchUserChats called", userId);
  const chatIds = await redis.smembers(`user:${userId}:chats`);
  return chatIds;
}