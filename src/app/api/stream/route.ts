import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const TasksHandledByDefaultLLM = [
  "question-answering-about-medical-domain",
  "summarization"
];

export async function POST(req: NextRequest) {
  const { userId, chatId, prompt } = await req.json();
  // Initialize ChatMediResponse object
  const chatMediResponse: ChatMediResponse = {};
  console.log("[stream/route.ts]: ", userId, chatId, prompt);
  const stream = new ReadableStream({
    start(controller) {
      // Helper function to send data in chunks
      const sendData = async (data: object) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(data) + "\n")
        );
        // Append data to chatMediResponse object
        Object.assign(chatMediResponse, data);
      };

      // Function to simulate delay
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      (async () => {
        try {
          // Send the planned_task part
          const plannedTaskData = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/plan-task`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: prompt,
              sessionId: chatId,
            }),
          });
          const { tasks } = await plannedTaskData.json();
          console.log("[stream/route.ts]: tasks", JSON.stringify(tasks));

          await sendData({
            planned_task: tasks,
          });

          // Check if the task should be handled by the default LLM
          let selected_models;
          if (tasks.length === 1 && TasksHandledByDefaultLLM.includes(tasks[0].task)) {
            selected_models = {
              "1": {
                id: "none",
                reason: "none"
              }
            };
          } else {
            // Send the output_from_model part
            const modelSelectionRequest: ModelSelectionRequest = {
              user_input: prompt,
              tasks: tasks,
            };

            const modelSelectionResponse = await fetch('http://localhost:8000/select-model', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(modelSelectionRequest),
            });

            if (!modelSelectionResponse.ok) {
              throw new Error(`HTTP error! ${JSON.stringify(modelSelectionResponse)}`);
            }

            const { selected_models: selectedModelsResponse } = await modelSelectionResponse.json();
            selected_models = selectedModelsResponse;
          }

          await sendData({
            selected_model: selected_models,
          });

          if (selected_models["1"].id !== "none") {
            // Send the output_from_model part
            const modelExecutionResponse = await fetch('http://localhost:8000/execute-tasks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_input: prompt, tasks, selected_models }),
            });

            if (!modelExecutionResponse.ok) {
              throw new Error(`HTTP error! ${JSON.stringify(modelExecutionResponse)}`);
            }

            const modelExecutionData = await modelExecutionResponse.json();
            await sendData({
              output_from_model: modelExecutionData,
            });

            // Note: Additional logic for final response if modelExecutionResponse is executed
          }

          // Send the final_response part and close the stream
          const finalResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              prompt: prompt,
              chatId: chatId,
            }),
          });
          const data = await finalResponse.json();
          const aiFinalResponse = data.response;
          // 여기서 aiFinalResponse는 단순 문자열
          await sendData({
            final_response: {
              text: aiFinalResponse,
            },
          });

          // Close the stream and save the response to Redis
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
