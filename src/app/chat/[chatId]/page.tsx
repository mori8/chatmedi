"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { saveUserMessageForClient } from "@/utils/utils";
import ChatMessages from "@/components/ChatMessages";
import ChatTextArea from "@/components/ChatTextArea";
import useFetchStreamResponse from "@/hook/useFetchStreamResponse";

const ModelSwappingModal = React.lazy(
  () => import("@/components/ModelSwappingModal")
);

function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const { chatId } = useParams<{ chatId: string }>();
  const user = session?.user;
  const userId = user?.email!;
  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { isFetching, tempChatMediResponse, fetchStreamResponse } =
    useFetchStreamResponse(userId, chatId, setMessages);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempChatMediResponse]);

  useEffect(() => {
    const initializeChat = async () => {
      const response = await fetch(
        `/api/chat-history?userId=${userId}&chatId=${chatId}`
      );
      if (response.ok) {
        const history: Message[] = await response.json();
        setMessages(history);
      } else {
        console.error("Failed to fetch chat history");
      }
    };

    if (userId && chatId) {
      initializeChat();
    }
  }, [userId, chatId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && "prompt" in lastMessage && !isFetching) {
      fetchStreamResponse(
        lastMessage.prompt.text,
        lastMessage.prompt.files?.[0]
      );
    }
  }, [messages, isFetching, fetchStreamResponse]);

  const handleSubmit = async () => {
    if (content.trim() === "") return;

    // Create a new user message object
    const newMessage: UserMessage = {
      messageId: `${Date.now()}`,
      sender: "user",
      prompt: {
        text: content,
        files: file ? [URL.createObjectURL(file)] : [],
      },
    };

    // Update the messages state immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setContent("");
    setFile(null);

    // Scroll to bottom after updating messages
    scrollToBottom();

    // Save the user message to Redis
    const savedUserMessage = await saveUserMessageForClient(
      userId,
      chatId,
      content,
      file
    );
    if (!savedUserMessage) {
      console.error("Failed to save user message");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex-1 overflow-scroll mt-4 rounded-lg flex flex-col gap-5">
          <ErrorBoundary fallback={<ErrorFallback />}>
            <ChatMessages
              messages={messages}
              user={user}
              tempChatMediResponse={tempChatMediResponse}
              isFetching={isFetching}
              setIsModalOpen={setIsModalOpen}
            />
            <div ref={messagesEndRef} />
          </ErrorBoundary>
        </div>
        <div className="flex-shrink-0">
          <ChatTextArea
            content={content}
            setContent={setContent}
            handleSubmit={handleSubmit}
            setFile={setFile}
            isFetching={isFetching}
          />
        </div>
        {isModalOpen && (
          <ModelSwappingModal onClose={() => setIsModalOpen(false)} />
        )}
      </Suspense>
    </div>
  );
}

export default ChatPage;
