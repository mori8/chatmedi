// lib/langchainUtils.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GENERATED_TOKEN = "<GENERATED>";

function parseTasks(tasksStr: string): Task[] {
  if (tasksStr === "[]") {
    throw new Error("Task string empty, cannot parse");
  }
  const { tasks } = JSON.parse(tasksStr);
  console.log("[/parseTasks] tasks:", tasks)
  return fixDependencies(tasks);
}

function fixDependencies(tasks: Task[]): Task[] {
  return tasks.map(task => {
    task.dep = inferDepsFromArgs(task);
    return task;
  });
}

function inferDepsFromArgs(task: Task): number[] {
  const deps = Object.values(task.args)
    .filter(value => value.includes(GENERATED_TOKEN))
    .map(value => parseTaskId(value));

  return deps.length ? Array.from(new Set(deps)) : [-1];
}

function parseTaskId(resourceStr: string): number {
  return parseInt(resourceStr.split("-")[1], 10);
}

async function loadJSON(filePath: string): Promise<any> {
  const fullPath = path.join(process.cwd(), filePath);
  const data = await fs.promises.readFile(fullPath, 'utf8');
  return JSON.parse(data);
}

export async function planTasks(userInput: string, history: ConversationHistory): Promise<Task[]> {

  const openai = new ChatOpenAI({
    modelName: 'gpt-4o',
    stop: ["<im_end>"]
  });

  const zodSchema = z.object({
    tasks: z.array(z.object({
      task: z.enum(["visual-question-answering-about-medical-domain", "question-answering-about-medical-domain", "text-to-image", "medical-image-segmentation"]),
      id: z.string(),
      dep: z.array(z.string()).optional(),
      args: z.object({
        text: z.string().optional(),
        image: z.string().optional(),
      })
    })).describe("List of tasks")
  });

  const jsonSchema = zodToJsonSchema(zodSchema);

  const template = await loadJSON('src/prompts/task-planning-few-shot-prompt.json');
  const examples = await loadJSON(template.examples);

  const examplePrompts = examples.map((example: { example_input: string, example_output: string }) => 
    template.example_prompt_path
      .replace('{example_input}', example.example_input)
      .replace('{example_output}', example.example_output)
  ).join('\n');

  const historyText = history.messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

  const fullPrompt = `${template.prefix}\n${examplePrompts}\n${template.suffix.replace('{history}', historyText)}`;

  const functionCallingModel = openai.bind({
    functions: [{
      name: "task_planner",
      description: "Parses user input to tasks",
      parameters: jsonSchema
    }],
    function_call: { name: "task_planner" }
  });

  const outputParser = new JsonOutputFunctionsParser();
  const chain = new ChatPromptTemplate({
    promptMessages: [
      SystemMessagePromptTemplate.fromTemplate(fullPrompt)
    ],
    inputVariables: ["user_input"],
  }).pipe(functionCallingModel).pipe(outputParser);

  const response = await chain.invoke({ user_input: userInput });
  console.log("response:", response);

  const tasksStr = JSON.stringify(response);
  console.log("tasksStr:", tasksStr);
  
  return parseTasks(tasksStr);
}