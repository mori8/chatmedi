import "./globals.css";
import type { Metadata } from "next";
import { usePathname } from "next/navigation";

import Navigation from "./components/Navigation";
import SideBar from "./SideBar";
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
          <div className="flex flex-row overflow-hidden w-full h-full z-0 relative bg-lightgray">
            <SideBar />
            <div className="relative h-screen min-h-screen overflow-y-scroll flex-1 overflow-hidden flex flex-col pb-24">
              <Navigation />
              {children}
            </div>
          </div>
        </AuthContext>
      </body>
    </html>
  );
}
