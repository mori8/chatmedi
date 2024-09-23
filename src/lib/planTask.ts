import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from "dotenv";

dotenv.config();

export async function planTask(
  userInput: string,
  sessionId: string,
  fileURL: string | null
): Promise<TaskResponse> {
  const openai = new ChatOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    modelName: "gpt-4o",
    stop: ["<im_end>"],
  });

  const zodSchema = z.object({
    task: z.enum([
      "question-answering-about-medical-domain",
      "summarization",
      "report-to-cxr-generation",
      "cxr-to-report-generation",
      "clinical-note-analysis"
    ]),
    context: z.object({
      file: z.string().nullable().optional(),
      text: z.string().optional()
    })
  });

  const jsonSchema = zodToJsonSchema(zodSchema);

  const fullPrompt = "Please analyze the user's input and determine the most appropriate task and context needed to fulfill the command. The task MUST be selected from the following options: \"question-answering-about-medical-domain\", \"summarization\", \"report-to-cxr-generation\", \"cxr-to-report-generation\", \"clinical-note-analysis\". If no task is suitable to fulfill the user's command, create a \"question-answering-about-medical-domain\" task. If the user's command does not require additional context or the input already contains sufficient context, the context should be an empty object. DO NOT recreate any task that has already been completed and has produced a result.";
  
  const functionCallingModel = openai.bind({
    functions: [
      {
        name: "task_planner",
        description: "Parses user input to tasks",
        parameters: jsonSchema,
      },
    ],
    function_call: { name: "task_planner" },
  });

  const outputParser = new JsonOutputFunctionsParser();
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", fullPrompt],
    new MessagesPlaceholder("history"),
    ["system", "Now you have the user's request, analyze it carefully and plan your task in JSON format to fit the form I described above. Pay attention to the input and output types of tasks and the context required."],
    ["human", "{user_input}"],
  ]);

  const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

  const withHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: (sessionId) =>
      new UpstashRedisChatMessageHistory({
        sessionId,
        config: {
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        },
      }),
    inputMessagesKey: "user_input",
    historyMessagesKey: "history",
  });

  const response = await withHistory.invoke(
    { user_input: `${userInput} ${fileURL}` },
    { configurable: { sessionId: sessionId } }
  );

  const taskResponse: TaskResponse = response as TaskResponse;

  console.log("taskResponse:", taskResponse);

  return taskResponse;
}
