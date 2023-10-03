'use client';

import ChatBox from "./components/ChatBox";
import { useState } from "react";


export default function Home() {
  const [query, setQuery] = useState<string>("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-[64rem] w-full">
        <ChatBox
          isFileAttachEnabled={true}
          getQuery={(text: string) => {
            setQuery(text);
          }}
        />
      </div>
    </main>
  );
}
