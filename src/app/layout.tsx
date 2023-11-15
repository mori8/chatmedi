import "./globals.css";

import type { Metadata } from "next";
import AuthContext from "@/context/AuthContext";

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
        <AuthContext>
          <div className="flex flex-col overflow-hidden w-screen h-screen z-0 relative bg-lightgray">
            {children}
          </div>
        </AuthContext>
      </body>
    </html>
  );
}
