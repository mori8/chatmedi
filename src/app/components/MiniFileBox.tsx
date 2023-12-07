import React from "react";

import {
  PhotoIcon,
  XMarkIcon,
  DocumentTextIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";

type Props = {
  file?: File;
  fileName?: string;
  deleteEnabled?: boolean;
  onClick?: () => void;
};

export default function MiniFileBox({
  file,
  fileName,
  deleteEnabled = true,
  onClick,
}: Props) {
  const fileType = file ? file.name.split(".")[1] : fileName?.split(".")[1];

  const renderFileIcon = () => {
    switch (fileType) {
      case "png":
      case "jpg":
        return <PhotoIcon width="20" color="#D37A47" />;
      case "txt":
        return <DocumentTextIcon width="20" color="#5ABEB8" />;
      default:
        return <CodeBracketSquareIcon width="20" color="#CA4C9F" />;
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-[280px] shadow-solid rounded-md px-2 py-1 border border-black bg-white">
      {file && (
        <>
          <div className="flex-shrink-0">{renderFileIcon()}</div>
          <p className="text-sm truncate">{file.name}</p>
        </>
      )}
      {fileName && (
        <>
          <div className="flex-shrink-0">{renderFileIcon()}</div>
          <p className="text-sm truncate">{fileName}</p>
        </>
      )}
      {deleteEnabled && (
        <button
          className="flex items-center justify-center w-6 h-6 rounded-full transition ease-in-out"
          onClick={onClick}
        >
          <XMarkIcon width="16" />
        </button>
      )}
    </div>
  );
}
