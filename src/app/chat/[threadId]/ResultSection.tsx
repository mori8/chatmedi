"use client";

import { useState, useEffect } from "react";

import ResultTextWrapper from "./ResultTextWrapper";
import { getImageURL } from "@/utils/utils";
import SectionTitle from "./SectionTitle";

type Props = {
  resultImageName?: string;
  chat?: ChatInfo;
};

export default function ResultSection({ resultImageName, chat }: Props) {
  const [resultImageURL, setResultImageURL] = useState<string | null>("");

  useEffect(() => {
    if (resultImageName) {
      getImageURL(resultImageName).then((url) => {
        setResultImageURL(url);
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-16">
      <section className="section-result leading-normal">
        {resultImageURL && (
          <div className="mt-10">
            <SectionTitle>Result</SectionTitle>
            <div className="result-image-wrapper w-full flex items-center justify-center">
              <img src={resultImageURL} className="w-96 h-96" />
            </div>
          </div>
        )}
        {chat && (
          <ResultTextWrapper
            isImageIncluded={resultImageURL ? true : false}
            key={chat.message_id}
            content={chat.content.result || ""}
          />
        )}
      </section>
    </div>
  );
}
