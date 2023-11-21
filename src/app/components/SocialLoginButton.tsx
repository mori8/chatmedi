"use client";

import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

type Props = {
  platform: string;
  onClick?: () => void;
};

export default function SocialLoginButton({ platform, onClick }: Props) {

  return (
    <button
      onClick={ onClick ? onClick : () => signIn(platform)}
      className="flex items-center justify-center w-72 h-12 px-4 py-2 text-black bg-white rounded-full shadow-solid"
    >
      <div className="flex items-center justify-center w-5 h-5 mr-2">
        <Image
          src={`/${platform}.webp`}
          width={20}
          height={20}
          alt="google logo"
        />
      </div>
      <span className="font-medium">Log in with {platform}</span>
    </button>
  );
}
