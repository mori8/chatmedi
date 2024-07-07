// components/Modal.tsx
import React, { useEffect, useState } from "react";

interface ModalProps {
  onClose: () => void;
}

const ModelSwappingModal: React.FC<ModalProps> = ({ onClose }) => { 
  const [alternativeModels, setAlternativeModels] = useState<string[]>([
    "DxD-KAIST/mindful-cxr-reporter",
    "DxD-KAIST/mindful-cxr-reporter-v2",
  ]);
  const task = "report-to-cxr-generation";

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("modal-overlay")) {
        onClose();
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl max-w-md w-full flex flex-col">
        <h2 className="text-xl font-semibold mb-1">Select Alternative Model</h2>
        <p className="text-sm mb-4 text-slate-600">Here you can choose another model to process <span className="font-bold">{task}</span> task.</p>
        <div className="flex flex-col gap-2">
          {alternativeModels.map((model) => (
            <div key={model} className="flex items-center justify-between pl-3 pr-2 py-1 text-sm bg-slate-100 rounded-xl">
              <span>{model}</span>
              <button className="bg-xanthous px-3 py-2 rounded-xl">Select</button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 bg-slate-200 text-slate-600 px-4 py-2 rounded-xl self-end">
          Close
        </button>
      </div>
    </div>
  );
};

export default ModelSwappingModal;
