"use client";

import React, { useState } from "react";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
import LoadingDots from "@/components/LoadingDots";
import MarkdownWrapper from "@/components/MarkdownWrapper";
import { TasksHandledByDefaultLLM } from "@/utils/utils";
import classNames from "classnames";

const ModelSwappingModal = React.lazy(
  () => import("@/components/ModelSwappingModal")
);

interface ChatResponseProps {
  response: ChatMediResponse;
  messageId?: string;
  fetchReStreamResponse: (
    prompt: string,
    task: Task,
    modelSelectedByUser: string
  ) => void;
}

const isNeedToHandleTask = (tasks: Task[]) => {
  return !(
    tasks.length === 1 && TasksHandledByDefaultLLM.includes(tasks[0].task)
  );
};

const ChatResponse: React.FC<ChatResponseProps> = ({
  response,
  messageId,
  fetchReStreamResponse,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [currentModelId, setCurrentModelId] = useState<string | undefined>();

  return (
    <div className="p-2">
      {response.isRegenerated && (
        <div className="text-xs text-blue-400 font-bold bg-blue-100 px-2 py-1 inline-block rounded-lg border border-blue-200">
          REGENERATED RESPONSE
        </div>
      )}
      {response.planned_task && isNeedToHandleTask(response.planned_task) && (
        <div className="text-sm">
          <p className="m-0 text-slate-400">
            To handle your request, we need to tackle these tasks:
          </p>
          <div className="flex flex-row my-2 flex-wrap gap-2">
            {response.planned_task.map((task, index) => (
              <span
                className="m-0 py-1 px-2 rounded-xl bg-blue-50 border border-blue-200 text-slate-600 font-semibold flex-shrink-0"
                key={index}
              >
                {task.task}
              </span>
            ))}
          </div>
        </div>
      )}
      {response.selected_model && response.selected_model["0"].id !== "none" ? (
        <div className="mt-4 text-sm">
          <p className="m-0 text-slate-400">I found an appropriate model!</p>
          {Object.entries(response.selected_model).map(([key, model]) => (
            <div
              key={key}
              className="bg-slate-100 my-2 px-4 py-3 rounded-xl leading-snug flex flex-row items-start justify-between"
            >
              <div className="flex-1">
                <p className="m-0 mb-1 flex items-start gap-1">
                  <span className="w-14 flex-shrink-0">
                    <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500 inline-block">
                      Model
                    </span>
                  </span>
                  <span className="font-semibold">{model.id}</span>
                </p>
                <p className="m-0 flex items-start gap-1">
                  <span className="w-14 flex-shrink-0">
                    <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500 inline-block">
                      Reason
                    </span>
                  </span>
                  <span className="text-slate-500">{model.reason}</span>
                </p>
              </div>
              <div
                className={classNames("bg-white rounded-full p-1 cursor-pointer flex-shrink-0", {
                  "hidden": !messageId
                })}
                data-tooltip-id="alternative-models"
                data-tooltip-content="Show alternative models"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTask(response?.planned_task?.[0]);
                  setCurrentModelId(model.id);
                }}
              >
                <Tooltip id="alternative-models" />
                <SwatchIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        !response.selected_model && (
          <div className="mt-4 text-sm text-slate-400">
            I&apos;m looking for the right model to help you <LoadingDots />
          </div>
        )
      )}
      {response.selected_model &&
        response.selected_model["0"].id !== "none" &&
        (response.output_from_model ? (
          <div className="mt-4 text-sm">
            <p className="m-0 text-slate-400">Model run complete.</p>
            {response.output_from_model.map((output, index) => (
              <div
                key={index}
                className="my-2 px-4 py-3 rounded-xl bg-slate-100"
              >
                <p className="m-0 mb-2 text-slate-400 text-xs">
                  response from{" "}
                  <span className="ml-1 bg-slate-200 border border-slate-300 px-1 py-[2px] rounded text-slate-500">
                    {output.model.id}
                  </span>
                </p>
                <p className="m-0 mb-1">
                  <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500">
                    Input
                  </span>{" "}
                  {output.model_input.text
                    ? output.model_input.text
                    : output.model_input.image}
                </p>
                <p className="m-0">
                  <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500">
                    Output
                  </span>{" "}
                  {output.inference_result.text ? (
                    output.inference_result.text
                  ) : (
                    <span>
                      <a href={output.inference_result.image} className="text-slate-400" target="_blank">{output.inference_result.image}</a>
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          response.selected_model && (
            <div className="mt-4 text-sm text-slate-400">
              Executing model <LoadingDots />
            </div>
          )
        ))}
      {response.final_response ? (
        <div className="mt-2">
          <MarkdownWrapper markdown={response.final_response.text} />
        </div>
      ) : (
        response.selected_model &&
        response.selected_model["0"].id !== "none" &&
        response.output_from_model && (
          <div className="mt-4 text-sm text-slate-400">
            Generating a result based on the model’s output <LoadingDots />
          </div>
        )
      )}
      {isModalOpen && (
        <ModelSwappingModal
          onClose={() => setIsModalOpen(false)}
          prompt={response.prompt}
          task={selectedTask}
          currentModelId={currentModelId}
          fetchReStreamResponse={fetchReStreamResponse}
        />
      )}
    </div>
  );
};

export default ChatResponse;
