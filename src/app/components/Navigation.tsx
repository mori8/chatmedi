'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

type Props = {};

export default function Navigation({}: Props) {
  const tabList = [
    {
      name: "PLAYGROUND",
      path: "/",
    },
    {
      name: "DOCUMENTS",
      path: "/documents",
    },
  ];

  const userInfo = {
    profileImage:
      "https://camo.githubusercontent.com/021ecb0754c92a2ff6e702ad2e94d1d5863c14c28e40780edc0153a8392a7b89/68747470733a2f2f692e6962622e636f2f5964356a53584b2f726972616b756d612d7073612e706e67",
    name: "Suyeon Nam",
    email: "kaithape@gmail.com",
  };

  return (
    <div className="z-10 w-full pt-6 px-12 flex justify-between">
      <ul className="flex flex-row gap-10">
        {tabList.map((tab, index) => (
          <li key={index} className="rounded-full hover:bg-white px-4 py-1">
            <Link href={tab.path}>
              <span className="font-mono">{tab.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <AccountInfoBox {...userInfo} />
    </div>
  );
}

function AccountInfoBox({
  profileImage,
  name,
  email,
}: {
  profileImage: string;
  name: string;
  email: string;
}) {
  return (
    <div className="bg-white rounded-full px-3 py-2 shadow-solid flex items-center gap-6">
      <div className="flex flex-row gap-2 item-center">
        <div className="flex-shrink-0 rounded-full overflow-hidden">
          {/* <Image src={profileImage} width="32" height="32" alt="profile-image" /> */}
          <img src={profileImage} width="36" height="36" alt="profile-image" />
        </div>
        <div className="flex-1 flex flex-col justify-evenly">
          <h1 className="text-sm font-medium leading-none">{name}</h1>
          <p className="text-xs text-gray-400 leading-none">{email}</p>
        </div>
      </div>
      <div className="cursor-pointer" data-tooltip-id="settings" data-tooltip-content="settings">
        <Cog6ToothIcon width="24"/>
      </div>
      <Tooltip id="settings"/>
    </div>
  );
}
