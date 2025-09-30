"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Menu, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  HelpCircle,
  ChevronLeft,
  // Settings,
  LogOut
} from "lucide-react";

const menuItems = [
  
  { 
    href: "/admin/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard 
  },
  { 
    href: "/admin/users", 
    label: "Users", 
    icon: Users 
  },
  { 
    href: "/admin/subjects", 
    label: "Subjects", 
    icon: BookOpen 
  },
  { 
    href: "/admin/questions", 
    label: "Questions", 
    icon: HelpCircle 
  },
  
];

const bottomMenuItems = [
  { 
    href: "/login", 
    label: "Logout", 
    icon: LogOut 
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out shadow-sm relative`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CRM System</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
              collapsed ? "mx-auto" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Main Menu
          </div>
        )}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                active 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : ""}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                }`} 
              />
              {!collapsed && (
                <span className={`font-medium ${active ? "text-blue-700" : ""}`}>
                  {item.label}
                </span>
              )}
              
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                active 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : ""}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                }`} 
              />
              {!collapsed && (
                <span className={`font-medium ${active ? "text-blue-700" : ""}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin </p>
              <p className="text-xs text-gray-500 truncate">admin@example.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}