"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  function handleLogout() {
    Cookies.remove("token");
    dispatch(logout());
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white border-b p-4 shadow-sm">
      <h1 className="text-lg font-semibold">CRM Admin Panel</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">{user?.name || "Admin"}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
