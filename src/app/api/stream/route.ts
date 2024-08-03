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

        //   selectedModel:
        //   {
        //     "id": "llm-dxr",
        //     "reason": "This model is specifically designed for chest X-ray image understanding and generation tasks, including report-to-CXR generation which matches the given task. It is described as an instruction-finetuned LLM, suggesting it can handle complex text inputs like the provided radiology report. The model also supports multiple CXR-related tasks, indicating a more comprehensive understanding of chest X-ray imagery. While both models support the required task, the BISPL-KAIST/llm-cxr model appears to be more specialized and versatile for medical imaging tasks.",
        //     "task": "report-to-cxr-generation",
        //     "input_args": {
        //         "instruction": "Generate a report based on the given chest X-ray image.",
        //         "input": "Bilateral, diffuse, confluent pulmonary opacities. Differential diagnoses include severe pulmonary edema ARDS or hemorrhage."
        //     }
        // }

          console.log("[stream/route.ts]: selectedModels: ", selectedModel);

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
            output_from_model: inferenceResult,
          });

          console.log(
            "[stream/route.ts]: inferenceResult",
            inferenceResult
          );

          const finalReport = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/final-resport`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_input: prompt,
                selected_model: selectedModel,
                inference_result: inferenceResult,
              }),
            }
          );
          const { result } = await finalReport.json();

          await sendData({
            final_response: {
              text: result,
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
