"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  ArrowUpOnSquareIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  isFetching: boolean;
};

function ChatTextArea({ content, setContent, handleSubmit, setFile, isFetching }: Props) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setFile(e.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setFile(null);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAndResetHeight();
    }
  };

  const submitAndResetHeight = useCallback(() => {
    if (content.trim() === "") return;
    handleSubmit();
    setContent("");
    handleFileRemove(); // Clear the uploaded file after submission
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [content, handleSubmit, setContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col items-start border-2 border-palatinate rounded-2xl p-3 w-full gap-4">
        {uploadedFile && (
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl p-2 mb-2">
            <span className="text-sm text-gray-700">{uploadedFile.name}</span>
            <XCircleIcon
              width={20}
              height={20}
              className="text-gray-500 cursor-pointer ml-2"
              onClick={handleFileRemove}
            />
          </div>
        )}
        <div className="flex flex-row w-full gap-4 items-start">
          <label htmlFor="file-upload" className={isFetching ? "cursor-not-allowed" : "cursor-pointer"}>
            <ArrowUpOnSquareIcon
              width={24}
              height={24}
              className={`text-slate-900 ${isFetching ? "opacity-50" : ""}`}
            />
            <input
              id="file-upload"
              type="file"
              accept=".jpg,.png,.jpeg"
              className="hidden"
              onChange={handleFileChange}
              disabled={isFetching}
            />
          </label>
          <textarea
            ref={textareaRef}
            className="flex-1 outline-none resize-none overflow-auto"
            placeholder={isFetching ? "Analyzing..." : "Ask me a question!"}
            value={content}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            rows={1}
            style={{ minHeight: "16px", maxHeight: "200px" }}
            disabled={isFetching}
          />
          <PaperAirplaneIcon
            width={24}
            height={24}
            className={`text-slate-900 cursor-pointer ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={submitAndResetHeight}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatTextArea;
