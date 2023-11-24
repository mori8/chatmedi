"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import ChatBox from "../../components/ChatBox";
import RunHistory from "../../components/RunHistory";
import ModuleGroupBox from "./ModuleGroupBox";
import LoadingSpinner from "./LoadingSpinner";
import ResultTextWrapper from "./ResultTextWrapper";
import Navigation from "../../components/Navigation";
import ChatSideBar from "../../components/ChatSideBar";

type Props = {
  params: {
    threadId: string;
  };
};

export default function Home({ params }: Props) {
  const [hasFetched, setHasFetched] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatInfo[]>([]); // user / controller가 항상 짝으로 들어가야 함
  const [nowDisplayedMessages, setNowDisplayedMessages] = useState<
    { messageId: string; query: string; file: File | undefined }[]
  >([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    setThreadId(params.threadId);
  }, [params.threadId]);

  const fetchMessage = (query: string, file: File | undefined) => {
    // fetch query to server
    const newMessageId = "1";
    return newMessageId;
  };

  const editMessage = (
    oldMessageId: string,
    newMessageId: string,
    newQuery: string,
    newFile: File | undefined
  ) => {
    // TODO: fetch edited query to server

    // TODO: (then) update message state
    setNowDisplayedMessages((prev) => {
      const index = prev.findIndex(
        (message) => message.messageId === oldMessageId
      );
      if (index !== -1) {
        const newDisplayedMessages = [...prev];
        newDisplayedMessages[index].messageId = newMessageId;
        newDisplayedMessages[index].query = newQuery;
        newDisplayedMessages[index].file = newFile;
        return newDisplayedMessages;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (session && threadId) {
      const userId = session.user.id;

      const fetchExecutions = async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/chats?` +
            new URLSearchParams({
              thread_id: threadId,
              user_id: userId,
            }).toString(),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const json = await res.json();
        return json.data;
      };

      fetchExecutions().then((data) => {
        setChats(data);
      });
    }
  }, [session, threadId]);

  useEffect(() => {
    if (chats.length > 0) {
      const lastChat = chats[chats.length - 1];
      const newChatState = continueExecution(
        lastChat.role,
        lastChat.message_id
      ).then((data) => {
        if (data) {
          setChats((prev) => [...prev, data]);
        }
      });

      if (lastChat.role === "assistant") {
        setHasFetched(true);
      }
    }
  }, [chats]);

  return (
    status === "authenticated" &&
    threadId && (
      <main className="flex flex-row items-center gap-12 h-full w-full">
        <ChatSideBar userId={session.user.id} />
        <div className="flex flex-col flex-1 h-full items-center overflow-scroll">
          <Navigation />
          <div className="flex-1 w-full flex flex-row items-start justify-evenly gap-12 p-12 mb-40">
            <div className="max-w-[56rem] whitespace-pre-wrap">
              {chats.map((chat, index) => {
                if (chat.role === "user")
                  return (
                    <section
                      className="section-chatbox w-full mb-4"
                      key={chat.message_id}
                    >
                      <ChatBox
                        threadId={threadId}
                        key={chat.message_id}
                        query={chat.content.user_input}
                        userId={session.user.id}
                        mode="edit"
                        isFirstQuery={index === 0}
                      />
                    </section>
                  );
                // else if (chat.role === "controller") return <ModuleGroupBox key={chat.message_id} />;
                else if (chat.role === "assistant")
                  return (
                    <ResultTextWrapper
                      key={chat.message_id}
                      content={chat.content.result || ""}
                    />
                  );
                else return null;
              })}
              <div className="mt-16">
                {hasFetched && (
                  <ChatBox
                    isFileAttachEnabled={false}
                    threadId={threadId}
                    mode="create"
                    userId={session?.user.id}
                    rows={4}
                    isFirstQuery={false}
                  />
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <RunHistory />
            </div>
          </div>
        </div>
      </main>
    )
  );
}


const continueExecution = async (lastChatRole: string, chatId: string) => {
  if (lastChatRole === "controller") {
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan-execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  }

  if (lastChatRole === "function") {
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan-execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  }

  return null;
};
