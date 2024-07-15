import { NextRequest, NextResponse } from 'next/server';
import { saveAIMessage } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const { userId, chatId, response } = await request.json();

  if (!userId || !chatId || !response) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const aiMessage = await saveAIMessage(userId, chatId, response);
    return NextResponse.json(aiMessage);
  } catch (error) {
    console.error('Error saving AI message:', error);
    return NextResponse.json({ error: 'Failed to save AI message' }, { status: 500 });
  }
}
