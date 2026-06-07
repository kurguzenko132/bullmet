import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminGuard } from '@/components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-grid">
        <AdminSidebar />
        <main className="bg-[#f7f7f7] p-6 lg:p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
