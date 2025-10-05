"use client";

import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>

        
        <div className="flex-1 flex flex-col h-screen">

          <div className="sticky top-0 z-10">
            <Navbar />
          </div>


          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
