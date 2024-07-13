// lib/langchainUtils.ts
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis"; // 필요한 메시지 스토어 사용
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const GENERATED_TOKEN = "<GENERATED>";

function parseTasks(tasksStr: string): Task[] {
  if (tasksStr === "[]") {
    throw new Error("Task string empty, cannot parse");
  }
  const { tasks } = JSON.parse(tasksStr);
  console.log("[/parseTasks] tasks:", tasks);
  return fixDependencies(tasks);
}

function fixDependencies(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    task.dep = inferDepsFromArgs(task);
    return task;
  });
}

function inferDepsFromArgs(task: Task): number[] {
  const deps = Object.values(task.args)
    .filter((value) => value.includes(GENERATED_TOKEN))
    .map((value) => parseTaskId(value));

  return deps.length ? Array.from(new Set(deps)) : [-1];
}

function parseTaskId(resourceStr: string): number {
  return parseInt(resourceStr.split("-")[1], 10);
}

async function loadJSON(filePath: string): Promise<any> {
  const fullPath = path.join(process.cwd(), filePath);
  const data = await fs.promises.readFile(fullPath, "utf8");
  return JSON.parse(data);
}

export async function planTasks(
  userInput: string,
  sessionId: string
): Promise<Task[]> {
  const openai = new ChatOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    modelName: "gpt-4o",
    stop: ["<im_end>"],
  });

  const zodSchema = z.object({
    tasks: z
      .array(
        z.object({
          task: z.enum([
            "question-answering-about-medical-domain",
            "summarization",
            "report-to-cxr-generation",
            "cxr-to-report-generation",
            "cxr-visual-qestion-answering"
          ]),
          id: z.number(),
          dep: z.array(z.number()),
          args: z.object({
            text: z.string().optional(),
            image: z.string().optional(),
          }),
        })
      )
      .describe("List of tasks"),
  });

  const jsonSchema = zodToJsonSchema(zodSchema);

  const template = await loadJSON(
    "src/prompts/task-planning-few-shot-prompt.json"
  );
  const exampleTemplate = await loadJSON(template.example_prompt_path);
  const examples = await loadJSON(template.examples);

  const examplePrompts = examples
    .map((example: { example_input: string; example_output: string }) =>
      exampleTemplate.template
        .replace("{example_input}", example.example_input)
        .replace("{example_output}", example.example_output)
    )
    .join("\n");

  const fullPrompt = `${template.prefix}.\n Here are several cases for your reference. Use these references only to help you know which task to choose for which input. Never use the output of these examples verbatim: \n${examplePrompts}`;
  console.log("fullPrompt:", fullPrompt);

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
    ["system", "Now you have the user's request, analyze it carefully and plan your task in JSON format to fit the form I described above. Pay attention to the input and output types of tasks and the dependencies between tasks."],
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
    { user_input: userInput },
    { configurable: { sessionId: sessionId } }
  );

  const tasksStr = JSON.stringify(response);
  console.log("tasksStr:", tasksStr);

  return parseTasks(tasksStr);
}
