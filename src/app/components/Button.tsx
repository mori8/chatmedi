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
  color = "mint",
  shadowColor = "black",
  children,
}: Props) {
  return (
    <div
      className={classNames(
        "cursor-pointer text-sm shadow-solid font-medium flex flex-row items-center gap-2",
        {
          "bg-mint text-black": color === "mint",
          "bg-white text-black": color === "white",
          "bg-black text-white": color === "black",
        },
        {
          "shadow-mint": shadowColor === "mint",
          "shadow-white": shadowColor === "white",
          "shadow-black": shadowColor === "black",
        }, {
          "px-3 py-3 rounded-2xl": size === "default",
          "px-2 py-1 rounded-md": size === "sm",
        }
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
