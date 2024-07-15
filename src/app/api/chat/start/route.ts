import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveNewChat } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const userId = formData.get("userId") as string;
  const prompt = formData.get("prompt") as string;
  const file = formData.get("file") as File | null;

  if (
    !userId ||
    !prompt ||
    typeof userId !== "string" ||
    typeof prompt !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const chatId = uuidv4();
  console.log(
    "/api/chat called",
    userId,
    chatId,
    prompt,
    file ? "file attached" : "no file attached"
  );

  const savedFirstMessage = await saveNewChat(userId, chatId, prompt, file);

  return NextResponse.json({
    chatId,
    prompt,
    userId,
    messageId: savedFirstMessage?.messageId,
    fileURL: savedFirstMessage?.prompt?.files?.[0] || ''
  });
}
