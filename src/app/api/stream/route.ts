import { NextRequest, NextResponse } from "next/server";
import { TasksHandledByDefaultLLM } from "@/utils/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("[stream/route.ts]: POST called");
  const formData = await req.formData();
  const userId = formData.get("userId") as string;
  const chatId = formData.get("chatId") as string;
  const prompt = formData.get("prompt") as string;
  // fileURL: saveUserMessage에서 파일 -> S3에 저장한 후 생성되는 URL
  const fileURL = formData.get("fileURL") as string | null;

  console.log("[stream/route.ts]: ", userId, chatId, prompt);
  const chatMediResponse: ChatMediResponse = {};

  const stream = new ReadableStream({
    start(controller) {
      const sendData = async (data: object) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(data) + "\n")
        );
        // Append data to chatMediResponse object
        Object.assign(chatMediResponse, data);
      };
      (async () => {
        try {
          await sendData({
            isRegenerated: false,
            prompt: prompt,
          });

          const modelSelectionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/select-model`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: `${prompt} ${fileURL}`,
              }),
            }
          );

          const selectedModel = await modelSelectionResponse.json();

          console.log("[stream/route.ts]: selectedModels: ", selectedModel);

          await sendData({
            selected_model: modelSelectionResponse,
          });

          const modelExecutionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/execute-model`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                selected_model: selectedModel,
              }),
            }
          );

          const executionResult = await modelExecutionResponse.json();

          await sendData({
            output_from_model: executionResult,
          });
          console.log(
            "[stream/route.ts]: executionResult",
            executionResult
          );

          const finalResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/generate-response`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                execution_result: executionResult,
              }),
            }
          );
          const { response } = await finalResponse.json();

          await sendData({
            final_response: {
              text: response,
            },
          });

          controller.close();
        } catch (error) {
          console.error("[stream/route.ts] Error:", error);
          controller.error(error);
        }
      })();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}
