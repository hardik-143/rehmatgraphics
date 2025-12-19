"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";

interface CurrentAdmin {
  email: string;
  firstName?: string;
  lastName?: string;
}

const AdminNavbar = ({ title = "Admin", currentAdmin }: { title?: string; currentAdmin: CurrentAdmin }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initials = (currentAdmin.firstName || currentAdmin.email || "?")
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
    }
  };
  return (
    <header className="border-b border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Manage admin tasks and review activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:flex items-center gap-2">
            <Shield className="h-4 w-4" aria-hidden />
            Admin Access Enabled
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden md:inline">
                {currentAdmin.firstName ?? currentAdmin.email}
              </span>
            </button>
            {open ? (
              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
                  Signed in as
                  <div className="truncate text-slate-700">
                    {currentAdmin.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
