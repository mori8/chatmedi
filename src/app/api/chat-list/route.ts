import { NextRequest, NextResponse } from 'next/server';
import { fetchUserChats } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
  }

  try {
    const chatsByDate = await fetchUserChats(userId);
    return NextResponse.json(chatsByDate, { status: 200 });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
