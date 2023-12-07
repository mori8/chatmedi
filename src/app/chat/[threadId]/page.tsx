"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import ChatBox from "../../components/ChatBox";
import RunHistory from "../../components/RunHistory";
import ModuleGroupBox from "./ModuleGroupBox";
import LoadingSpinner from "./LoadingSpinner";
import SectionTitle from "./SectionTitle";
import ResultSection from "./ResultSection";
import Navigation from "../../components/Navigation";
import ChatSideBar from "../../components/ChatSideBar";
import { getImageURL } from "@/utils/utils";


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
  const [userMessage, setUserMessage] = useState<ChatInfo>();
  const [controllerMessage, setControllerMessage] = useState<ChatInfo>();
  const [functionResult, setFunctionResult] = useState<string>("");
  const [resultImageName, setResultImageName] = useState<string | undefined>();
  const [assistantMessage, setAssistantMessage] = useState<ChatInfo>();
  const [executeStatus, setExecuteStatus] = useState<
    "user" | "controller" | "function" | "assistant"
  >("controller");
  const { data: session, status } = useSession();
  const threadId = params.threadId;

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
        const user = data.find((chat: ChatInfo) => chat.role === "user");
        setUserMessage(user);

        const controller = data.find(
          (chat: ChatInfo) => chat.role === "controller"
        );
        setControllerMessage(controller);
        setExecuteStatus("controller");

        const func = data.find((chat: ChatInfo) => chat.role === "function");
        setResultImageName(func?.content.image);
        setFunctionResult(func?.content.answer ? func?.content.answer : func?.content.result);
        console.log("functionResult: ", func.content.answer);
        setExecuteStatus("function");

        const assistant = data.find(
          (chat: ChatInfo) => chat.role === "assistant"
        );
        setAssistantMessage(assistant);
        setExecuteStatus("assistant");
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

      continueExecution(
        _lastChat.role,
        _lastChat.message_id,
        setResultImageName,
        setFunctionResult,
        setExecuteStatus
      ).then((data) => {
        if (data) {
          setChats((prev) => {
            return [...prev, data];
          });
          setAssistantMessage(data);
        }
      });

      if (_lastChat.role === "assistant") {
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
          <div className="flex-1 w-full flex flex-row items-start justify-evenly gap-12 px-12 py-8 mb-40">
            <div className="max-w-[56rem] whitespace-pre-wrap">
              {userMessage && (
                <section
                  className="section-chatbox w-full mb-12"
                  key={userMessage.message_id}
                >
                  <ChatBox
                    threadId={threadId}
                    key={userMessage.message_id}
                    query={userMessage.content.user_input}
                    userId={session.user.id}
                    mode="edit"
                    isFirstQuery
                    userImageURL={imageInputURL}
                  />
                </section>
              )}
              <div>
                <SectionTitle>
                  Collecting infomation through AI models...
                </SectionTitle>
                <div className="mt-8">
                  {controllerMessage && (
                    <ModuleGroupBox
                      name={controllerMessage.tool?.name}
                      cardURL={controllerMessage.tool?.card_url}
                      input={controllerMessage.data.query || ""}
                      files={[controllerMessage.data.text_file, controllerMessage.data.numpy_file]}
                      answer={functionResult}
                      moduleDescription={
                        controllerMessage.tool?.task_description
                      }
                    />
                  )}
                </div>
              </div>
              <ResultSection
                resultImageName={resultImageName}
                chat={assistantMessage}
              />
              {!hasFetched && (
                <div className="spinner-wrapper w-full flex items-center justify-center my-12">
                  <LoadingSpinner status={executeStatus} />
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


const continueExecution = async (
  lastChatRole: string,
  chatId: string,
  setResultImageName: (name: string) => void,
  setFunctionResult: (result: string) => void,
  setExecuteStatus: (
    status: "user" | "controller" | "function" | "assistant"
  ) => void
) => {
  console.log("continueExecution: ", lastChatRole, chatId);
  if (lastChatRole === "controller") {
    setExecuteStatus("controller");
    const fetchPlanExecute = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan-execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
        }),
      }
    );
    const planExecuteJson = await fetchPlanExecute.json();
    setResultImageName(planExecuteJson.content.image);
    setFunctionResult(planExecuteJson.content.answer ? planExecuteJson.content.answer : planExecuteJson.content.result);
    setExecuteStatus("function");
    console.log("now fetch chat");

    const fetchChat = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: planExecuteJson.message_id,
        }),
      }
    );
    const chatJson = await fetchChat.json();
    setExecuteStatus("assistant");
    console.log("chat fetched:", chatJson);
    return chatJson;
  }

  if (lastChatRole === "function") {
    const fetchChat = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
        }),
      }
    );
    const chatJson = await fetchChat.json();
    setExecuteStatus("assistant");
    return chatJson.data;
  }

  return null;
};
