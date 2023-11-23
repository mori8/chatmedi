export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-4 not-prose mt-5 mb-4">
      <h3 className="text-xl lg:text-2xl font-bold">{children}</h3>
    </div>
  );
}
