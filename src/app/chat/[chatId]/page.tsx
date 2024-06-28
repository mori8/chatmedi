'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { chatState } from "@/recoil/atoms";
import classNames from "classnames";

import ChatTextArea from "@/components/ChatTextArea";
import MarkdownWrapper from "@/components/MarkdownWrapper";
import { fetchChatHistory, saveChatMessage, saveChatMediResponse, getChatMediResponse } from "@/lib/redis";


function ChatPage() {
  const { data: session, status } = useSession();
  const { chatId } = useParams<{ chatId: string }>();
  const user = session?.user;
  const userId = user?.email!;
  const chat = useRecoilValue(chatState);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: ChatMediResponse }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function initializeChat() {
      const history: Message[] = await fetchChatHistory(userId, chatId);
      console.log("history:", history);
      setMessages(history);

      // Load ChatMediResponses for each message
      const newResponses: { [key: string]: ChatMediResponse } = {};
      for (const msg of history) {
        const response = await getChatMediResponse(userId, chatId, msg.messageId);
        if (response) {
          newResponses[msg.messageId] = response;
        }
      }
      setResponses(newResponses);
    }

    initializeChat();
  }, [userId, chatId]);

  const fetchStreamResponse = async (userId: string, chatId: string, messageId: string) => {
    const response = await fetch(`/api/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        chatId: chatId,
        messageId: messageId,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let chatMediResponse: ChatMediResponse = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const data = JSON.parse(chunk);
      chatMediResponse = { ...chatMediResponse, ...data };
      setResponses(prev => ({ ...prev, [messageId]: chatMediResponse }));
    }

    // Save the final response to Redis
    await saveChatMediResponse(userId, chatId, messageId, chatMediResponse);
  };

  const fetchAIResponse = async (prompt: string) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
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
      const savedMessage = data.response;
      setMessages((prev) => [...prev, savedMessage]);

      // Fetch and display the stream response
      await fetchStreamResponse(userId, chatId, savedMessage.messageId);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const lastMessageRef = useRef<Message | null>(null);

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
    setContent("");
    const savedUserMessage = await saveChatMessage(userId, chatId, userMessage);
    if (!savedUserMessage) {
      console.error("Failed to save user message");
      return;
    }
    setMessages((prev) => [...prev, savedUserMessage]);
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
              {responses[message.messageId] && (
                <div className="mt-2 p-2 border-t border-gray-300">
                  {JSON.stringify(responses[message.messageId], null, 2)}
                </div>
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
