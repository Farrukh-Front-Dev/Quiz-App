import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin", "super-admin"]}>
      {children}
    </ProtectedRoute>
  );
}
