"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ProtectedRoute({ children, role }: { children: ReactNode; role: string }) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role && user?.role !== role) {
      router.push("/");
    }
  }, [token, user, role, router]);

  if (!token) return null; // yoki loading spinner
  return <>{children}</>;
}
