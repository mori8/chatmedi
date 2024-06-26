'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { chatState } from "@/recoil/atoms";
import classNames from "classnames";

import ChatTextArea from "@/components/ChatTextArea";
import MarkdownWrapper from "@/components/MarkdownWrapper";
import { fetchChatHistory, saveChatMessage } from "@/lib/redis";


function ChatPage() {
  const { data: session, status } = useSession();
  const { chatId } = useParams<{ chatId: string }>();
  const user = session?.user;
  const userId = user?.email!;
  const chat = useRecoilValue(chatState);
  const [content, setContent] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "user", text: chat.prompt },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const CurrentStepInfo = () => {
    if (currentStep === 0) {
      return (
        <div className="flex items-center mt-5">
          <span role="img" aria-label="waving hand" className="text-xl mr-2">
            👋
          </span>
          <p>I'm an AI that can perform general-purpose medical tasks!</p>
        </div>
      );
    } else if (currentStep === 1) {
      return (
        <div className="flex items-center mt-5">
          <span role="img" aria-label="paper clip" className="text-xl mr-2">
            📎
          </span>
          <p>Planning your task...</p>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="flex items-center mt-5">
          <span role="img" aria-label="paper clip" className="text-xl mr-2">
            📎
          </span>
          <p>Task planned successfully!</p>
        </div>
      );
    }
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadChatHistory() {
      const history = await fetchChatHistory(userId, chatId);
      console.log("history:", history);
      setMessages(history);
    }

    loadChatHistory();
  }, [chatId, userId]);

  const fetchAIResponse = async (prompt: string) => {
    if (isFetchingRef.current) return;

    setCurrentStep(1);
    isFetchingRef.current = true;

    const res = await fetch('/api/plan-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, sessionId: chatId})
    });

    const dataFromPlanTask = await res.json();

    console.log("Planned Tasks:", dataFromPlanTask);

    setCurrentStep(2);

    try {
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
      const aiMessage = { sender: "ai", text: data.response };
      
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const lastMessageRef = useRef<{ sender: string; text: string } | null>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === "user" && lastMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage;
      fetchAIResponse(lastMessage.text);
    }
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (content.trim() === "") return;
    const userMessage = { sender: "user", text: content };
    setMessages((prev) => [...prev, userMessage]);
    setContent("");
    await saveChatMessage(userId, chatId, userMessage);
  }, [content, userId, chatId]);

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
                    ? user?.image!
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
