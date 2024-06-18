import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import RecoilRootWrapper from "@/context/RecoilRootWrapper";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatMedi",
  description: "life is tough",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <RecoilRootWrapper>{children}</RecoilRootWrapper>
      </body>
    </html>
  );
}
