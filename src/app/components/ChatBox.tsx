"use client";

import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

import {
  PaperAirplaneIcon,
  ArrowUpOnSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";

type Props = {
  isFileAttachEnabled?: boolean;
  rows?: number;
  query?: string;
  getQuery: (text: string) => void;
};

export default function ChatBox({
  isFileAttachEnabled = false,
  rows = 6,
  query = "",
}: Props) {
  const [editable, setEditable] = useState(query === "");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const textAreaAutoResize = (e: any) => {
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const textAreaSizeFitToContent = () => { 
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }

  useEffect(() => {
    textAreaSizeFitToContent();
  }, [editable]);

  const sendQuery = () => {
    // TODO: send query to server
  };

  return (
    <div className="flex flex-col border-mint border bg-white rounded-2xl px-8 pt-4 pb-4 w-full shadow-solid shadow-black leading-7 lg:leading-8">
      {editable ? (
        <textarea
          className={classNames("w-full resize-none outline-none border-none")}
          placeholder=""
          rows={rows}
          onChange={(e) => {
            textAreaAutoResize(e);
          }}
          ref={textAreaRef}
        >
          {query}
        </textarea>
      ) : (
        <div className="w-full resize-none outline-none border-none">
          <p className="whitespace-pre-line">{query}</p>
        </div>
      )}
      <div className="w-full flex justify-between">
        {isFileAttachEnabled && (
          <div className="flex items-center text-sm gap-2">
            <p className="mr-4 font-medium">Files</p>
            <Button
              onClick={() => {}}
              size="sm"
              color="mint"
              shadowColor="black"
            >
              <ArrowUpOnSquareIcon width="20" />
              Click to upload
            </Button>
            <p>or drag & drop a file here</p>
          </div>
        )}
        <div className="flex-1"></div>
        <div
          className="rounded-full flex items-center p-3 hover:bg-turquiose hover:text-white transition ease-in-out cursor-pointer"
          onClick={() => {
            setEditable(!editable);
          }}
        >
          {editable ? (
            <PaperAirplaneIcon width="24" />
          ) : (
            <PencilSquareIcon width="24" />
          )}
        </div>
      </div>
    </div>
  );
}
