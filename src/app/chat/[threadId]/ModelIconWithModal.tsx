import { useState } from "react";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";

import { hash, randomBGColor } from "../../../utils/utils";

export default function ModelDetailsModal({
  name,
  cardURL,
}: {
  name: string;
  cardURL: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

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
        {isHovered && <InfoModal name={name} cardURL={cardURL} />}
        <Image
          src={`/robot-${(hash(name) % 2)}.svg`}
          alt="robot icon"
          width={64}
          height={64}
        />
      </div>
    </>
  );
}

function InfoModal({ name, cardURL }: { name: string; cardURL: string }) {
  return (
    <div className="model-info absolute top-5 left-5 z-10 bg-white shadow-solid shadow-black px-6 py-4 rounded-xl flex flex-col gap-2 not-prose">
      <div>
        <p className="font-bold text-sm">{name}</p>
      </div>
      <div className="flex flex-row justify-between text-sm">
        {/* TODO: add link to model card */}
        <Link href={"/"}>
          <p className="underline text-slate-700 cursor-pointer">
            View details →
          </p>
        </Link>
      </div>
    </div>
  );
}
