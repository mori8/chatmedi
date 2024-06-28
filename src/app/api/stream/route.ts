import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export async function GET(req: NextRequest) {
  // Create a ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // Helper function to send data in chunks
      const sendData = async (data: object) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(data) + "\n")
        );
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
          output_from_model: {
            text: "기깔나네요",
          },
        });
        await delay(1000);

        // Send the final_response part and close the stream
        await sendData({
          final_response: {
            text: "Pneumonia and pleural effusion are both serious conditions affecting the respiratory system, but they differ significantly in terms of their underlying pathology, causes, symptoms, diagnosis, and treatment.",
          },
        });

        // Close the stream
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
