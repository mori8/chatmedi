import React from "react";

type Props = {
  status: "controller" | "function" | "assistant" | "user" | undefined;
};

export default function LoadingSpinner({ status }: Props) {
  const message = {
    controller: "Planning to perform a task...",
    function: "Generating results...",
    assistant: "",
    user: "Planning to perform a task...",
  };

  return (
    <div className="flex flex-row gap-4 image-center justify-center">
      <div className="border-gray-300 h-8 w-8 animate-spin rounded-full border-4 border-t-teal-500" />
      <span className="text-slate-500 text-lg">{status ? message[status] : "Loading..."}</span>
    </div>
  );
}
