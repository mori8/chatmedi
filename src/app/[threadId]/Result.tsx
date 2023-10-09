import React from "react";
import Image from "next/image";

import MarkdownRenderer from "../components/MarkdownRenderer";


export default function Result({ image, text }: Result) {
  return (
    <div>
      <MarkdownRenderer markdown={text} />
    </div>
  );
}
