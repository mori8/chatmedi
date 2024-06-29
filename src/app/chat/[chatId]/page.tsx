'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { chatState } from "@/recoil/atoms";
import classNames from "classnames";

import ChatTextArea from "@/components/ChatTextArea";
import MarkdownWrapper from "@/components/MarkdownWrapper";
import { fetchChatHistory, saveUserMessage, saveAIMessage } from "@/lib/redis";

function ChatPage() {
  const { data: session, status } = useSession();
  const { chatId } = useParams<{ chatId: string }>();
  const user = session?.user;
  const userId = user?.email!;
  const chat = useRecoilValue(chatState);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<(UserMessage | AIMessage)[]>([]);
  const [tempChatMediResponse, setTempChatMediResponse] = useState<ChatMediResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function initializeChat() {
      const history: (UserMessage | AIMessage)[] = await fetchChatHistory(userId, chatId);
      console.log("history:", history);
      setMessages(history);
    }

    initializeChat();
  }, [userId, chatId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && 'prompt' in lastMessage && !isFetching) {
      setIsFetching(true);
      fetchStreamResponse(lastMessage.prompt.text);
    }
  }, [messages]);

  const fetchStreamResponse = async (prompt: string) => {
    try {
      const response = await fetch(`/api/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          chatId: chatId,
          prompt: prompt,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let tempResponse: ChatMediResponse = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const data = JSON.parse(chunk);
        tempResponse = { ...tempResponse, ...data };
        setTempChatMediResponse(tempResponse);
      }

      // Save the final response to Redis
      const savedAIMessage = await saveAIMessage(userId, chatId, tempResponse);
      setMessages(prevMessages => [...prevMessages, savedAIMessage]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (content.trim() === "") return;
    const savedUserMessage = await saveUserMessage(userId, chatId, content);
    console.log("savedUserMessage:", savedUserMessage)
    if (!savedUserMessage) {
      console.error("Failed to save user message");
      return;
    }
    setMessages((prev) => [...prev, savedUserMessage]);
    setContent("");
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
              {'prompt' in message ? (
                <MarkdownWrapper markdown={message.prompt.text} />
              ) : (
                <MarkdownWrapper markdown={message.response?.final_response?.text || ""} />
              )}
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
