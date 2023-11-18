"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

type Props = {};

export default function Navigation({}: Props) {
  const isLogin = usePathname().startsWith("/auth/login");
  const { data: session } = useSession();

  const tabList: {
    name: string;
    path: string;
  }[] = [
    // {
    //   name: "PLAYGROUND",
    //   path: "/",
    // },
    // {
    //   name: "DOCUMENTS",
    //   path: "/documents",
    // },
  ];

  return (
    !isLogin && (
      <div className="z-10 w-full pt-6 px-12 flex justify-between">
        <ul className="flex flex-row gap-6 text-sm">
          {tabList.map((tab, index) => (
            <Link href={tab.path} key={index}>
              <li className="rounded-full hover:bg-white px-6 py-3 flex items-center leading-none">
                <span className="font-mono">{tab.name}</span>
              </li>
            </Link>
          ))}
        </ul>
        {session && <AccountInfoBox {...session.user} />}
      </div>
    )
  );
}

function AccountInfoBox({
  image,
  name,
  email,
}: {
  image?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
}) {
  return (
    <div className="bg-white rounded-full pl-3 pr-4 py-2 shadow-solid flex items-center gap-6">
      <div className="flex flex-row gap-2 item-center">
        <div className="flex-shrink-0 rounded-full overflow-hidden">
          <img
            src={image || "/user.svg"}
            width="36"
            height="36"
            alt="profile-image"
          />
        </div>
        <div className="flex-1 flex flex-col justify-evenly">
          <h1 className="text-sm font-medium leading-none">{name}</h1>
          <p className="text-xs text-gray-400 leading-none">{email}</p>
        </div>
      </div>
      <div
        className="cursor-pointer"
        data-tooltip-id="settings"
        data-tooltip-content="settings"
      >
        <Link href="/account">
          <Cog6ToothIcon width="24" />
        </Link>
      </div>
      <Tooltip id="settings" place="bottom" />
    </div>
  );
}
