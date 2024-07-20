import { NextRequest, NextResponse } from 'next/server';
import { getMessageById } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const chatId = searchParams.get('chatId');
  const messageId = searchParams.get('messageId');

  if (!userId || !chatId || !messageId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const message = await getMessageById(userId, chatId, messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
