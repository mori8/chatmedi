import React, { useEffect, useState } from "react";

interface ModalProps {
  onClose: () => void;
  prompt: string | undefined;
  task: string | undefined;
  context: any;
  currentModelId: string | undefined;
  fetchReStreamResponse: (
    prompt: string,
    task: string,
    modelSelectedByUser: string,
    context: any
  ) => void;
}

const ModelSwappingModal: React.FC<ModalProps> = ({
  onClose,
  task,
  prompt,
  currentModelId,
  context,
  fetchReStreamResponse,
}) => {
  const [alternativeModels, setAlternativeModels] = useState<string[]>([]);
  // TODO: 이미 재생성된 답변에 대해서도 모델 변경이 가능하도록 구현
  useEffect(() => {
    if (task) {
      const fetchAlternativeModels = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/available-models?task=${task}`
          );
          if (response.ok) {
            const models = await response.json();
            setAlternativeModels(models);
          } else {
            console.error("Failed to fetch alternative models");
          }
        } catch (error) {
          console.error("Error fetching alternative models:", error);
        }
      };

      fetchAlternativeModels();
    }
  }, [task]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("modal-overlay")) {
        onClose();
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [onClose]);

  if (!task || !currentModelId || !prompt) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full flex flex-col">
        <h2 className="text-xl font-semibold mb-1 mt-0">
          Select Alternative Model
        </h2>
        <p className="text-sm mb-4 text-slate-600">
          Here you can choose another model to process{" "}
          <span className="font-bold">{task}</span> task.
        </p>
        <div className="flex flex-col gap-2">
          {alternativeModels.map((model) => (
            <div
              key={model}
              className="flex items-center justify-between pl-3 pr-2 py-2 text-sm bg-slate-100 rounded-xl"
            >
              <span className="leading-4">{model}</span>
              {model === currentModelId ? (
                <span className="text-xs text-slate-400 px-3 py-2 rounded-xl flex-shrink-0">
                  current model
                </span>
              ) : (
                <button
                  className="text-xs bg-xanthous text-white px-3 py-2 rounded-xl flex-shrink-0"
                    onClick={() => {
                    // TODO: 수정필요, prompt 넣어도됨?
                    fetchReStreamResponse(prompt, task, model, context);
                  }}
                >
                  rerun with this model
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-slate-200 text-slate-600 px-4 py-2 rounded-xl self-end"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModelSwappingModal;
