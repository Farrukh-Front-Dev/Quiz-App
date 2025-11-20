"use client";


import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Drawer } from "antd";
import { SearchOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { searchSubjectsByTitle } from "@/store/slices/subjectsSlice";
import type { AppDispatch } from "@/store";


export default function UserNavbar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // mobile search drawer

  // --- Logout ---
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login/user");
  };

  // --- Search ---
  const handleSearch = () => {
    const trimmed = search.trim();

    if (trimmed) {
      router.push(`/user/select?search=${encodeURIComponent(trimmed)}`);
      dispatch(searchSubjectsByTitle(trimmed));
    } else {
      router.push(`/user/select`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  useEffect(() => {
    setSearch(initialQuery);
    if (initialQuery.trim()) {
      dispatch(searchSubjectsByTitle(initialQuery));
    }
  }, [initialQuery, dispatch]);

  // --- Nav Links ---
  const NavLinks = () => (
    <div className="flex flex-col lg:flex-row items-center gap-3 text-lg">
      <Link href="/user/select">
        <Button type="text" className="w-full lg:w-auto text-white hover:bg-white/10 px-4">
          Select
        </Button>
      </Link>

      <Link href="/user/result">
        <Button type="text" className="w-full lg:w-auto text-white hover:bg-white/10 px-4">
          Results
        </Button>
      </Link>

      <Button
        danger
        type="primary"
        className="w-full lg:w-auto"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-[#001529] to-[#06345a] shadow-xl text-white">
      <div className="max-w-7xl mx-auto h-16 px-4 lg:px-8 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => router.push("/user/select")}
          className="text-2xl font-bold cursor-pointer tracking-wide hover:opacity-80 transition"
        >
          Quiz App
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 justify-center px-10">
          <div className="flex items-center bg-white/10 px-4 py-2 rounded-xl min-w-[320px] max-w-md hover:bg-white/20 transition">
            <Input
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-white border-none placeholder:text-gray-300"
              prefix={<SearchOutlined className="text-gray-300" />}
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex">
          <NavLinks />
        </div>

        {/* Mobile Buttons */}
        <div className="lg:hidden flex items-center gap-3">
          <Button
            type="text"
            onClick={() => setSearchOpen(true)}
            icon={<SearchOutlined className="text-white text-xl" />}
          />
          <Button
            type="text"
            onClick={() => setMenuOpen(true)}
            icon={
              menuOpen
                ? <CloseOutlined className="text-white text-xl" />
                : <MenuOutlined className="text-white text-xl" />
            }
          />
        </div>
      </div>

      {/* Mobile Search Drawer */}
      <Drawer
        placement="top"
        height="auto"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        closeIcon={<CloseOutlined />}
        className="p-0"
      >
        <div className="px-4 pb-4">
          <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
            <Input
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSearch} type="primary" icon={<SearchOutlined />} />
          </div>
        </div>
      </Drawer>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
        closeIcon={<CloseOutlined />}
      >
        <NavLinks />
      </Drawer>
    </header>
  );
}
