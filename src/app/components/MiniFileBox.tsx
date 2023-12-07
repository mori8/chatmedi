import React from "react";

import {
  PhotoIcon,
  XMarkIcon,
  DocumentTextIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";

type Props = {
  file: File;
  onClick?: () => void;
};

export default function MiniFileBox({ file, onClick }: Props) {
  const fileType = file.type.split("/")[0];

  const renderFileIcon = () => {
    switch (fileType) {
      case "image":
        return <PhotoIcon width="20" color="#D37A47" />;
      case "text":
        return <DocumentTextIcon width="20" color="#5ABEB8" />;
      default:
        return <CodeBracketSquareIcon width="20" color="#CA4C9F" />;
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-[280px] shadow-solid rounded-md px-2 py-1 border border-black">
      <div className="flex-shrink-0">{renderFileIcon()}</div>
      <p className="text-sm truncate">{file.name}</p>
      <button
        className="flex items-center justify-center w-6 h-6 rounded-full transition ease-in-out"
        onClick={onClick}
      >
        <XMarkIcon width="16" />
      </button>
    </div>
  );
}
