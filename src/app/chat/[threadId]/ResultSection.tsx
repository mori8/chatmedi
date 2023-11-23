"use client";

import { useState, useEffect } from "react";

import ModuleGroupBox from "./ModuleGroupBox";
import ResultTextWrapper from "./ResultTextWrapper";

type Props = {
  threadId: string;
  plan: ChatInfo;
};

export default function ResultSection({ threadId, plan }: Props) {
  const messageId = plan.message_id; // = chat_id
  const [tools, setTools] = useState<Tool>();

  // 이 컴포넌트에서 tool까지는 보여줄 수 있음 (/chat/plan까지)
  // /chat에서 나오는 답변은 ResultTextWrapper에서 보여줌

  useEffect(() => {
    const executePlan = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat/plan-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: messageId,
        }),
      }).then((res) => res.json())
        .catch((err) => {
          console.log(err);
        }
        );
      return res.data;
    }

    executePlan().then((data) => {
      setTools(data);
    });

  }, []);

  return (
    <div className="flex flex-col gap-4 mb-16">
      <section className="section-result leading-normal">
        <ResultTextWrapper key={plan.message_id}  content={"hi"} />
      </section>
    </div>
  );
}
