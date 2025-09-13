import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function UserDashboard() {
  return (
    <ProtectedRoute roles={["user"]}>
      <h1>User Dashboard</h1>
    </ProtectedRoute>
  );
}
