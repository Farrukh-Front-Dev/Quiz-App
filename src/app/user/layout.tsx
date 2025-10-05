"use client";

import { ReactNode } from "react";
import UserNavbar from "@/components/user/userNavbar";
import UserFooter from "@/components/user/UserFooter";

type Props = {
  children: ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
      <UserFooter />
    </div>
  );
}
