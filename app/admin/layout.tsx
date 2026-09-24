import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminTopbar } from '@/components/AdminTopbar';
import { AdminBodyClass } from '@/components/AdminBodyClass';
import './admin.css';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminBodyClass />
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
