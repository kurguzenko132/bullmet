import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminGuard } from '@/components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-grid admin-grid-pro">
        <AdminSidebar />
        <main className="admin-main-pro">{children}</main>
      </div>
    </AdminGuard>
  );
}
