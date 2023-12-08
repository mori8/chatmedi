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
      "Explain what pneumonia is in detail.",
      "What is the difference between pneumonia and pleural effusion?",
      "Generate a chest X-ray image about severe left-sided pleural effusion.",
    ]);
  }, []);

  return (
    status === "authenticated" && (
      <main className="flex flex-row items-center gap-12 h-full w-full">
        <ChatSideBar userId={session.user.id} />
        <div className="flex flex-col flex-1 h-full items-center overflow-scroll pb-40">
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
              <ul className="quick-start-question-list flex flex-col items-center w-[40rem]">
                {quickStartQuestions.map((question, index) => (
                  <li
                    className="quick-start-question-item text-kaistblue flex gap-2 mb-2 hover:underline cursor-pointer items-center line-clamp-2"
                    key={index}
                    onClick={() => {
                      executeQuickStart(question, session.user.id).then(
                        (threadId) => {
                          push(`/chat/${threadId}`);
                        }
                      );
                    }}
                  >
                    <p className="text-center">
                      {/* 새 채팅 생성 */}
                      {question}
                    </p>
                    <div className="flex-shrink-0">
                      <ArrowRightCircleIcon width="24" />
                    </div>
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
