import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import Image from "next/image";

import Button from "./Button";
import { groupByDate } from "@/utils/utils";
import PlusChatSVG from "../icons/PlusChatSVG";
import {
  ArrowTopRightOnSquareIcon,
  LightBulbIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";


export default function ChatSideBar({ userId }: { userId: string }) {
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const currentThread = usePathname().split("/")[2];

  useEffect(() => {
    async function fetchChatHistory(userId: string) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/threads?` +
          new URLSearchParams({
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
    }

    fetchChatHistory(userId).then((data) => {
      setChatHistory(data);
    });
  }, []);


  return (
    <>
      <div className="bg-black w-[260px] text-white flex-shrink-0 overflow-x-hidden rounded-se-3xl h-screen">
        <div className="flex flex-col p-5 pt-8 h-full">
          <div className="flex flex-row gap-4">
            <Bars3Icon width="24" className="cursor-pointer" />
            <Link href="/">
              <div className="flex-1">
                <h1 className="font-mono">CHATMEDI</h1>
              </div>
            </Link>
          </div>
          <div className="mt-6">
            <Link href="/">
              <Button onClick={() => {}} color="kaistlightblue" shadowColor="white">
                <PlusChatSVG width="20" />
                <span>New Chat</span>
              </Button>
            </Link>
          </div>
          <div className="flex flex-row gap-2 mt-3 cursor-pointer hover:bg-white hover:text-black transition ease-out rounded-2xl px-3 py-3">
            <LightBulbIcon width="20" />
            <p className="text-sm font-medium flex-1">Templates</p>
            <ArrowTopRightOnSquareIcon width="20" />
          </div>
          <div className="chat-history">
            {groupByDate(chatHistory).map(({ date, chats }) => (
              <div key={date} className="mt-6">
                <h1 className="text-xs font-medium">
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                </h1>
                <div className="mt-2">
                  {chats.map((chat, index) => (
                    <Link href={`/chat/${chat.id}`} key={index}>
                      <div
                        key={chat.id}
                        className={classNames(
                          "flex flex-row gap-2 cursor-pointer hover:bg-white hover:text-black transition ease-out rounded-2xl px-3 py-2 my-1",
                          {
                            "bg-white text-black": currentThread === chat.id,
                          }
                        )}
                      >
                        {/* <ChatBubbleLeftIcon width="18" /> */}
                        <div className="flex-1 overflow-hidden whitespace-nowrap">
                          <h1 className="text-sm truncate">{chat.title}</h1>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1"></div>
          <div className="flex justify-between items-center">
            <button onClick={() => signOut()}>
              <span>Logout</span>
            </button>
            <div>
              <Image src="/kaist-logo-gray.png" alt="kaist logo" width={70} height={40} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
