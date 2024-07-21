import { NextRequest, NextResponse } from "next/server";
import { TasksHandledByDefaultLLM } from "@/utils/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("[stream/route.ts]: POST called");
  const formData = await req.formData();
  const userId = formData.get("userId") as string;
  const chatId = formData.get("chatId") as string;
  const prompt = formData.get("prompt") as string;
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
      // TODO: plan-task에서 이미지 파일을 처리할 수 있도록 수정
      // TODO: 백엔드에서는 이미지 URL을 받아서 처리하도록 수정
      (async () => {
        try {
          const plannedTaskData = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/plan-task`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: prompt,
                fileURL: fileURL,
                sessionId: chatId,
              }),
            }
          );
          const { tasks } = await plannedTaskData.json();
          console.log("[stream/route.ts]: tasks", JSON.stringify(tasks));

          await sendData({
            planned_task: tasks,
          });

          let selectedModels: { [key: number]: SelectedModel };

          if (
            tasks.length === 1 &&
            TasksHandledByDefaultLLM.includes(tasks[0].task)
          ) {
            selectedModels = {
              "0": {
                id: "none",
                reason: "none",
              },
            };

            await sendData({
              selected_model: selectedModels,
            });

            const finalResponse = await fetch(
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
                }),
              }
            );
            const { response } = await finalResponse.json();
            
            await sendData({
              final_response: {
                text: response,
              },
            });
          } else {
            const modelSelectionResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/select-model`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_input: prompt,
                  tasks: tasks,
                }),
              }
            );

            const { selected_models: selectedModelsResponse, prompt: userInput } = await modelSelectionResponse.json();
            selectedModels = selectedModelsResponse;
            console.log("[stream/route.ts]: selectedModels: ", selectedModels);
            
            await sendData({
              prompt: userInput,
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
                  tasks: tasks,
                  selected_models: selectedModels,
                }),
              }
            );

            const modelExecutionData = await modelExecutionResponse.json();
            await sendData({
              output_from_model: modelExecutionData,
            });
            console.log("[stream/route.ts]: modelExecutionData", modelExecutionData);
            const TaskSummaries = modelExecutionData.map(
              (executionItem: any) => {
                const taskId = executionItem.task.id.toString();
                if (selectedModels[taskId]) {
                  executionItem.model = selectedModels[taskId];
                }
                return executionItem;
              }
            );

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
                })
              }
            );
            const { response } = await finalResponse.json();
            
            await sendData({
              final_response: {
                text: response,
              },
            });
          }

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
