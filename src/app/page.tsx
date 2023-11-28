"use client";

import { useEffect, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { useRouter } from "next/navigation";

import ChatBox from "./components/ChatBox";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import ChatSideBar from "./components/ChatSideBar";
import Navigation from "./components/Navigation";

export default function Home() {
  const [quickStartQuestions, setQuickStartQuestions] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    setQuickStartQuestions([
      "Does MRI pose a risk of radiation exposure?",
      "What radiological findings are typical for early rheumatoid arthritis?",
      "What are common causes for persistent abdominal pain and nausea?",
    ]);
  }, []);

  return (
    status === "authenticated" && (
      <main className="flex flex-row items-center gap-12 h-full w-full mb-40">
        <ChatSideBar userId={session.user.id} />
        <div className="flex flex-col flex-1 h-full items-center">
          <Navigation />
          <div className="chatbox-wrapper max-w-[64rem] w-full mt-24 p-12">
            <ChatBox
              threadId={null}
              userId={session.user.id}
              mode="create"
              isFileAttachEnabled={true}
              isFirstQuery
            />
          </div>
          <div className="text-center flex-1">
            <p className="text-sm font-bold">QUICK START</p>
            <div className="mt-4">
              <ul className="quick-start-question-list flex flex-col items-center">
                {quickStartQuestions.map((question, index) => (
                  <li
                    className="quick-start-question-item text-turquiose flex gap-2 mb-2 hover:underline cursor-pointer"
                    key={index}
                    onClick={() => {
                      executeQuickStart(question, session.user.id).then(
                        (threadId) => {
                          push(`/chat/${threadId}`);
                        }
                      );
                    }}
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

const executeQuickStart = async (question: string, userId: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      user_input: question,
    }),
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("[ChatBox] Failed to send a query");
  }

  const json: ChatInfo = await res.json();
  return json.thread.id;
};
