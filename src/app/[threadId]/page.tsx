"use client";

import { useEffect, useState } from "react";

import SurfingSVG from "../icons/SurfingSVG";
import ChatBox from "../components/ChatBox";
import ModuleGroupBox from "./ModuleGroupBox";

type Props = {
  params: {
    threadId: string;
  };
};

export default function page({ params }: Props) {
  const [hasFetched, setHasFetched] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [message, setMessage] = useState<
    { messageId: number; message: string }[]
  >([]);
  const [modules, setModules] = useState<Module[]>([]);
  // 난 무섭다 데이터가 어떻게 생겼을지 가늠도 안된다

  useEffect(() => {
    setThreadId(params.threadId);
  }, [params.threadId]);

  const editMessage = (messageId: number, text: string) => {
    // TODO: fetch edited query to server

    // TODO: (then) update message state
    setMessage((prev) => {
      const index = prev.findIndex(
        (message) => message.messageId === messageId
      );
      if (index !== -1) {
        const newMessage = [...prev];
        newMessage[index].message = text;
        return newMessage;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (threadId) {
      // TODO: fetch thread
      setMessage([
        {
          messageId: 1,
          message: `Based on this diagnostic history, give your opinion on what prescription you would give this patient.

2021-03 Visual hallucination
수면과 관계없이 밤낮으로 귀신이나 괴물이 보인다
눈을 감으면 귀신이 보이고 말을 하는 것 같아 입면이 어려움

2021-05 Cognitive impairment
인지저하 증상이 발생
Memory - 하려던 행동을 기억하지 못하거나, 전날 있었던 일을 힌트를 주어도 떠올리지 못하는
short term memory loss 발생
- 원래 잘 외우던 지인들 전화번호를 기억하지 못함
Language - 문맹이지만 아들 이름은 쓸 수 있었는데 최근에는 쓰지 못함
- 말할 때 단어를 빨리 떠올리지 못하여 더듬는 모습을 보이고 이전에 비해 말수가 줄어듦
Visuospatial - 이전과 크게 다르지 않음, 혼자 길을 잘 찾아다님
Executive - 집안일 이전처럼 잘 하고 혼자 대중교통 이용도 가능
ADL - 혼자 위생관리 잘하며 적절한 옷도 잘 골라 입음, 농사일도 유지`,
        },
      ]);
    }
  }, [threadId]);

  useEffect(() => {
    setModules([
      {
        messageId: 1,
        moduleName: "Dementia diagnosis",
        models: [
          {
            name: "SPMM",
            shortDescription: "model for molecule generation",
            task: "property_to_molecule",
          },
          {
            name: "DEMO1",
            shortDescription: "demo model",
            task: "property_to_molecule",
          },
          {
            name: "DEMO2",
            shortDescription: "demo model",
            task: "property_to_molecule",
          },
          {
            name: "DEMO3",
            shortDescription: "demo model",
            task: "property_to_molecule",
          },
          {
            name: "DEMO4",
            shortDescription: "demo model",
            task: "property_to_molecule",
          },
        ],
        summary:
          "Lorem ipsum dolor sit amet consectetur. Arcu euismod ornare vel ut aliquet et lacus vel. Accumsan ante cursus pellentesque nunc duis. Et blandit malesuada non facilisis. Potenti enim morbi gravida sit. Gravida tortor bibendum orci sit elit in tempus ante accumsan. Luctus eget faucibus congue tempor egestas volutpat interdum viverra.",
      },
    ]);
  }, []);

  return (
    <div className="flex flex-col items-center p-12 gap-12">
      <div className="max-w-[64rem] w-full">
        {message.map((message) => (
          <>
            <div className="chatbox-wrapper w-full mb-12">
              <ChatBox
                key={message.messageId}
                getQuery={() => {}}
                query={message.message}
              />
            </div>
            <SectionTitle>Analyzing ...{hasFetched && "Done"}</SectionTitle>
            <div className="mt-8 flex flex-col gap-6">
              {modules.length && (
                <ModuleGroupBox
                  {...modules?.find(
                    (module) => module.messageId === message.messageId
                  )}
                />
              )}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-4">
      <SurfingSVG />
      <h3 className="text-lg font-bold">{children}</h3>
    </div>
  );
}
