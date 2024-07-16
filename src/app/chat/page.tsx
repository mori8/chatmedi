"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { chatState } from "@/recoil/atoms";
import ChatTextArea from "@/components/ChatTextArea";

type Props = {};

export default function Page({}: Props) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [file, setFile] = useState<File | null>(null);
  const userId = user?.email!;
  const bestCaseExamples = [
    "Generate a chest X-ray image with specific characteristics",
    "Finding abnormal points in attached chest X-ray file",
    "Difference between pneumonia and pleural effusion",
  ];

  const [content, setContent] = useState("");
  const [chat, setChat] = useRecoilState(chatState);
  const router = useRouter();

  const handleSubmit = async () => {
    if (content.trim() === "") return;

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("prompt", content);
    if (file) {
      formData.append("file", file);
    }

    const response = await fetch("/api/chat/start", {
      method: "POST",
      body: formData,
    });

    const data: {
      chatId?: string;
    } & Message = await response.json();

    if (data.chatId) {
      setChat({ userId, prompt: content, chatId: data.chatId, file: file });
      router.push(`/chat/${data.chatId}`);
    }
  };

  return (
    <div className="max-w-[884px] flex-1 text-slate-900 leading-snug flex flex-col gap-8">
      <div className="flex-1"/>
      <div className="flex-shrink-0 overflow-auto">
        <h1 className="text-2xl font-bold">
          Hello! I'm ChatMedi, your medical assistant AI.
        </h1>
        <div className="flex items-center mt-5">
          <span role="img" aria-label="waving hand" className="text-xl mr-2">
            👋
          </span>
          <p>I'm an AI that can perform general-purpose medical tasks!</p>
        </div>
        <div className="flex items-center mt-5">
          <span role="img" aria-label="paper clip" className="text-xl mr-2">
            📎
          </span>
          <p>
            To attach an X-ray scan or genomic data,
            <br />
            hit the clip icon or drag and drop the file into the message box.
          </p>
        </div>
        <div className="flex items-center mt-5">
          <span role="img" aria-label="thinking face" className="text-xl mr-2">
            🤔
          </span>
          <p>
            I can sometimes give inaccurate or incorrect answers, so please
            treat my answers with caution.
          </p>
        </div>
        <div className="mt-10">
          <p>
            Give me a command in the message box below, or get started with our
            best case examples ✨:
          </p>
          <div className="flex flex-row gap-4 mt-5">
            {bestCaseExamples.map((example, index) => (
              <button
                key={index}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-4 rounded-2xl text-sm text-left leading-tight"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ChatTextArea
        content={content}
        setContent={setContent}
        handleSubmit={handleSubmit}
        setFile={setFile}
        isFetching={false}
      />
    </div>
  );
}
