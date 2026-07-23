import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;

    let token = localStorage.getItem("demo_session_token");
    let role = localStorage.getItem("demo_user_role");

    // Auto-initialize Admin Session if visiting /admin without admin role
    if (!token || role !== "admin") {
      localStorage.setItem("demo_session_token", "demo_admin_token");
      localStorage.setItem("demo_user_id", "admin_user");
      localStorage.setItem("demo_user_email", "admin@acadsphere.edu");
      localStorage.setItem("demo_user_role", "admin");
    }
  },
  component: AdminLayoutWrapper,
});

function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
