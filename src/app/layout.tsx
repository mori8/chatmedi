import "./globals.css";
import type { Metadata } from "next";
import SideBar from "./components/SideBar";

export const metadata: Metadata = {
  title: "ChatMedi",
  description: "AI assistant for medical professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-row overflow-hidden w-full h-full z-0 relative">
          <SideBar />
          <div className="relative flex h-full max-w-full flex-1 overflow-hidden bg-lightgray">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
