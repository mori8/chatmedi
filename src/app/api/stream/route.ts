import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

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
        // Send the planned_task part
        await sendData({
          planned_task: [
            {
              task: "question-answering-about-medical-domain",
              id: 1,
              dep: [-1],
              args: {
                text: "Tell me the difference between pneumonia and pleural effusion",
              },
            },
          ],
        });
        await delay(1000);

        // Send the selected_model part
        await sendData({
          selected_model: {
            model: "your_model_name",
            reason: "your_reason",
          },
        });
        await delay(1000);

        // Send the output_from_model part
        await sendData({
          output_from_model: [{
            model_name: "your_model_name",
            input: "Tell me the difference between pneumonia and pleural effusion",
            text: "넹",
            file: ""
          },]
        });
        await delay(1000);

        // Send the final_response part and close the stream
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`;
        const response = await fetch(url, {
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
        const data = await response.json();
        const aiFinalResponse = data.response;
        // 여기서 aiFinalResponse는 단순 문자열
        await sendData({
          final_response: {
            text: aiFinalResponse,
          },
        }); 

        // Close the stream and save the response to Redis
        controller.close();
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
