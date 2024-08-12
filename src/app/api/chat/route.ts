import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";


const getAIResponse = async (userId: string, prompt: string, chatId: string) => {
  const prompts = ChatPromptTemplate.fromMessages([
    ["system", "You're an AI assistant with a strong medical background."],
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
  console.log("getAIResponse called")

  return result.content.toString();
};

const getAIResponseWithError = async (userId: string, prompt: string, chatId: string, error: string) => {
  const prompts = ChatPromptTemplate.fromMessages([
    ["system", `You are ChatMedi, a medical AI assistant. When you receive a user request, you first analyze the request, break it down into several subtasks, select the most appropriate model for each task, and then generate the input arguments to feed into those models. The selected models perform the given tasks, and finally, you compile the results to generate a response that the user can understand. However, the user has not provided enough information to generate the model's input arguments, resulting in the following error: {error}. Based on this error, kindly explain to the user what specific information is currently missing and what additional details are needed to generate the correct input arguments. Remember to explain as simply as possible, considering that the user may have little to no background in machine learning and AI. Assure the user that once the necessary information is provided, you will be able to execute their command successfully.`],
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
      error: error,
    },
    {
      configurable: {
        sessionId: chatId,
      },
    }
  );

  // console.log("result:", result);
  console.log("getAIResponseWithError called")

  return result.content.toString();
}


export async function POST(req: NextRequest) {
  const { userId, prompt, chatId, error } = await req.json();

  if (
    !userId ||
    !prompt ||
    !chatId ||
    typeof userId !== "string" ||
    typeof prompt !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (error) {
    const aiResponseWithError = await getAIResponseWithError(userId, prompt, chatId, error);
    console.log("aiResponseWithError:", aiResponseWithError);
    return NextResponse.json({ response: aiResponseWithError });
  }

  const aiResponse = await getAIResponse(userId, prompt, chatId);
  console.log("aiResponse:", aiResponse);
  
  return NextResponse.json({ response: aiResponse });
}
