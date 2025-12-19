"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Users } from "lucide-react";

interface CurrentAdmin {
  email: string;
  firstName?: string;
}

const AdminSidebar = ({ currentAdmin }: { currentAdmin: CurrentAdmin }) => {
  const pathname = usePathname();
  const isUsers = pathname.startsWith("/admin") && !pathname.startsWith("/admin/activity");
  const isActivity = pathname.startsWith("/admin/activity");
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 px-6 py-8 shadow-sm lg:flex">
      <div className="mb-10">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Rehmat Graphics Admin
        </Link>
        <p className="mt-1 text-xs text-slate-500">
          Signed in as {currentAdmin.firstName ?? currentAdmin.email}
        </p>
      </div>
      <nav className="space-y-1 text-sm font-medium text-slate-600">
        <Link
          href="/admin"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
            isUsers ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </Link>
        <Link
          href="/admin/activity"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
            isActivity ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Activity className="h-4 w-4" />
          Activity Logs
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
