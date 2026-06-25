import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminTopbar } from '@/components/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-grid admin-grid-pro admin-shell-redesign">
        <AdminSidebar />
        <div className="admin-workspace-redesign">
          <AdminTopbar />
          <main className="admin-main-pro admin-main-redesign">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
