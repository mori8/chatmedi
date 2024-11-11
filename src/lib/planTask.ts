import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from "dotenv";
import { fetchChatHistory } from "./redis";
import { isUserMessage } from "@/utils/utils";

dotenv.config();

export async function planTask(
  userId: string,
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

  const fullPrompt = `You are a medical AI task router. Analyze user requests and select the most appropriate task from: "question-answering-about-medical-domain", "summarization", "report-to-cxr-generation", "cxr-to-report-generation", "clinical-note-analysis".

Output Format:
{{
  "task": string,  // Selected medical AI task
  "context": {{
    "file"?: string,  // URL/file from previous messages (if needed)
    "text"?: string   // Text from previous messages (if needed)
  }}
}}

Context Definition:
- Context holds information from previous messages that is REQUIRED to complete the current request
- If the current question refers to or requires information shared earlier (like clinical notes, images, or documents), that content MUST be included in the context
- Context should NOT include the current message's content
- Context should be empty ({{}} ) ONLY if all necessary information is contained within the current message

Examples of Context Usage:

1. Previous content reference:
Current msg: "What's the patient's blood pressure trend?"
Previous msg: [Contains clinical note with BP readings]
Output: {{
  "task": "clinical-note-analysis",
  "context": {{
    "text": "[Full clinical note content from previous message]"
  }}
}}

2. Follow-up question:
Current msg: "Could you explain more about the lung condition?"
Previous msg: [Contains X-ray URL]
Output: {{
  "task": "cxr-to-report-generation",
  "context": {{
    "file": "https://hospital-system.com/xray123.jpg"
  }}
}}

3. Question about shared document:
Current msg: "What are the key findings?"
Previous msg: [Contains clinical research paper]
Output: {{
  "task": "summarization",
  "context": {{
    "text": "[Full content of the research paper]"
  }}
}}

Context Search Rules:
1. ALWAYS include full content from previous messages if it's needed to answer the current question
2. For clinical notes, include the ENTIRE note if the question requires any part of it
3. For files/URLs, include the complete reference
4. Never use placeholder text - use actual content from history
5. Never include content from the current message
6. Include context if the current message refers to or asks about:
   - Previously shared clinical notes
   - Previously shared images
   - Previous test results
   - Previous diagnoses
   - Previous documents

Task Selection Priority:
1. If current message or history contains image URL → cxr-to-report-generation
2. If requesting X-ray generation → report-to-cxr-generation
3. If analyzing clinical data/notes → clinical-note-analysis
4. If document summary needed → summarization
5. Default to question-answering-about-medical-domain`;

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

  // Fetch the chat history using fetchChatHistory
  const history = await fetchChatHistory(userId, sessionId); // `userId_placeholder`와 `sessionId`가 필요합니다

  const formattedHistory = history.map((message) =>
    isUserMessage(message)
      ? new HumanMessage(message.prompt.text)
      : new AIMessage(JSON.stringify(message.response))
  );

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", fullPrompt],
    new MessagesPlaceholder("my_history"),
    ["system", "Analyze the user's request and previous conversation history to determine the appropriate task and context."],
    ["human", "{user_input}"],
  ]);

  // Create the chain with the formatted history
  const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

  // Inject history directly
  const response = await chain.invoke({
    user_input: `${userInput} ${fileURL}`,
    my_history: formattedHistory,
  });

  const taskResponse: TaskResponse = response as TaskResponse;

  console.log("taskResponse:", taskResponse);

  return taskResponse;
}
