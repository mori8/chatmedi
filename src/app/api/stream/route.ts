import { NextRequest, NextResponse } from "next/server";
import { isHaveToBeHandledByDefaultLLM } from "@/utils/utils";

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

          const planTaskResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/plan-task`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                prompt: prompt,
                sessionId: chatId,
                fileURL: fileURL || "",
              }),
            }
          );

          const task: TaskResponse = await planTaskResponse.json();

          await sendData({
            planned_task: task,
          });

          const modelSelectionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/select-model`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                task: task.task,
                context: task.context,
                user_input: `${prompt} ${fileURL}`,
              }),
            }
          );

          const selectedModel = await modelSelectionResponse.json();
          console.log("[stream/route.ts]: selectedModels: ", selectedModel);

          await sendData({
            selected_model: selectedModel,
          });

          if (isHaveToBeHandledByDefaultLLM(selectedModel.task) || selectedModel.input_args.error) {
            const chatResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: userId,
                  prompt: prompt,
                  chatId: chatId,
                  error: selectedModel.input_args.error,
                }),
              }
            );

            const chatData = await chatResponse.json();
            const { response } = chatData;

            await sendData({
              final_response: {
                text: response,
              },
            });

            controller.close();
            return;
          }

          const modelExecutionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/execute-model`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(selectedModel),
            }
          );

          const { inference_result: inferenceResult } = await modelExecutionResponse.json();

          // inferenceResult:
          // {
          //   "inference_result": {
          //       "image": "https://chatmedi-s3.s3.ap-northeast-2.amazonaws.com/a377d40d-b06f-4e12-8108-8a9bbce35bba.png",
          //       "text": ""
          //   }
          // }
          
          await sendData({
            inference_result: inferenceResult,
          });

          console.log(
            "[stream/route.ts]: inferenceResult",
            inferenceResult
          );

          const finalReport = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/final-report`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                session_id: chatId,
                selected_model: selectedModel,
                inference_result: inferenceResult,
              }),
            }
          );
          const { report } = await finalReport.json();

          await sendData({
            final_response: {
              text: report,
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
