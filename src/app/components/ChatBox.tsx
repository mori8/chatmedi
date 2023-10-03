type Props = {
  isFileAttachEnabled: boolean;
  rows?: number;
  getQuery: (text: string) => void;
};

export default function ChatBox({
  isFileAttachEnabled,
  rows = 6,
  getQuery,
}: Props) {
  return (
    <div className="flex flex-col border-mint border bg-white rounded-2xl px-8 py-4 w-full">
      <textarea
        className="w-full resize-none outline-none"
        placeholder="Ask me anything!"
        rows={rows}
        onChange={(e) => getQuery(e.target.value)}
      />
      <div></div>
    </div>
  );
}
