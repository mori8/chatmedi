import { NextRequest, NextResponse } from 'next/server';
import { planTasks } from '@/lib/planTasks';

export async function POST(req: NextRequest) {
  const { prompt, sessionId } = await req.json();

  try {
    const tasks: Task[] = await planTasks(prompt, sessionId);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to plan tasks:', error);
    return NextResponse.json({ error: 'Failed to plan tasks' }, { status: 500 });
  }
}
