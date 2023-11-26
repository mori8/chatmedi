import ModelIconWithModal from "./ModelIconWithModal";

type Props = {
  moduleName: string;
  moduleDescription: string;
  models: {
    name: string;
    cardURL: string;
  }[];
};

export default function ModuleGroupBox({
  moduleName,
  moduleDescription,
  models,
}: Props) {
  return (
    <div className="flex flex-row gap-6 items-center justify-between bg-white px-6 py-4 rounded-2xl">
      <div>
        <div className="min-w-[4rem] font-bold text-lg">{moduleName}</div>
        <div className="text-slate-500">{moduleDescription}</div>
      </div>
      <div className="flex flex-wrap content-start relative">
        {models.map((model) => {
          return <ModelIconWithModal {...model} key={model.name} />;
        })}
      </div>
    </div>
  );
}
