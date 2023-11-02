'use client';

import SocialLoginButton from "@/app/components/SocialLoginButton";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

type Props = {};

export default function page({ }: Props) {
  const { data: session } = useSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex-1 w-full h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-semibold">Sign in to ChatMedi</h1>
      <div className="my-12">
        <SocialLoginButton platform="google" />
      </div>
    </div>
  );
}

