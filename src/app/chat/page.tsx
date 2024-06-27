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

    const response = await fetch("/api/chat/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, prompt: content }),
    });
    // TODO:
    // 여기서 /api/chat/start가 저장된 첫 프롬프트의 messageId도 함께 반환한 다음
    // messageId도 recoil에 저장해서
    // /chat/[chatId]로 이동할 때 해당 messageId를 가지고 채팅을 불러오도록 하면 될 듯
    // 그러면 /chat/[chatId]에서 첫 메세지 messageId 얻으려고 똥꼬쇼한거 없애도 됨
    const data: {
      chatId?: string;
    } & Message = await response.json();

    if (data.chatId) {
      setChat({ userId, prompt: content, chatId: data.chatId, messageId: data.messageId });
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
      />
    </div>
  );
}
