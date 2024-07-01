import { NextRequest, NextResponse } from 'next/server';
import { planTasks } from '@/lib/planTasks';

export async function POST(req: NextRequest) {
  const { prompt, sessionId } = await req.json();

  try {
    const tasks: Task[] = await planTasks(prompt, sessionId);
    // 작업 우선순위에 따라 정렬
    tasks.sort((a, b) => Math.max(...b.dep) - Math.max(...a.dep));
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to plan tasks:', error);
    return NextResponse.json({ error: 'Failed to plan tasks' }, { status: 500 });
  }
}
