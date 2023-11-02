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
      <h1 className="text-2xl font-semibold">Log in to ChatMedi</h1>
      <p className="mt-4 text-slate-700">You must be logged in to use the ChatMedi service.</p>
      <div className="my-8">
        <SocialLoginButton platform="google" />
      </div>
    </div>
  );
}

