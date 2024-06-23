import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { saveChatMessage } from "@/lib/redis";


const getAIResponse = async (userId: string, prompt: string, chatId: string) => {
  const prompts = ChatPromptTemplate.fromMessages([
    ["system", "You're an assistant who's good at medical QA."],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);

  const chain = prompts.pipe(new ChatOpenAI({ model: "gpt-4o" }));

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: (sessionId) =>
      new UpstashRedisChatMessageHistory({
        sessionId,
        config: {
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        },
      }),
    inputMessagesKey: "question",
    historyMessagesKey: "history",
  });

  const result = await chainWithHistory.invoke(
    {
      question: prompt,
    },
    {
      configurable: {
        sessionId: chatId,
      },
    }
  );

  // console.log("result:", result);
  console.log("chainWithHistory called")
  await saveChatMessage(userId, chatId, { sender: "ai", text: result.content.toString() });

  return result.content;
};


export async function POST(req: NextRequest) {
  const { userId, prompt, chatId } = await req.json();
  console.log("userId:", userId);
  console.log("prompt:", prompt);
  console.log("chatId:", chatId);

  if (
    !userId ||
    !prompt ||
    !chatId ||
    typeof userId !== "string" ||
    typeof prompt !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const aiResponse = await getAIResponse(userId, prompt, chatId);
  return NextResponse.json({ response: aiResponse });
}
