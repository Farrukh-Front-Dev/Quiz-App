"use client";

import { Button } from "antd";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function UserNavbar() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login/user");
  };

  return (
    <header className="bg-[#001529] text-white flex justify-between items-center px-6 h-16">
      <div className="font-bold text-xl">Quiz App</div>
      <div className="flex items-center gap-4">
        <Link href="/user/select">
          <Button type="text" className="text-white">Select</Button>
        </Link>
        <Link href="/user/quiz">
          <Button type="text" className="text-white">Quiz</Button>
        </Link>
        <Link href="/user/result">
          <Button type="text" className="text-white">Result</Button>
        </Link>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
