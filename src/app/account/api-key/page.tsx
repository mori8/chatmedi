"use client";

import { useState, useEffect } from "react";

import { ClipboardIcon, EyeIcon, ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import CreateNewKeyModal from "./CreateNewKeyModal";


type Props = {};

export default function Home({}: Props) {
  const [apiKey, setApiKey] = useState<ApiKey>();
  const [apiKeyVisibility, setApiKeyVisibility] = useState<boolean>(false);
  const [isCreateNewKeyModalOpened, setIsCreateNewKeyModalOpened] = useState<boolean>(false);

  useEffect(() => {
    // TODO: fetch api key from server
    setApiKey(
      {
        id: 1,
        name: "ChatMedi",
        key: "1234567890",
      },
    );

    setApiKeyVisibility(false);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateApiKey = () => {
    // fetch new api key from server
  };

  const openCreateNewKeyModal = () => {
    setIsCreateNewKeyModalOpened(true);
  }

  const changeVisibility = () => {
    setApiKeyVisibility((prev) => {
      return !prev;
    })

  }

  return (
    <div className="pl-16 pr-16 lg:pr-96 py-8">
      {
        isCreateNewKeyModalOpened && (
          <CreateNewKeyModal
            onClose={() => setIsCreateNewKeyModalOpened(false)}
          />
        )
      }
      <div>
        <h2 className="font-bold text-lg">API Keys</h2>
        <p className="mt-4 text-slate-800 leading-6">
          API keys are used to authenticate requests to ChatMedi APIs. You can
          create multiple API keys for different purposes.
        </p>
      </div>
      <div className="mt-8 text-sm">
        <div className="table-header flex flex-col font-medium">
          <div className="table-header flex flex-row bg-white rounded-full px-6 py-2">
            <div className="w-48">
              <span className="text-slate-800">Name</span>
            </div>
            <div className="flex-1">
              <span className="text-slate-800">Key</span>
            </div>
          </div>
        </div>
        <div className="table-body">
            <div
              className="flex flex-row items-center px-6 py-3 border-b border-slate-200"
            >
              <div className="w-48">
                <span className="text-slate-800">{apiKey?.name}</span>
              </div>
              <div className="flex-1 flex items-center">
                <span className="text-slate-800">
                  <input value={apiKey?.key} className="bg-transparent" type={
                    apiKeyVisibility ? "text" : "password"
                  } />
                </span>
                <button onClick={() => changeVisibility()}>
                  <EyeIcon width="20" className="ml-2" />
                </button>
              </div>
              <div className="flex flex-row gap-4">
                <button
                  className="text-slate-800"
                  onClick={() => copyToClipboard(apiKey?.key || "")}
                >
                  <ClipboardIcon width="20" />
                </button>
                <button onClick={() => regenerateApiKey()}>
                  <ArrowPathRoundedSquareIcon width="20" />
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
