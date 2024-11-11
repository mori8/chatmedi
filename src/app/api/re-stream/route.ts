import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("[re-stream/route.ts]: POST called");
  const { prompt, context, task, modelSelectedByUser, chatId } = await req.json();

  // 기존 대화의 task -> 선택된 모델 사용 -> 모델 실행 결과 -> 최종 응답
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
            isRegenerated: true,
            prompt: prompt,
          });

          const selectedModelArgsData = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/model-args`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                model_id: modelSelectedByUser,
                task: task,
                context: context,
              }),
            }
          );

          const selectedModelArgs = await selectedModelArgsData.json();

          const selectedModel = {
            "id": modelSelectedByUser,
            "reason": "User selected this model",
            "task": task,
            "input_args": selectedModelArgs,
          }

          console.log("[re-stream/route.ts]: selectedModel: ", selectedModel);
          
          await sendData({
            selected_model: selectedModel,
          });

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
                session_id: req.headers.get("x-session-id"),
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
