"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";

type Props = {};

export default function AccountSideBar({}: Props) {
  const [nosSelected, setNosSelected] = useState(-1);
  const pathname = usePathname();
  const menuItems = [{ index: 0, name: "API Keys", href: "/account/api-key" }];

  useEffect(() => {
    const index = menuItems.findIndex((item) => item.href === pathname);
    setNosSelected(index);
  }, [pathname]);

  return (
    <div className="w-[260px] p-5 pt-8 flex flex-col gap-14 h-full">
      <Link href="/">
        <div className="">
          <span className="font-mono">CHATMEDI</span>
        </div>
      </Link>
      {menuItems.map((item, index) => (
        <div
          key={index}
          className={
            classNames(
              "flex flex-row gap-4 rounded-full hover:bg-white px-5 py-2",
              {
                "bg-white": index === nosSelected,
              }
            ) + " cursor-pointer"
          }
        >
          <span className="text-slate-900 text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
