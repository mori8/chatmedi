import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const getAIResponse = async (prompt: string, history: string[]) => {
  const model = new ChatOpenAI({
    model: "gpt-4o"
  });

  // Combine history with the current prompt
  // const fullPrompt = history.join("\n") + "\n" + prompt;
  // TODO: chat history

  const response = await model.invoke([new HumanMessage({ content: prompt })]);
  console.log('response:', JSON.stringify(response));
  return response.content;
};

export async function POST(req: NextRequest) {
  const { userId, prompt, history } = await req.json();
  console.log('userId:', userId);
  console.log('prompt:', prompt);

  if (!userId || !prompt || !Array.isArray(history) || typeof userId !== 'string' || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const aiResponse = await getAIResponse(prompt, history);
  console.log('aiResponse:', aiResponse);
  return NextResponse.json({ response: aiResponse });
}
