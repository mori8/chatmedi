import { NextRequest, NextResponse } from "next/server";
import { planTask } from "@/lib/planTask";

export async function POST(req: NextRequest) {
  const { userId, prompt, sessionId, fileURL } = await req.json();
  // console.log("[/plan-task]:", prompt, sessionId, fileURL);
  console.log("[/plan-task]:", userId, prompt, sessionId, fileURL);
  try {
    const taskResponse = await planTask(userId, prompt, sessionId, fileURL);
    return NextResponse.json(taskResponse);
  } catch (error) {
    console.error("Failed to plan task:", error);
    return NextResponse.json({ error: "Failed to plan task" }, { status: 500 });
  }
}
