"use client";

import { Button, Input } from "antd";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { searchSubjectsByTitle } from "@/store/slices/subjectsSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { AppDispatch } from "@/store";

export default function UserNavbar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialQuery);

  // 🔹 Logout funksiyasi
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login/user");
  };

  // 🔹 Qidiruvni ishga tushirish
  const handleSearch = () => {
    const trimmed = search.trim();

    if (trimmed) {
      // URL yangilash
      router.push(`/user/select?search=${encodeURIComponent(trimmed)}`);

      // API orqali qidiruv
      dispatch(searchSubjectsByTitle(trimmed));
    } else {
      // Bo‘sh bo‘lsa – select sahifasiga qaytish
      router.push(`/user/select`);
    }
  };

  // 🔹 Enter bosilganda qidirishni ishga tushirish
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // 🔹 URLdagi search o‘zgarsa – inputni yangilash va qidiruvni avtomatik ishga tushirish
  useEffect(() => {
    setSearch(initialQuery);
    if (initialQuery.trim()) {
      dispatch(searchSubjectsByTitle(initialQuery));
    }
  }, [initialQuery, dispatch]);

  return (
    <header className="bg-[#001529] text-white flex justify-between items-center px-6 h-16">
      {/* 🔸 Logo */}
      <div
        className="font-bold text-xl cursor-pointer"
        onClick={() => router.push("/user/select")}
      >
        Quiz App
      </div>

      {/* 🔸 O‘ng panel */}
      <div className="flex items-center gap-4">
        {/* 🔍 Qidiruv input */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
          <Input
            placeholder="Fan qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-white placeholder:text-gray-300 border-none focus:shadow-none focus:outline-none w-48"
          />
          <Button
            type="text"
            icon={<SearchOutlined className="text-white" />}
            onClick={handleSearch}
          />
        </div>

        {/* 🔗 Navigatsiya tugmalari */}
        <Link href="/user/select">
          <Button type="text" className="text-white">
            Select
          </Button>
        </Link>
        <Link href="/user/quiz">
          <Button type="text" className="text-white">
            Quiz
          </Button>
        </Link>
        <Link href="/user/result">
          <Button type="text" className="text-white">
            Result
          </Button>
        </Link>

        {/* 🚪 Logout */}
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
