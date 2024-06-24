import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import RecoilRootWrapper from "@/context/RecoilRootWrapper";
import NextAuthContext from "@/context/NextAuthContext";
import 'react-tooltip/dist/react-tooltip.css'
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
        <NextAuthContext>
          <RecoilRootWrapper>{children}</RecoilRootWrapper>
        </NextAuthContext>
      </body>
    </html>
  );
}
