"use client";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import type { ReactNode } from "react";

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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar currentAdmin={currentAdmin} />
        <main className="flex-1 min-w-0">
          <AdminNavbar title={title} currentAdmin={currentAdmin} />
          <section className="space-y-6 px-6 py-8">{children}</section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
