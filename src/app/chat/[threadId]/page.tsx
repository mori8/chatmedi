"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import ChatBox from "../../components/ChatBox";
import RunHistory from "../../components/RunHistory";
import ModuleGroupBox from "./ModuleGroupBox";
import LoadingSpinner from "./LoadingSpinner";
import SectionTitle from "./SectionTitle";
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
  const [imageInputURL, setImageInputURL] = useState<string | undefined>(
    undefined
  );
  const [chats, setChats] = useState<ChatInfo[]>([]); // user / controller가 항상 짝으로 들어가야 함
  const [lastChat, setLastChat] = useState<ChatInfo | null>(null);
  const [nowDisplayedMessages, setNowDisplayedMessages] = useState<
    { messageId: string; query: string; file: File | undefined }[]
  >([]);
  const { data: session, status } = useSession();
  const threadId = params.threadId;

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

  useEffect(() => {}, []);

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
  }, [session]);

  useEffect(() => {
    if (chats.length > 0) {
      const imageInputName = chats[0].content.image_input;
      if (imageInputName) {
        getImageURL(imageInputName).then((url) => {
          setImageInputURL(url);
        });
      }

      const _lastChat = chats[chats.length - 1];
      setLastChat(lastChat);

      continueExecution(_lastChat.role, _lastChat.message_id).then((data) => {
        if (data) {
          setChats((prev) => [...prev, data]);
        }
      });

      if (_lastChat.role === "assistant") {
        setHasFetched(true);
      }
      console.log("chats: ", chats)
    }
    
  }, [chats]);

  return (
    status === "authenticated" &&
    threadId && (
      <main className="flex flex-row items-center gap-12 h-full w-full">
        <ChatSideBar userId={session.user.id} />
        <div className="flex flex-col flex-1 h-full items-center overflow-scroll">
          <Navigation />
          <div className="flex-1 w-full flex flex-row items-start justify-evenly gap-12 px-12 py-8 mb-40">
            <div className="max-w-[56rem] whitespace-pre-wrap">
              {chats.map((chat, index) => {
                if (chat.role === "user")
                  return (
                    <section
                      className="section-chatbox w-full mb-12"
                      key={chat.message_id}
                    >
                      <ChatBox
                        threadId={threadId}
                        key={chat.message_id}
                        query={chat.content.user_input}
                        userId={session.user.id}
                        mode="edit"
                        isFirstQuery={index === 0}
                        userImageURL={imageInputURL}
                      />
                    </section>
                  );
                else if (chat.role === "controller")
                  return (
                    <div key={chat.message_id}>
                      <SectionTitle>
                        Selecting modules to perform a task...
                      </SectionTitle>
                      <div className="mt-8">
                        <ModuleGroupBox
                          key={chat.message_id}
                          moduleName={chat.tool?.task_name || ""}
                          moduleDescription={chat.tool?.task_description || ""}
                          models={[
                            {
                              name: chat.tool?.name || "",
                              cardURL: chat.tool?.card_url || "",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  );
                else if (chat.role === "assistant")
                  return (
                    <ResultTextWrapper
                      key={chat.message_id}
                      content={chat.content.result || ""}
                    />
                  );
                else return null;
              })}
              {!hasFetched && (
                <div className="spinner-wrapper w-full flex items-center justify-center my-12">
                  <LoadingSpinner status={lastChat?.role} />
                </div>
              )}
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
              <RunHistory chats={chats} />
            </div>
          </div>
        </div>
      </main>
    )
  );
}

const getImageURL = async (imageInputName: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/files/${imageInputName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.blob())
    .then((blob) => {
      const imageURL = URL.createObjectURL(blob);
      return imageURL;
    });
  return res;
};

const continueExecution = async (lastChatRole: string, chatId: string) => {
  console.log("continueExecution: ", lastChatRole, chatId);
  if (lastChatRole === "controller") {
    const fetchPlanExecute = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan-execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })
    const planExecuteJson = await fetchPlanExecute.json();

    console.log("now fetch chat: ", planExecuteJson.message_id)
    
    const fetchChat = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: planExecuteJson.message_id,
      }),
    })
    const chatJson = await fetchChat.json();
    return chatJson.data;
  }

  if (lastChatRole === "function") {
    const fetchChat = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })
    const chatJson = await fetchChat.json();
    return chatJson.data;
  }

  return null;
};
