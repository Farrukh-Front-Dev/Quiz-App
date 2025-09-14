"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: string;
}) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!token) {
        router.push("/login");
        return;
      }
      if (role && user?.role !== role) {
        router.push("/");
      }
    }
  }, [mounted, token, user, role, router]);

  if (!mounted) {
    // SSR va client bir xil HTML qaytaradi -> mismatch bo‘lmaydi
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!token) return null;
  return <>{children}</>;
}
