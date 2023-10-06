import { useState } from "react";
import classNames from "classnames";
import Image from "next/image";

import { hash } from "../../utils/utils";

export default function ModelDetailsModal({
  name,
  shortDescription,
  task,
}: Model) {
  const [isHovered, setIsHovered] = useState(false);

  const randomBGColor = (name: string) => {
    const colors = [
      "bg-[#98C0C6]",
      "bg-[#F8AEAE]",
      "bg-[#6780A6]",
      "bg-[#C4E29D]",
      "bg-[#E26060]",
      "bg-[#E8BFE6]",
      "bg-[#CA4C9F]",
      "bg-[#7DC892]",
      "bg-[#9BE8F2]",
    ];
    return colors[hash(name) % colors.length];
  };

  return (
    <>
      <div
        className={classNames(
          "relative flex flex-row items-center justify-center w-10 h-10 p-2 rounded-full -ml-1 hover:z-20 hover:shadow-solid hover:shadow-black",
          randomBGColor(name),
          `data-[${name}]`
        )}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        {isHovered && (
          <InfoModal
            name={name}
            shortDescription={shortDescription}
            task={task}
          />
        )}
        <Image
          src={`/robot-${(hash(name) % 2) + 1}.svg`}
          alt="robot icon"
          width={64}
          height={64}
        />
      </div>
    </>
  );
}

function InfoModal({ name, shortDescription, task }: Model) {
  return (
    <div className="model-info absolute top-5 left-5 z-10 w-72 bg-white shadow-solid shadow-black px-6 py-4 rounded-xl flex flex-col gap-3">
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-xs text-slate-600">{task}</p>
      </div>
      <div className="text-sm text-slate-800">{shortDescription}</div>
      <div className="flex flex-row justify-between text-sm">
        <p className="underline cursor-pointer">View details</p>
        <p className="underline text-rose-700 cursor-pointer">Delete this result</p>
      </div>
    </div>
  );
}
