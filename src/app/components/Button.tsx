import classNames from "classnames";

type Props = {
  onClick: () => void;
  size?: "sm" | "default";
  color?: string;
  shadowColor?: string;
  children: React.ReactNode;
};

export default function Button({
  onClick,
  size = "default",
  color = "kaistlightblue",
  shadowColor = "black",
  children,
}: Props) {
  return (
    <div
      className={classNames(
        "cursor-pointer text-sm shadow-solid font-medium flex flex-row items-center gap-2 border border-black",
        {
          "bg-kaistlightblue text-black": color === "kaistlightblue",
          "bg-white text-black": color === "white",
          "bg-black text-white": color === "black",
        },
        {
          "shadow-kaistlightblue": shadowColor === "kaistlightblue",
          "shadow-white": shadowColor === "white",
          "shadow-black": shadowColor === "black",
        }, {
          "px-3 py-3 rounded-xl": size === "default",
          "px-3 py-2 rounded-md": size === "sm",
        }
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
