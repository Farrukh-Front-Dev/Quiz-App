"use client"; // shuni qo‘shdingizmi?

import AdminGuard from "@/components/AdminGuard";
// import Sidebar from "@/components/admin/sidebar/page";
// import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* <Navbar /> */}
          <main className="p-4">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
