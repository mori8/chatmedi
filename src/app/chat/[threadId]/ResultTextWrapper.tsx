import React from "react";
import Image from "next/image";

import MarkdownRenderer from "../../components/MarkdownRenderer";

type Props = {
  content: string
}

export default function ResultTextWrapper({ content }: Props) {
  return (
    <div>
      <MarkdownRenderer markdown={content} />
    </div>
  );
}
