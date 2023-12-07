import React from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  markdown: string;
};

// li, ol, ul, p, h1, h2, h3, h4, h5, blockquote, em, strong, a, code, hr, table, thead, tbody, tr, th, td, pre

export default function MarkdownRenderer({ markdown }: Props) {
  return (
    <div className="result-text-container max-w-none prose prose-slate lg:prose-lg prose-li:m-0 prose-ul:[margin-block-end:0] prose-ul:[margin-block-start:0] prose-li:[margin-top:-1.2rem] prose-ol:[margin:0] prose:[w-full]">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
