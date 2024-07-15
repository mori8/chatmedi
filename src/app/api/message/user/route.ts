import { NextRequest, NextResponse } from 'next/server';
import { saveUserMessage } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userId = formData.get('userId') as string;
  const chatId = formData.get('chatId') as string;
  const text = formData.get('text') as string;
  const file = formData.get('file') as File;

  if (!userId || !chatId || !text) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const userMessage = await saveUserMessage(userId, chatId, text, file);
    return NextResponse.json(userMessage);
  } catch (error) {
    console.error('Error saving user message:', error);
    return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 });
  }
}
