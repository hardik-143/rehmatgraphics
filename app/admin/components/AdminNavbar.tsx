'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';

interface CurrentAdmin {
  email: string;
  firstName?: string;
  lastName?: string;
}

const AdminNavbar = ({
  title = 'Admin',
  currentAdmin,
  onToggleSidebar,
}: {
  title?: string;
  currentAdmin: CurrentAdmin;
  onToggleSidebar?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();

  const initials = (currentAdmin.firstName || currentAdmin.email || '?')
    .split(' ')
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur max-md:p-4">
      <div className="flex gap-y-4 flex-row flex-wrap max-md:flex-col-reverse">
        <div className="grow">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">
            Manage admin tasks and review activity.
          </p>
        </div>
        <div className="flex items-center gap-3 max-md:w-full max-md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => onToggleSidebar?.()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          {/* <div className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:flex items-center gap-2">
            <Shield className="h-4 w-4" aria-hidden />
            Admin Access Enabled
          </div> */}
          <div className="relative z-50">
            <button
              type="button"
              onClick={(e) => {
                setAnchorEl(e.currentTarget as HTMLElement);
                setOpen((o) => !o);
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="inline">
                {currentAdmin.firstName ?? currentAdmin.email}
              </span>
            </button>
            <Dropdown
              isOpen={open}
              onClose={() => setOpen(false)}
              anchorEl={anchorEl}
              align="end"
              className="w-44 p-0"
            >
              <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
                Signed in as
                <div className="truncate text-slate-700">
                  {currentAdmin.email}
                </div>
              </div>
              <DropdownItem
                tag="button"
                onItemClick={() => setOpen(false)}
                onClick={logout}
                baseClassName="flex w-full items-center gap-2 px-3 py-2 text-left !text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
