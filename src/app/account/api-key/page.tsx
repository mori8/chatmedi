"use client";

import { useState, useEffect } from "react";

import { ClipboardIcon, TrashIcon, EyeIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import Button from "@/app/components/Button";
import CreateNewKeyModal from "./CreateNewKeyModal";


type Props = {};

export default function Home({}: Props) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeysVisibility, setApiKeysVisibility] = useState<boolean[]>([]);
  const [isCreateNewKeyModalOpened, setIsCreateNewKeyModalOpened] = useState<boolean>(false);

  useEffect(() => {
    setApiKeys([
      {
        id: 1,
        name: "ChatMedi",
        key: "1234567890",
      },
    ]);

    setApiKeysVisibility(Array(1).fill(false));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteApiKey = (key: string) => {
    // fetch api
  };

  const openCreateNewKeyModal = () => {
    setIsCreateNewKeyModalOpened(true);
  }

  const changeVisibility = (index: number) => {
    setApiKeysVisibility((prev) => {
      const newVisibility = [...prev];
      // 로직이상함.. 데이터 들어오는 거 보고 다시 짜야할듯
      newVisibility[index - 1] = !newVisibility[index - 1];
      return newVisibility;
    });
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
      <div className="flex mt-12">
        <Button onClick={() => openCreateNewKeyModal()} size="sm">
          <PlusSmallIcon width="20"/>
          create a new API Key
        </Button>
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
          {apiKeys.map((apiKey, index) => (
            <div
              key={index}
              className="flex flex-row items-center px-6 py-3 border-b border-slate-200"
            >
              <div className="w-48">
                <span className="text-slate-800">{apiKey.name}</span>
              </div>
              <div className="flex-1 flex items-center">
                <span className="text-slate-800">
                  <input value={apiKey.key} className="bg-transparent" type={
                    apiKeysVisibility[index] ? "text" : "password"
                  } />
                </span>
                <button onClick={() => changeVisibility(apiKey.id)}>
                  <EyeIcon width="20" className="ml-2" />
                </button>
              </div>
              <div className="flex flex-row gap-4">
                <button
                  className="text-slate-800"
                  onClick={() => copyToClipboard(apiKey.key)}
                >
                  {/* tooltip - copied! */}
                  <ClipboardIcon width="20" />
                </button>
                <button onClick={() => deleteApiKey(apiKey.key)}>
                  <TrashIcon width="20" className=" text-rose-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
