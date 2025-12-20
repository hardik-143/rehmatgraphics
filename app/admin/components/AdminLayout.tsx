'use client';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface CurrentAdmin {
  email: string;
  firstName?: string;
}

const AdminLayout = ({
  currentAdmin,
  title,
  children,
}: {
  currentAdmin: CurrentAdmin;
  title?: string;
  children: ReactNode;
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar
          currentAdmin={currentAdmin}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0">
          <AdminNavbar
            title={title}
            currentAdmin={currentAdmin}
            onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
          />
          <section className="space-y-6 px-6 py-8 max-md:!p-4">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
