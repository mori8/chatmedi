"use client";

import { useState, useEffect } from "react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import SectionTitle from "./SectionTitle";
import { extractKeyValuePairs } from "@/utils/utils";

type Props = {
  isImageIncluded?: boolean;
  content: string;
};

export default function ResultTextWrapper({ isImageIncluded = false, content }: Props) {
  const [parsedContent, setParsedContent] = useState<any>();

  useEffect(() => {
    const parsed = extractKeyValuePairs(content);
    setParsedContent(parsed);
  }, []);

  console.log(parsedContent);

  return (
    <div>
      {parsedContent &&
        Object.keys(parsedContent).map((key, index) => {
          if (key === "Result") {
            return (
              <div key={index} className="mt-10">
                {!isImageIncluded && <SectionTitle>{key}</SectionTitle>}
                <MarkdownRenderer markdown={parsedContent[key]} />
              </div>
            );
          }
          return (
            <div key={index} className="mt-10">
              <SectionTitle>{key}</SectionTitle>
              <MarkdownRenderer markdown={parsedContent[key]} />
            </div>
          );
        })}
    </div>
  );
}
