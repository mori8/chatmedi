"use client";

import { useEffect, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";

import ChatBox from "./components/ChatBox";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import ChatSideBar from "./components/ChatSideBar";
import Navigation from "./components/Navigation";

export default function Home() {
  const [quickStartQuestions, setQuickStartQuestions] = useState<string[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    setQuickStartQuestions([
      "Can you list the diagnostic criteria for Systemic Lupus Erythematosus?",
      "What radiological findings are typical for early rheumatoid arthritis?",
      "What are common causes for persistent abdominal pain and nausea?",
    ]);
  }, []);

  return (
    status === "authenticated" && (
      <main className="flex flex-row items-center gap-12 h-full w-full">
        <ChatSideBar userId={session.user.id} />
        <div className="flex flex-col flex-1 h-full items-center">
          <Navigation />
          <div className="chatbox-wrapper max-w-[64rem] w-full mt-24 p-12">
            <ChatBox threadId={null} userId={session.user.id} mode="create" isFileAttachEnabled={true} isFirstQuery />
          </div>
          <div className="text-center flex-1">
            <p className="text-sm font-bold">QUICK START</p>
            <div className="mt-4 w-fit">
              <ul className="quick-start-question-list">
                {quickStartQuestions.map((question, index) => (
                  <li
                    className="quick-start-question-item text-turquiose flex gap-2 mb-2 hover:underline cursor-pointer"
                    key={index}
                  >
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
        </div>
      </main>
    )
  );
}
