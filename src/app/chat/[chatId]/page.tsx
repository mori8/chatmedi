"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { chatState } from "@/recoil/atoms";
import classNames from "classnames";

import ChatTextArea from "@/components/ChatTextArea";
import MarkdownWrapper from "@/components/MarkdownWrapper";

function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const userId = "kaithape";
  const chat = useRecoilValue(chatState);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "user", text: chat.prompt },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAIResponse = async (prompt: string) => {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        prompt: prompt,
        chatId: chatId,
      }),
    });
    const data = await response.json();
    setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
  };

  const lastMessageRef = useRef<{ sender: string; text: string } | null>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === "user" && lastMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage;
      fetchAIResponse(lastMessage.text);
    }
  }, [messages]);

  const handleSubmit = useCallback(() => {
    if (content.trim() === "") return;
    setMessages((prev) => [...prev, { sender: "user", text: content }]);
    setContent("");
  }, [content]);

  return (
    <div className="flex flex-col h-full gap-4">
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
              <MarkdownWrapper markdown={message.text} />
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
