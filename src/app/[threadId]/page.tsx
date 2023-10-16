"use client";

import { useEffect, useState } from "react";

import SurfingSVG from "../icons/SurfingSVG";
import ChatBox from "../components/ChatBox";
import ModuleGroupBox from "./ModuleGroupBox";
import RunHistory from "../components/RunHistory";
import Result from "./Result";

type Props = {
  params: {
    threadId: string;
  };
};

export default function page({ params }: Props) {
  // now selected query -> 전역 상태로 관리
  const [hasFetched, setHasFetched] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [message, setMessage] = useState<
    { messageId: number; message: string }[]
  >([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  // 질문 레벨에 따라 한 번 메세지 묶는 작업 필요

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

    setResults([
      {
        messageId: 1,
        image: null,
        text: `This is a treatment suggestion for the patient you described:
IVIG instead of high-dose steroids for DM comorbidities
- IVIG 0.5 g/kg/day * 4 days (2022-04-13 to 2022-04-16), total 2 g/kg
- Reported significant improvement in symptoms of dizziness and night sweats at discharge after receiving IVIG
Psychiatric consultation performed for insomnia and past diagnosis of depression
- Findings: r/o adjustment disorder, r/o sleep disorder, mild depression, and insomnia confirmed
- Insomnia improved after addition of mirtazapine 3.75 mg bedtime
Discharge meds: donepezil d/c and choline alfoscerate, maintained on mirtazapine only`,
      },
    ]);
  }, []);

  return (
    <div className="flex-1 w-full flex flex-row items-start gap-12 p-12">
      <div className="max-w-[64rem]">
        {message.map((message) => (
          <div className="flex flex-col gap-16">
            <section className="section-chatbox w-full">
              <ChatBox
                key={message.messageId}
                getQuery={() => {}}
                query={message.message}
              />
            </section>

            <section className="section-modules">
              <SectionTitle>Analyzing ...{hasFetched && "Done"}</SectionTitle>
              <div className="flex flex-col gap-6 mt-8">
                {modules.length &&
                  modules
                    .filter((module) => module.messageId === message.messageId)
                    .map((module) => (
                      <ModuleGroupBox key={module.moduleName} {...module} />
                    ))}
              </div>
            </section>

            <section className="section-result">
              <SectionTitle>Result</SectionTitle>
              {results
                .filter((result) => result.messageId === message.messageId)
                .map((message) => (
                  <div className="flex flex-col gap-6 mt-8">
                    {results.length &&
                      results
                        .filter(
                          (result) => result.messageId === message.messageId
                        )
                        .map((result) => (
                          <Result key={result.messageId} {...result} />
                        ))}
                  </div>
                ))}
            </section>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0">
        <RunHistory />
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
