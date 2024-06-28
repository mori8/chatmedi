import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";

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
  const chats: Message[] = [];

  for (const key of keys) {
    const chat = (await redis.hgetall(key)) as unknown as Message;
    if (chat) {
      chats.push(chat);
    }
  }

  return chats;
}

export async function saveChatMessage(
  userId: string,
  chatId: string,
  message: Omit<Message, "messageId">
): Promise<Message | void> {
  // 특정 사용자와 채팅 ID에 대한 개별 메시지를 저장
  if (!userId || !chatId) {
    return;
  }

  const messageId = uuidv4();
  console.log("saveChatMessage called", message);

  const redisMessage = {
    messageId: messageId,
    sender: message.sender,
    text: message.text,
  };

  await redis.hset(`chat:${userId}:${chatId}:messages`, redisMessage);
  return redisMessage;
}

export async function saveNewChat(
  userId: string,
  chatId: string,
  prompt: string
): Promise<Message | void> {
  if (!userId || !chatId || !prompt) {
    return;
  }
  // 이 함수는 /chat/page.tsx에서만 호출되어야 함
  // chatId(uuid)는 /api/chat/route.ts에서 생성됨
  console.log("saveNewChat called", userId, chatId, prompt);

  const locale = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  const createdAt = new Date(locale).toISOString().split("T")[0];

  const savedMessage = await saveChatMessage(userId, chatId, {
    sender: "user",
    text: prompt,
  });

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