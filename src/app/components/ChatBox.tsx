import { PaperAirplaneIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

type Props = {
  isFileAttachEnabled?: boolean;
  rows?: number;
  getQuery: (text: string) => void;
};

export default function ChatBox({
  isFileAttachEnabled = false,
  rows = 6,
  getQuery,
}: Props) {
  return (
    <div className="flex flex-col border-mint border bg-white rounded-2xl px-8 py-4 w-full shadow-solid shadow-black">
      <textarea
        className="w-full resize-none outline-none border-none"
        placeholder=""
        rows={rows}
        onChange={(e) => getQuery(e.target.value)}
      />
      <div className="w-full flex justify-between">
        {
          isFileAttachEnabled && (
            <div className="flex items-center text-sm gap-2">
              <p className="mr-4 font-medium">Files</p>
              <Button
                onClick={() => { }}
                size="sm"
                color="mint"
                shadowColor="black"
              >
                <ArrowUpOnSquareIcon width="20" />
                Click to upload
              </Button>
              <p>or drag & drop files here</p>
            </div>
          )
        }
        <PaperAirplaneIcon width="24" />
      </div>
    </div>
  );
}
