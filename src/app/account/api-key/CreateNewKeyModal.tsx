"use client";
import { useState, useRef, useEffect } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/app/components/Button";

type Props = {
  onClose: () => void;
};

export default function CreateNewKeyModal({ onClose }: Props) {
  const [keyName, setKeyName] = useState<string>("");
  const KeyNameInputElement = useRef<HTMLInputElement>(null);

  const handleKeyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyName(e.target.value);
  }

  useEffect(() => {
    if (KeyNameInputElement.current) {
      KeyNameInputElement.current.focus();
    }
  }, []);

  return (
    <div className="bg-black bg-opacity-50 w-screen h-screen top-0 left-0 fixed z-20" onClick={onClose}>
      <div className="py-6 px-8 bg-white fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-solid">
        <div className="flex gap-16">
          <h3 className="font-medium text-lg">Create a new API Key</h3>
        </div>
        <div className="mt-3 mb-8">
          <label htmlFor="key-name" className="text-sm font-medium block mb-2">Key Name</label>
          <input id="key-name" type="text" value={keyName} onChange={handleKeyNameChange} className="shadow-solid px-4 py-2 border border-black rounded-xl w-80" placeholder="My Key" ref={KeyNameInputElement} />
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex-1"></div>
          <div className="flex flex-row gap-2">
            <Button onClick={onClose} size="sm" color="white">
              Cancel
            </Button>
            <Button onClick={onClose} size="sm">
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
