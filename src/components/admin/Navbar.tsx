"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    dispatch(logout());
    router.push("/login");
  }, [dispatch, router]);

  return (
    <header className="w-full bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Title */}
          <h1 className="text-xl font-bold text-gray-800 select-none">
            CRM Admin Panel
          </h1>

          {/* Right Side: User Info + Logout */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">
              {user?.name || "Admin"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
