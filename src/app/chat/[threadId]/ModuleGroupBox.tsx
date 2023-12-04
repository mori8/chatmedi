import ModelIconWithModal from "./ModelIconWithModal";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

import { randomBGColor } from "@/utils/utils";
import { hash } from "@/utils/utils";
import classNames from "classnames";

type Props = {
  name?: string;
  cardURL?: string;
  query?: string;
  answer?: string;
  moduleName?: string;
  moduleDescription?: string;
};

export default function ModuleGroupBox({
  name,
  cardURL,
  query,
  answer,
  moduleDescription,
}: Props) {
  const [moduleName, modelName] = name?.split(".") || ["", ""];

  return (
    <div className="flex flex-row gap-4 bg-kaistlightblue bg-opacity-10 px-8 py-5 rounded-2xl text-base box-border">
      <div className="flex flex-col items-end">
        <div className="mb-3 text-slate-800 font-semibold">Query:</div>
        <div className="text-slate-700">AI:</div>
      </div>
      <div>
        <div className="mb-3 text-slate-800 font-semibold">
          <p className="">{query}</p>
        </div>
        <div className="flex flex-wrap content-start relative"></div>
        <div>
          {answer ? (
            <p className="text-slate-800">{answer}</p>
          ) : (
            <div className="flex space-x-2 justify-center items-center bg-white h-screen dark:invert">
              <span className="sr-only">Loading...</span>
              <div className="h-8 w-8 bg-kaistlightblue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-8 w-8 bg-kaistlightblue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-8 w-8 bg-kaistlightblue rounded-full animate-bounce"></div>
            </div>
          )}
          <p className="flex flex-row items-center text-xs mt-4 text-slate-600">
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
      </div>
    </div>
  );
}
