"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ChatBox from "./components/ChatBox";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [quickStartQuestions, setQuickStartQuestions] = useState<string[]>([]);

  useEffect(() => {
    setQuickStartQuestions([
      "Can you list the diagnostic criteria for Systemic Lupus Erythematosus?",
      "What radiological findings are typical for early rheumatoid arthritis?",
      "What are common causes for persistent abdominal pain and nausea?",
    ]);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-12">
      <div className="max-w-[64rem] w-full">
        <ChatBox
          isFileAttachEnabled={true}
          getQuery={(text: string) => {
            setQuery(text);
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold">QUICK START</p>
        <div className="mt-4">
          <ul className="quick-start-question-list">
            {quickStartQuestions.map((question) => (
              <li className="quick-start-question-item text-turquiose flex gap-2 mb-2 hover:underline cursor-pointer">
                <p>
                  {/* 새 채팅 생성 */}
                  {question}
                </p>
                <ArrowRightCircleIcon width="24" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
