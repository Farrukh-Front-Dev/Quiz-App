"use client";

import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex bg-gray-50 h-screen">
        {/* Sidebar – doim joyida qoladi */}
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* Content Area – scroll olib tashlandi */}
        <div className="flex-1 flex flex-col h-screen">
          <Navbar />
          {/* main ga flex-1 qo‘yamiz, scroll yo‘q */}
          <main className="p-6 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
