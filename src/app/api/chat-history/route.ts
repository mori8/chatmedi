import { NextRequest, NextResponse } from 'next/server';
import { fetchChatHistory } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const chatId = searchParams.get('chatId');

  if (!userId || !chatId) {
    return NextResponse.json({ error: 'Invalid or missing userId or chatId' }, { status: 400 });
  }

  try {
    const chatHistory = await fetchChatHistory(userId, chatId);
    return NextResponse.json(chatHistory, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
