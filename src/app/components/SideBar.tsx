"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";

import Button from "./Button";
import PlusChatSVG from "../icons/PlusChatSVG";
import {
  ArrowTopRightOnSquareIcon,
  LightBulbIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

type Props = {};

export default function SideBar({}: Props) {
  const [isOpened, setIsOpened] = useState(true);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  const toggleSideBar = () => {
    setIsOpened(!isOpened);
  };

  const groupByDate = (chatHistory: Chat[]) => {
    const grouped = chatHistory.reduce((acc, chat) => {
      const date = new Date(chat.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(chat);
      return acc;
    }, {} as { [key: string]: Chat[] });

    // sort by date
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return sortedKeys.map((key) => ({
      date: key,
      chats: grouped[key],
    }));
  }

  useEffect(() => {
    // TODO: fetch chat history
    setChatHistory([
      {
        threadId: "1",
        title: "The Best Chat I ever experienced",
        type: "chat",
        createdAt: "2023-07-21T01:43:11.999824",
      },{
        threadId: "2",
        title: "This is sample chat",
        type: "chat",
        createdAt: "2023-07-21T13:43:11.999824",
      },{
        threadId: "3",
        title: "raspberry greek yogurt",
        type: "chat",
        createdAt: "2023-10-03T01:43:11.999824",
      },
    ]);
  }, []);

  return (
    <>
      {isOpened ? (
        <div
          className="bg-black w-[260px] text-white flex-shrink-0 overflow-x-hidden rounded-se-3xl"
          onClick={() => toggleSideBar()}
        >
          <div className="flex flex-col p-5 pt-8">
            <div className="flex flex-row gap-4">
              <Bars3Icon width="24" />
              <div className="flex-1">
                <h1 className="font-mono">CHATMEDI</h1>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => toggleSideBar()}
                color="mint"
                shadowColor="white"
              >
                <PlusChatSVG width="20" />
                <span>New Chat</span>
              </Button>
            </div>
            <div className="flex flex-row gap-2 mt-3 cursor-pointer hover:bg-white hover:text-black transition ease-out rounded-2xl px-3 py-3">
              <LightBulbIcon width="20" />
              <p className="text-sm font-medium flex-1">Templates</p>
              <ArrowTopRightOnSquareIcon width="20" />
            </div>
            <div className="chat-history">
              {
                groupByDate(chatHistory).map(({ date, chats }) => (
                  <div key={date} className="mt-6">
                    <h1 className="text-xs font-medium">{
                      date === new Date().toLocaleDateString() ? "Today" : date
                    }</h1>
                    <div className="mt-2">
                      {chats.map((chat) => (
                        <div
                          key={chat.threadId}
                          className="flex flex-row gap-2 cursor-pointer hover:bg-white hover:text-black transition ease-out rounded-2xl px-3 py-3"
                        >
                          <ChatBubbleLeftIcon width="20" />
                          <div className="flex-1 overflow-hidden whitespace-nowrap">
                            <h1 className="text-sm truncate">{chat.title}</h1>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      ) : (
        <div
          className="fixed top-8 left-6 z-10"
          onClick={() => toggleSideBar()}
        >
          <Bars3Icon width="24" color="black" />
        </div>
      )}
    </>
  );
}
