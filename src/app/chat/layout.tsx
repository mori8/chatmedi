import React from 'react';
import dynamic from 'next/dynamic';

const ChatSideBar = dynamic(() => import('../../components/ChatSideBar'), {
  ssr: false,
});

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex h-screen p-4 gap-10">
      <div className="flex-shrink-0">
        <ChatSideBar />
      </div>
      <div className="flex-1 p-4 text-slate-900 leading-snug flex flex-col gap-8 max-w-[940px]">
        {children}
      </div>
    </div>
  );
}
