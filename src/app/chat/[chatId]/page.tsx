"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { fetchChatHistory } from "@/lib/redis";
import ChatMessages from "@/components/ChatMessages";
import ChatTextArea from "@/components/ChatTextArea";
import useFetchStreamResponse from "@/hook/useFetchStreamResponse";
import { saveUserMessageForClient } from "@/utils/utils";

const ModelSwappingModal = React.lazy(() => import("@/components/ModelSwappingModal"));

function ChatPage() {
  const { data: session } = useSession();
  const { chatId } = useParams<{ chatId: string }>();
  const user = session?.user;
  const userId = user?.email!;

  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { isFetching, tempChatMediResponse, fetchStreamResponse } = useFetchStreamResponse(userId, chatId, setMessages);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempChatMediResponse]);

  useEffect(() => {
    const initializeChat = async () => {
      const history: Message[] = await fetchChatHistory(userId, chatId);
      setMessages(history);
    };

    if (userId && chatId) {
      initializeChat();
    }
  }, [userId, chatId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && "prompt" in lastMessage && !isFetching) {
      fetchStreamResponse(lastMessage.prompt.text, lastMessage.prompt.files?.[0]);
    }
  }, [messages, isFetching, fetchStreamResponse]);

  const handleSubmit = async () => {
    if (content.trim() === "") return;
    const savedUserMessage = await saveUserMessageForClient(userId, chatId, content, file);
    if (!savedUserMessage) {
      console.error("Failed to save user message");
      return;
    }
    setMessages((prev) => [...prev, savedUserMessage]);
    setContent("");
    setFile(null);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex-1 overflow-scroll mt-4 rounded-lg flex flex-col gap-8">
          <ChatMessages
            messages={messages}
            user={user}
            tempChatMediResponse={tempChatMediResponse}
            isFetching={isFetching}
            setIsModalOpen={setIsModalOpen}
          />
          <div ref={messagesEndRef} />
        </div>
        <div className="flex-shrink-0">
          <ChatTextArea
            content={content}
            setContent={setContent}
            handleSubmit={handleSubmit}
            setFile={setFile}
          />
        </div>
        {isModalOpen && <ModelSwappingModal onClose={() => setIsModalOpen(false)} />}
      </Suspense>
    </div>
  );
}

export default ChatPage;
