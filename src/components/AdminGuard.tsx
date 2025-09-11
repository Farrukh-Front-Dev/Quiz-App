"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) router.push("/login/admin");
  }, [user, router]);

  if (!user) return null; // login qilinmagan bo‘lsa sahifa ko‘rinmaydi
  return <>{children}</>;
}
