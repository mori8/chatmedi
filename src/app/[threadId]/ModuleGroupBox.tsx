import Image from "next/image";
import classNames from "classnames";
import { hash } from "../../utils/utils"

export default function ModuleGroupBox({
  messageId,
  moduleName,
  models,
  summary,
}: Module) {
  const randomBGColor = (name: string) => {
    const colors = ["bg-[#98C0C6]", "bg-[#F8AEAE]", "bg-[#6780A6]", "bg-[#C4E29D]", "bg-[#E26060]", "bg-[#E8BFE6], bg-[#CA4C9F]", "bg-[#7DC892]", "bg-[#9BE8F2]"];
    return colors[hash(name) % colors.length];
  }

  return (
    <div className="flex flex-row gap-6">
      <div className="min-w-[10rem] font-bold">{moduleName}</div>
      <div className="flex flex-wrap min-w-[8rem] content-start">
        {models.map((model) => {
          return <div className={
            classNames("flex flex-row items-center justify-center w-10 h-10 p-2 rounded-full shadow-black -ml-1", randomBGColor(model.name))
          }>
            <Image src={`/robot-${Math.round(Math.random() + 1)}.svg`} alt="robot icon" width={64} height={64} />
          </div>;
        })}
      </div>
      <div>{summary}</div>
    </div>
  );
}
