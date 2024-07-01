"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRecoilValue } from "recoil";
import { chatState } from "@/recoil/atoms";
import classNames from "classnames";

import LoadingDots from "@/components/LoadingDots";
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
  const [tempChatMediResponse, setTempChatMediResponse] =
    useState<ChatMediResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempChatMediResponse]);

  useEffect(() => {
    async function initializeChat() {
      const history: (UserMessage | AIMessage)[] = await fetchChatHistory(
        userId,
        chatId
      );
      console.log("history:", history);
      setMessages(history);
    }

    initializeChat();
  }, [userId, chatId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && "prompt" in lastMessage && !isFetching) {
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
        const dataChunks = chunk.trim().split("\n");

        for (const dataChunk of dataChunks) {
          if (dataChunk) {
            const data = JSON.parse(dataChunk);
            tempResponse = { ...tempResponse, ...data };
            setTempChatMediResponse(tempResponse);
          }
        }
      }

      // Save the final response to Redis
      const savedAIMessage = await saveAIMessage(userId, chatId, tempResponse);
      setMessages((prevMessages) => [...prevMessages, savedAIMessage]);
    } finally {
      setIsFetching(false);
      setTempChatMediResponse(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (content.trim() === "") return;
    const savedUserMessage = await saveUserMessage(userId, chatId, content);
    console.log("savedUserMessage:", savedUserMessage);
    if (!savedUserMessage) {
      console.error("Failed to save user message");
      return;
    }
    setMessages((prev) => [...prev, savedUserMessage]);
    setContent("");
  }, [content, userId, chatId]);

  const renderChatMediResponse = (response: ChatMediResponse) => {
    return (
      <div className="p-2">
        {response.planned_task && (
          <div className="text-sm">
            <p className="m-0 text-slate-400">
              To handle your request, we need to tackle these tasks:
            </p>
            <div className="flex flex-row my-2 flex-wrap gap-2">
              {response.planned_task.map((task, index) => (
                <span className="m-0 py-1 px-2 rounded-xl bg-blue-50 border border-blue-200 text-slate-600 font-semibold flex-shrink-0">
                  {task.task}
                </span>
              ))}
            </div>

            <p className="m-0 text-slate-400">
              I'll find the right model for the job!
            </p>
          </div>
        )}
        {response.selected_model ? (
          <div className="mt-4 text-sm">
            <p className="m-0 text-slate-400">I found an appropriate model!</p>
            {Object.entries(response.selected_model).map(([key, model]) => (
              <div key={key} className="bg-slate-100 my-2 px-4 py-3 rounded-xl leading-snug">
                <p className="m-0 mb-1 flex items-start gap-1">
                  <span className="w-14 flex-shrink-0">
                    <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500 inline-block">
                      Model
                    </span>
                  </span>
                  <span className="font-semibold">{model.id}</span>
                </p>
                <p className="m-0 flex items-start gap-1">
                  <span className="w-14 flex-shrink-0">
                    <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500 inline-block">
                      Reason
                    </span>
                  </span>
                  <span className="text-slate-500">{model.reason}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          response.planned_task && (
            <div className="mt-4 text-sm text-slate-400">
              Finding the right model to perform <LoadingDots />
            </div>
          )
        )}
        {response.output_from_model ? (
          <div className="mt-4 text-sm">
            <p className="m-0 text-slate-400">Model run complete.</p>
            {response.output_from_model.map((output, index) => (
              <div
                key={index}
                className="my-2 px-4 py-3 rounded-xl bg-slate-100"
              >
                <p className="m-0 mb-2 text-slate-400 text-xs">
                  response from{" "}
                  <span className="ml-1 bg-slate-200 border border-slate-300 px-1 py-[2px] rounded text-slate-500">
                    asdfasdf
                  </span>
                </p>
                <p className="m-0 mb-1">
                  <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500">
                    Input
                  </span>{" "}
                  {output.input}
                </p>
                <p className="m-0">
                  <span className="text-xs font-semibold bg-white px-1 py-[2px] rounded border border-slate-200 text-slate-500">
                    Output
                  </span>{" "}
                  {output.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          response.selected_model && (
            <div className="mt-4 text-sm text-slate-400">
              Executing model <LoadingDots />
            </div>
          )
        )}
        {response.final_response ? (
          <div className="mt-2">
            <MarkdownWrapper markdown={response.final_response.text} />
          </div>
        ) : (
          response.output_from_model && (
            <div className="mt-4 text-sm text-slate-400">
              Generating a result based on the model’s output <LoadingDots />
            </div>
          )
        )}
      </div>
    );
  };

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
              className={classNames("prose", {
                "bg-slate-100 rounded-xl px-4 py-2": message.sender === "user",
              })}
            >
              {"prompt" in message ? (
                <MarkdownWrapper markdown={message.prompt.text} />
              ) : (
                <>
                  {message.response ? (
                    renderChatMediResponse(message.response)
                  ) : (
                    <div className="text-sm text-slate-400">
                      Analyzing <LoadingDots />
                    </div>
                  )}
                </>
              )}
            </span>
          </div>
        ))}
        {isFetching && tempChatMediResponse && (
          <div className="flex gap-4 justify-start">
            <div className="profile-image flex-shrink-0">
              <img
                className="rounded-full w-8 h-8"
                src="/images/robot-1.svg"
                alt="AI"
              />
            </div>
            <span className="prose">
              {renderChatMediResponse(tempChatMediResponse)}
            </span>
          </div>
        )}
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
