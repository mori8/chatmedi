"use client";

import { useState, useEffect } from "react";

import QuestionBubbleSVG from "../icons/QuestionBubbleSVG";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import { numberSuffix } from "../../utils/utils";

type Props = {};

export default function RunHistory({}: Props) {
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [isExpanded, setisExpanded] = useState<boolean[]>([]);
  const caution = "Follow-up questions are dependent on previous questions.";

  useEffect(() => {
    setQueryHistory([
      {
        level: 1,
        date: "2023.08.23 13:13:13",
        querySummary:
          "Based on this diagnostic history, give your opinion on what prescription you would give this patient.",
        messageId: 1,
        parentMessageId: null,
      },
      {
        level: 1,
        date: "2023.08.23 13:31:31",
        querySummary:
          "Raspberries are an excellent source of vitamin C, manganese and dietary fiber. They are a very good source of copper and a good source of vitamin K, pantothenic acid, biotin, vitamin E, magnesium, folate, omega-3 fatty acids, and potassium.",
        messageId: 2,
        parentMessageId: null,
      },
      {
        level: 2,
        date: "2023.08.23 13:31:31",
        querySummary:
          "Based on this diagnostic history, give your opinion on what prescription you would give this patient.",
        messageId: 2,
        parentMessageId: 1,
      },
    ]);

    setisExpanded([false, false, false]);
  }, []);

  const ChangeIsExpanded = (index: number) => {
    const newIsExpanded = [...isExpanded];
    newIsExpanded[index] = !newIsExpanded[index];
    setisExpanded(newIsExpanded);
  };

  return (
    <div className="flex flex-col">
      <div className="run-history-header max-w-[16rem]">
        <h3 className="">Run History</h3>
        <p className="text-xs text-gray-400 mt-2">{caution}</p>
        <div className="mt-6 flex flex-col gap-4">
          {queryHistory.map((query, index) => (
            <QueryBox
              {...query}
              isExpanded={isExpanded[index]}
              changeIsExpanded={ChangeIsExpanded}
              key={index}
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
  querySummary,
  anotherQueries,
  isExpanded,
  ChangeIsExpanded,
}: {
  level: number;
  date: string;
  querySummary: string;
  anotherQueries?: string[];
  isExpanded: boolean;
    ChangeIsExpanded: (index: number) => void;
}) {
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
          <p className="text-gray-500">{date}</p>
        </div>
        <p className="text-sm line-clamp-2 hover:line-clamp-none mt-1">
          {querySummary}
        </p>
        {/* {anotherQueries?.map((query, index) => (
         
        ))} */}
        <div
          className="text-turquiose flex flex-row items-center gap-2 mt-1"
          onClick={() => ChangeIsExpanded(level)}
        >
          <EllipsisHorizontalCircleIcon width={20} />
          <p className="text-xs">
            {isExpanded ? "close" : "View edit history"}
          </p>
        </div>
      </div>
    </div>
  );
}
