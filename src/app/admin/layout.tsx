import { requireAdmin } from "@/lib/admin";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
    </div>
  );
}
