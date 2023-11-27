import React from "react";

type Props = {};

export default function LoadingSpinner({}: Props) {
  return (
    <div className="flex flex-row gap-4 image-center justify-center">
      <div className="border-gray-300 h-8 w-8 animate-spin rounded-full border-4 border-t-teal-500" />
      <span className="text-slate-500 text-lg">Generating results...</span>
    </div>
  );
}
