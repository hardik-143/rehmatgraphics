'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, Package, ShoppingBag } from 'lucide-react';

interface CurrentAdmin {
  email: string;
  firstName?: string;
}

const AdminSidebar = ({
  currentAdmin,
  isMobileOpen,
  onCloseMobile,
}: {
  currentAdmin: CurrentAdmin;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) => {
  const pathname = usePathname();
  const isDashboard = pathname === '/admin';
  const isUsers = pathname.startsWith('/admin/users');
  const isOrders = pathname.startsWith('/admin/orders');
  const isActivity = pathname.startsWith('/admin/activity');
  const isProducts = pathname.startsWith('/admin/products');
  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300 ease-linear`}
        onClick={onCloseMobile}
      />
      <aside
        className={`w-64 flex-col border-r border-slate-200 bg-white/90 px-6 py-8 shadow-sm lg:flex max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:overflow-y-auto max-md:bg-white/95 max-md:backdrop-blur-lg  max-md:transition-transform max-md:duration-300 max-md:ease-in-out md:max-md:w-72 lg:max-md:w-64 ${isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      >
        <div className="mb-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
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
              isDashboard
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
              isUsers
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/admin/products"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
              isProducts
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/admin/orders"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
              isOrders
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Link>
          <Link
            href="/admin/activity"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
              isActivity
                ? 'bg-slate-900/5 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="h-4 w-4" />
            Activity Logs
          </Link>
        </nav>
      </aside>

      {/* Mobile sidebar drawer + overlay */}
      {/* {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-lg lg:hidden">
            <div className="mb-10">
              <Link href="/" className="text-lg font-bold tracking-tight text-slate-900" onClick={onCloseMobile}>
                Rehmat Graphics Admin
              </Link>
              <p className="mt-1 text-xs text-slate-500">
                Signed in as {currentAdmin.firstName ?? currentAdmin.email}
              </p>
            </div>
            <nav className="space-y-1 text-sm font-medium text-slate-600">
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isDashboard ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                onClick={onCloseMobile}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isUsers ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                href="/admin/products"
                onClick={onCloseMobile}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isProducts ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link
                href="/admin/activity"
                onClick={onCloseMobile}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isActivity ? "bg-slate-900/5 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Activity className="h-4 w-4" />
                Activity Logs
              </Link>
            </nav>
          </aside>
        </>
      )} */}
    </>
  );
};

export default AdminSidebar;
