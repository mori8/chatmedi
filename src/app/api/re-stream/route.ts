import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("[re-stream/route.ts]: POST called");
  const { prompt, task, modelSelectedByUser } = await req.json();

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
          const selectedModels = {
            [task.id]: {
              id: modelSelectedByUser,
              reason: "User selected model",
            },
          };
          console.log("[re-stream/route.ts]: selectedModels: ", selectedModels);
          await sendData({
            selected_model: selectedModels,
          });

          const modelExecutionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/execute-tasks`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                tasks: [task],
                selected_models: selectedModels,
              }),
            }
          );

          const modelExecutionData = await modelExecutionResponse.json();
          await sendData({
            output_from_model: modelExecutionData,
          });
          console.log(
            "[re-stream/route.ts]: modelExecutionData",
            modelExecutionData
          );
          const TaskSummaries = modelExecutionData.map((executionItem: any) => {
            const taskId = executionItem.task.id.toString();
            if (selectedModels[taskId]) {
              executionItem.model = selectedModels[taskId];
            }
            return executionItem;
          });

          delete TaskSummaries.model_input;

          const finalResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/generate-response`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                task_summaries: TaskSummaries,
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
