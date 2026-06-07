import { AdminSidebar } from '@/components/AdminSidebar';
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="admin-grid"><AdminSidebar/><main className="bg-[#f7f7f7] p-6 lg:p-8">{children}</main></div>; }
