// import ModelIconWithModal from "./ModelIconWithModal";
import { Tooltip } from "react-tooltip";
import { useState, useEffect } from "react";

import MiniFileBox from "@/app/components/MiniFileBox";

type Props = {
  name?: string;
  cardURL?: string;
  input?: string;
  files?: (string | undefined)[];
  answer?: string;
  moduleName?: string;
  moduleDescription?: string;
};

export default function ModuleGroupBox({
  name,
  cardURL,
  input,
  files,
  answer,
  moduleDescription,
}: Props) {
  const [moduleName, modelName] = name?.split(".") || ["", ""];
  console.log("moduleGroupBox: ", files);

  return (
    <div className="flex flex-col bg-slate-200 bg-opacity-60 px-8 py-6 rounded-2xl text-base w-full shadow-solid shadow-black">
      <div className="flex flex-row gap-4 items-center mb-4">
        <div className="flex-shrink-0 w-12 text-xs font-semibold">
          <span className="bg-slate-50 text-slate-500 rounded py-1 px-2 box-border">
            Input
          </span>
        </div>
        <div className="flex-1 flex-row">
          {files && (
            <div className="flex flex-row gap-2">
              {files
                .filter(
                  (file) => file !== undefined && file !== null && file !== ""
                )
                .map((file) => (
                  <MiniFileBox
                    key={file}
                    fileName={file}
                    deleteEnabled={false}
                  />
                ))}
              <p className="text-slate-800">{input}</p>
            </div>
          )}
          {!files && input && <p className="text-slate-800">{input}</p>}
        </div>
      </div>
      <div className="flex flex-row gap-4 items-center mb-2">
        <div className="flex-shrink-0 w-12 text-xs font-semibold">
          <span className="bg-slate-50 text-slate-500 rounded py-1 px-2 box-border">
            AI
          </span>
        </div>
        <div className="flex-1">
          {answer ? (
            <p className="text-slate-800">{answer}</p>
          ) : (
            <div className="w-full flex items-center justify-center my-2">
              <SimpleLoading />
            </div>
          )}
        </div>
      </div>
      <p className="flex flex-row items-center text-xs mt-4 text-slate-500">
        created by &nbsp;
        <div className="">
          <p className="font-medium uppercase">
            {moduleName && (
              <span
                className="bg-kaistlightblue bg-opacity-20 rounded-md px-2 py-1 text-kaistdarkblue mr-2 text-xs"
                data-tooltip-id="module-desc"
                data-tooltip-content={moduleDescription}
              >
                {moduleName}
              </span>
            )}
            {modelName}
          </p>
          <Tooltip id="module-desc" />
        </div>
      </p>
    </div>
  );
}

const SimpleLoading = () => (
  <div className="flex space-x-2 justify-center items-center">
    <div className="h-2 w-2 bg-kaistlightblue bg-opacity-30 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="h-2 w-2 bg-kaistlightblue bg-opacity-30 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="h-2 w-2 bg-kaistlightblue bg-opacity-30 rounded-full animate-bounce" />
    <span className="text-sm text-slate-500 ml-4">Generating ...</span>
  </div>
);
