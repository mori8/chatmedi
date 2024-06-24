"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import classNames from "classnames";
import { Tooltip } from "react-tooltip";

import { fetchUserChats } from "@/lib/redis";

type Props = {};

export default function ChatSideBar({}: Props) {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [chatIds, setChatIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchUserChats(user.email).then((data: string[]) => {
        console.log("chat history data:", data);
        setChatIds(data);
      });
    }
  }, [user, chatId]);

  return (
    <div className="bg-palatinate text-alabaster px-4 pt-5 pb-4 rounded-3xl h-full flex flex-col gap-3 w-64 box-border text-sm">
      <div className="flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold">ChatMedi</h1>
        </div>
        <div>
          <Link href="/chat">
            <button className="flex items-center gap-1 bg-xanthous text-black py-2 px-3 rounded-2xl font-medium">
              <PlusIcon width={20} height={20} /> New chat
            </button>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {status === "loading" ? (
          <div className="animate-pulse">Loading chat history...</div>
        ) : chatIds.length > 0 ? (
          <ul>
            {chatIds.map((_chatId) => (
              <li
                key={_chatId}
                className={classNames(
                  "py-2 px-1 truncate hover:bg-white hover:bg-opacity-20 rounded-xl",
                  {
                    "bg-white bg-opacity-20": _chatId === chatId,
                  }
                )}
              >
                <a
                  href={`/chat/${_chatId}`}
                  className="text-sm font-semibold"
                >{`${_chatId}`}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No chat history found.</p>
        )}
      </div>
      <div className="flex-shrink-0 bg-white rounded-2xl text-black flex justify-between items-center px-3 py-2 gap-2">
        {status === "loading" ? (
          <div className="animate-pulse flex items-center gap-2 w-full">
            <div className="bg-gray-300 rounded-full w-9 h-9"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="">
              <img
                src={user?.image || ""}
                alt="Profile"
                className="w-9 h-9 rounded-full"
              />
            </div>
            <div className="flex-1">
              <p className="leading-none mb-1 font-bold">{user?.name}</p>
              <p className="text-xs text-slate-400 leading-none">
                {user?.email}
              </p>
            </div>
            <div>
              <Tooltip id="logout" />
              <a
                href="/api/auth/signout"
                data-tooltip-id="logout"
                data-tooltip-content="Logout"
              >
                <ArrowRightStartOnRectangleIcon width={24} height={24} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
