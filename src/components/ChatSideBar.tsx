import React from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

type Props = {};

export default function ChatSideBar({ }: Props) {
  const username = "Suyeon Nam";
  const email = "kaithape@gmail.com";
  const profileImage = "https://github.com/mori8.png";


  return (
    <div className="bg-palatinate text-alabaster px-4 pt-5 pb-4 rounded-3xl h-full flex flex-col min-w-64 box-border text-sm">
      <div className="flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold">ChatMedi</h1>
        </div>
        <div>
          <button className="flex items-center gap-1 bg-xanthous text-black py-2 px-3 rounded-2xl font-medium">
            <PlusIcon width={20} height={20} /> New chat
          </button>
        </div>
      </div>
      <div className="flex-1">

      </div>
      <div className="flex-shrink-0 bg-white rounded-2xl text-black flex justify-between items-center px-3 py-2 gap-2">
        <div className="">
          <img src={profileImage} alt="Profile" className="w-9 h-9 rounded-full" />
        </div>
        <div className="flex-1">
          <p className="leading-none mb-1 font-bold">{username}</p>
          <p className="text-xs text-slate-400 leading-none">{email}</p>
        </div>
        <div>
          <Cog6ToothIcon width={24} height={24} />
        </div>
      </div>
    </div>
  );
}
