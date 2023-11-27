"use client";

import { useState, useEffect } from "react";

import QuestionBubbleSVG from "../icons/QuestionBubbleSVG";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import { numberSuffix } from "../../utils/utils";

type Props = {
  chats: ChatInfo[];
};

export default function RunHistory({ chats }: Props) {
  const [isExpanded, setisExpanded] = useState<boolean[]>([]);
  const caution = "Follow-up questions are dependent on previous questions.";

  const ChangeIsExpanded = (index: number) => {
    const newIsExpanded = [...isExpanded];
    newIsExpanded[index] = !newIsExpanded[index];
    setisExpanded(newIsExpanded);
  };

  return (
    <div className="flex flex-col">
      <div className="run-history-header max-w-[16rem]">
        <h3 className="text-xs font-bold mt-6">RUN HISTORY</h3>
        {/* <p className="text-xs text-gray-400 mt-2">{caution}</p> */}
        <div className="mt-6 flex flex-col gap-4">
          {chats
            .filter((chat) => chat.role === "user")
            .map((query, index) => (
              <QueryBox
                query={query.content.user_input || ""}
                date={query.created_at}
                messageId={query.message_id}
                isExpanded={isExpanded[index]}
                ChangeIsExpanded={ChangeIsExpanded}
                key={index}
                level={index + 1}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function QueryBox({
  level,
  date,
  query,
  isExpanded,
  ChangeIsExpanded,
  messageId,
}: {
  level: number;
  date: string;
  query: string;
  anotherQueries?: string[];
    isExpanded: boolean;
  messageId: string;
  ChangeIsExpanded: (index: number) => void;
  }) {
  const createdAt = new Date(date);
  return (
    <div className="flex flex-row items-start gap-4">
      <div className="flex-shrink-0 rounded-full bg-black p-2">
        <QuestionBubbleSVG />
      </div>
      <div className="flex-1">
        <div className="text-xs flex flex-row justify-between">
          <p className="font-medium">
            <span>{numberSuffix(level)}</span> Question
          </p>
          <p className="text-gray-500">{createdAt.toDateString()}</p>
        </div>
        <p className="text-sm line-clamp-2 mt-1">
          {query}
        </p>
        {/* {anotherQueries?.map((query, index) => (
         
        ))} */}
        {/* <div
          className="text-turquiose flex flex-row items-center gap-2 mt-1"
          onClick={() => ChangeIsExpanded(level)}
        >
          <EllipsisHorizontalCircleIcon width={20} />
          <p className="text-xs">
            {isExpanded ? "close" : "View edit history"}
          </p>
        </div> */}
      </div>
    </div>
  );
}
