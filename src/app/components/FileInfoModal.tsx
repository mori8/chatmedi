import { useState } from "react";

import Button from "./Button";

type Props = {
  onClose: () => void;
};

export default function FileInfoModal({ onClose }: Props) {
  const [fileInfo, setFileInfo] = useState<string>("");

  const saveFileInfo = () => {
    // fetch data
    // then
    onClose();
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileInfo(e.target.value);
  }

  return (
    <div className="bg-black bg-opacity-50 fixed z-10 w-screen h-screen top-0 left-0">
      <div className="bg-white border border-black p-6 absolute top-1/2 left-1/2 z-20 rounded-xl shadow-solid -translate-x-1/2 -translate-y-1/2">
        <h4 className="font-bold text-base">Which part is this scan for?</h4>
        <p className="text-xs text-slate-500 mt-1">
          This information helps the model output more accurate information.
        </p>
        <input
          type="text"
          placeholder="type here..."
          value={fileInfo}
          onChange={onChange}
          className="shadow-solid shadow-gray-600 rounded-full py-2 px-4 border border-black mt-5 mb-8 w-full"
        />
        <div className="flex justify-between items-end">
          <Button onClick={onClose} size="sm" color="white">
            back
          </Button>
          <Button onClick={saveFileInfo} size="sm">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
