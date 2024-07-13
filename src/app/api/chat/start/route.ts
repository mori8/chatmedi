import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveNewChat } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const { userId, prompt, file } = await req.json();

  if (!userId || !prompt || typeof userId !== 'string' || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const chatId = uuidv4();
  console.log("/api/chat called", userId, chatId, prompt, file ? "file attached" : "no file attached");
  
  const savedFirstMessage = await saveNewChat(userId, chatId, prompt, file);

  return NextResponse.json({
    chatId,
    prompt,
    userId,
    messageId: savedFirstMessage?.messageId,
  });
}
