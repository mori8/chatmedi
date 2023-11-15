import React from "react";
import AccountSideBar from "./AccountSideBar";
import Navigation from "../components/Navigation";

type Props = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: Props) {
  return (
    <div className="flex flex-row">
      <AccountSideBar />
      <div>
        <Navigation />
        {children}
      </div>
    </div>
  );
}
