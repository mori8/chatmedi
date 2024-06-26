// app/api/plan-task/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { planTasks } from '@/lib/planTasks';

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  try {
    const parsedHistory: ConversationHistory = history ? history : { messages: [] };
    console.log('parsedHistory:', parsedHistory);
    const tasks: Task[] = await planTasks(prompt, parsedHistory);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to plan tasks:', error);
    return NextResponse.json({ error: 'Failed to plan tasks' }, { status: 500 });
  }
}
