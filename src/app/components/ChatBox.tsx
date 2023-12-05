"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import {
  PaperAirplaneIcon,
  ArrowUpOnSquareIcon,
  XMarkIcon,
  PencilSquareIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../chat/[threadId]/LoadingSpinner";
// import FileInfoModal from "./FileInfoModal";

type Props = {
  threadId: string | null;
  isFileAttachEnabled?: boolean;
  isFirstQuery: boolean;
  rows?: number;
  query?: string;
  mode?: "edit" | "create";
  userId: string;
  userImageURL?: string;
  // editQuery: (oldMessageId: string, newMessageId: string, newQuery: string, newFile: File | undefined) => void;
};

export default function ChatBox({
  isFileAttachEnabled = false,
  rows = 6,
  query = "",
  userId,
  threadId,
  userImageURL,
}: Props) {
  const [editable, setEditable] = useState(query === "");
  const [files, setFiles] = useState<File[]>([]);
  const [isFileInfoModalOpen, setIsFileInfoModalOpen] = useState(false);
  const [textInput, setTextInput] = useState(query);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isRequesting, setIsRequesting] = useState(false); // TODO: use this to show loading spinner
  const { push } = useRouter();

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
  };

  const changeTextInput = (e: any) => {
    setTextInput(e.target.value);
  };

  const uploadFile = async (file: File | null) => {
    if (!file) {
      return;
    }
    const requestBody = new FormData();
    requestBody.append("file", file);
    const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/upload`, {
      method: "POST",
      body: requestBody,
    });
    const json = await req.json();
    console.log(json);
    return json;
  };

  const fetchChatPlan = async () => {
    // const imageFileName = await getImageFileName(
    //   files.length > 0 ? files[0] : null
    // );

    const fileNames = await Promise.all(
      files.map(async (file) => {
        return await uploadFile(file);
      })
    );

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        user_input: textInput,
        ...(files.length > 0 && { file_inputs: [...fileNames] }),
        ...(threadId && { thread_id: threadId }),
      }),
    });

    if (!res.ok) {
      console.log(res);
      throw new Error("[ChatBox] Failed to send a query");
    }

    return res.json();
  };

  const sendQuery = async () => {
    setIsRequesting(true);
    const json: ChatInfo = await fetchChatPlan();
    setIsRequesting(false);

    const newthreadId = json.thread.id;
    push(`/chat/${newthreadId}`);
  };

  useEffect(() => {
    textAreaSizeFitToContent();
  }, [editable]);

  return (
    <div className="flex flex-col border-kaistlightblue border bg-white rounded-2xl px-8 pt-4 pb-4 w-full shadow-solid shadow-black leading-7 lg:leading-8">
      <div className="text-xs font-bold my-2">YOUR QUESTION</div>
      {userImageURL && (
        <div className="my-4 w-full">
          <img
            src={userImageURL}
            alt="user image"
            className="w-5/6 max-h-96 object-contain mx-auto"
          />
        </div>
      )}
      {editable ? (
        <textarea
          className={classNames(
            "w-full resize-none outline-none border-none prose lg:prose-lg"
          )}
          placeholder=""
          rows={rows}
          onChange={(e) => {
            textAreaAutoResize(e);
            changeTextInput(e);
          }}
          ref={textAreaRef}
          value={textInput}
        />
      ) : (
        <div className="w-full resize-none outline-none border-none">
          <p className="whitespace-pre-line prose lg:prose-lg">{query}</p>
        </div>
      )}
      <div className="w-full flex justify-between">
        {isFileAttachEnabled && (
          <div className="flex items-center text-sm gap-2">
            <p className="mr-4 font-medium">Files</p>
            <FileDropZone
              files={files}
              setFiles={setFiles}
              setIsFileInfoModalOpen={setIsFileInfoModalOpen}
            />
            {/* {isFileInfoModalOpen && (
              <FileInfoModal onClose={closeFileInfoModal} />
            )} */}
          </div>
        )}
        <div className="flex-1"></div>
        {isRequesting ? (
          <div className="rounded-full flex items-center justify-center p-3">
            <LoadingSpinner />
          </div>
        ) : (
          <div
            className="rounded-full flex items-center p-3 hover:bg-kaistblue hover:text-white transition ease-in-out cursor-pointer"
            onClick={() => sendQuery()}
          >
            {editable ? (
              <PaperAirplaneIcon width="24" />
            ) : (
              <PencilSquareIcon width="24" />
            )}
          </div>
        )}
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
  const onDrop = useCallback((_acceptedFiles: File[]) => {
    setFiles(_acceptedFiles);
    setIsFileInfoModalOpen(true);
  }, []);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".png"],
      "text/*": [".txt"],
      "application/x-npy": [".npy"],
    },
    multiple: true,
  });

  const deleteFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

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
    <div className="w-full flex flex-row gap-4">
      {files.map((file, index) => (
        <div
          key={file.name}
          className="flex items-center gap-2 max-w-[280px] shadow-solid rounded-md px-2 py-1 border border-black"
        >
          <div className="flex-shrink-0">
            <PhotoIcon width="20" color="#D37A47" />
          </div>
          <p className="text-sm truncate">{file.name}</p>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full transition ease-in-out"
            onClick={() => {
              deleteFile(file.name);
            }}
          >
            <XMarkIcon width="16" />
          </button>
        </div>
      ))}
    </div>
  );
}
