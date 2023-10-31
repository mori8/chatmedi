"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";

import {
  PaperAirplaneIcon,
  ArrowUpOnSquareIcon,
  XMarkIcon,
  PencilSquareIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import FileInfoModal from "./FileInfoModal";

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
  const [files, setFiles] = useState<File[]>([]);
  const [isFileInfoModalOpen, setIsFileInfoModalOpen] = useState(false);
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
  };

  const closeFileInfoModal = () => {
    setIsFileInfoModalOpen(false);
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
            {/* <Button
              onClick={() => {}}
              size="sm"
              color="mint"
              shadowColor="black"
            >
              <ArrowUpOnSquareIcon width="20" />
              Click to upload
            </Button>
            <p>or drag & drop a file here</p> */}
            <FileDropZone
              files={files}
              setFiles={setFiles}
              setIsFileInfoModalOpen={setIsFileInfoModalOpen}
            />
            {isFileInfoModalOpen && <FileInfoModal onClose={closeFileInfoModal} />}
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

function FileDropZone({
  files,
  setFiles,
  setIsFileInfoModalOpen,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  setIsFileInfoModalOpen: (isOpen: boolean) => void;
}) {
  // TODO: acceptedFiles -> File[] 맞는지 확인
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    setFiles(acceptedFiles);
    setIsFileInfoModalOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".png"],
    },
    maxFiles: 1,
  });

  return files.length === 0 ? (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex items-center justify-center w-full py-2 border-2 px-6 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpOnSquareIcon width="20" color="gray" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
          </div>
        </label>
      </div>
    </div>
  ) : (
    <div>
      {files.map((file) => (
        <div
          key={file.name}
          className="flex items-center gap-2 max-w-[280px] shadow-solid rounded-md px-2 py-1 border border-black"
        >
          <PhotoIcon width="20" color="#D37A47" />
          <p className="text-sm truncate">{file.name}</p>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full transition ease-in-out"
            onClick={() => {
              setFiles([]);
            }}
          >
            <XMarkIcon width="16" />
          </button>
        </div>
      ))}
    </div>
  );
}
