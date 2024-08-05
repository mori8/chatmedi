import { NextRequest, NextResponse } from "next/server";
import { planTask } from "@/lib/planTask";

export async function POST(req: NextRequest) {
  const { prompt, sessionId, fileURL } = await req.json();
  // console.log("[/plan-task]:", prompt, sessionId, fileURL);
  try {
    const taskResponse = await planTask(prompt, sessionId, fileURL || "");
    console.log("[/plan-task]:", taskResponse);
    return NextResponse.json(taskResponse);
  } catch (error) {
    console.error("Failed to plan task:", error);
    return NextResponse.json({ error: "Failed to plan task" }, { status: 500 });
  }
}
