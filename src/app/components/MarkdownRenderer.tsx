import React from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  markdown: string;
};

// li, ol, ul, p, h1, h2, h3, h4, h5, blockquote, em, strong, a, code, hr, table, thead, tbody, tr, th, td, pre

export default function MarkdownRenderer({ markdown }: Props) {
  return (
    <div className="leading-loose font-md result-text-container">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
