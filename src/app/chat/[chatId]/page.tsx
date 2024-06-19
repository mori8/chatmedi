"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { chatState } from "@/recoil/atoms";
import ChatTextArea from "@/components/ChatTextArea";
import classNames from "classnames";


function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const userId = "kaithape";
  const chat = useRecoilValue(chatState);
  const setChat = useSetRecoilState(chatState);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "user", text: chat.prompt },
  ]);

  const handleSubmit = useCallback(async () => {
    if (content.trim() === "") return;

    setMessages((prev) => [...prev, { sender: "user", text: content }]);
    setContent("");

    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        prompt: content,
        history: messages.map((m) => m.text),
      }),
    });
    console.log("response:", response);
    const data = await response.json();
    console.log(data);
    setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
  }, [content, messages, chat.userId, chatId]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-scroll mt-4 rounded-lg flex flex-col gap-8">
        {messages.map((message, index) => (
          <div
            key={index}
            className={classNames("flex gap-4 justify-start", {
              "flex-row-reverse": message.sender === "user",
            })}
          >
            <div className="profile-image flex-shrink-0">
              <img
                className="rounded-full w-8 h-8"
                src={
                  message.sender === "user"
                    ? "https://github.com/mori8.png"
                    : "/images/robot-1.svg"
                }
                alt={message.sender}
              />
            </div>
            <span
              className={classNames('prose', {
                "bg-slate-100 rounded-xl px-4 py-2": message.sender === "user",
              })}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0">
        <ChatTextArea
          content={content}
          setContent={setContent}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default ChatPage;
