"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Layout } from "lucide-react"; // ✅ Ikonlar uchun

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/users", label: "Users" },
  { href: "#", label: "Menu 4" },
  // { href: "#", label: "Menu 5" },
  // { href: "#", label: "Menu 6" },
  // { href: "#", label: "Menu 7" },
  // { href: "#", label: "Menu 8" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-white border-r shadow-sm flex flex-col h-screen transition-all duration-300`}
    >
      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && <span className="text-xl font-bold">CRM</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
              pathname === item.href ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <Layout className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
