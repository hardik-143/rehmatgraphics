"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCredentials } from "@/store/authSlice";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logoSrc?: string;
  links?: NavLink[];
  loginHref?: string;
  registerHref?: string;
}

const defaultLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Downloads", href: "#downloads" },
  { label: "Videos", href: "#videos" },
  { label: "Photo Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const Navbar = ({
  logoSrc = "/images/logo-placeholder.svg",
  links = defaultLinks,
  loginHref = "/login",
  registerHref = "/register",
}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);
  const toggleProfileMenu = () => setIsProfileOpen((previous) => !previous);
  const closeProfileMenu = () => setIsProfileOpen(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to log out:", error);
    }

    dispatch(clearCredentials());
    closeMenu();
    closeProfileMenu();
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((part) => part.trim()[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "");
  const isAdmin = Boolean(user?.is_admin);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col px-4">
        <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Rehmat Graphics Home"
          >
            <div className="relative h-11 w-32">
              <Image
                src={logoSrc}
                alt="Rehmat Graphics logo"
                fill
                sizes="128px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-7 rounded-full border border-slate-200/70 bg-white/70 px-6 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur lg:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-brand-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleProfileMenu}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-brand-primary/60 hover:text-brand-primary"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold uppercase text-brand-primary">
                    {initials}
                  </span>
                  <span className="max-w-[9rem] truncate text-left">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden
                  />
                </button>
                {isProfileOpen ? (
                  <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-semibold text-slate-900">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-brand-primary/10 hover:text-brand-primary"
                        onClick={closeProfileMenu}
                      >
                        Admin Dashboard
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-brand-primary/10 hover:text-brand-primary"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:border-brand-primary/60 hover:text-brand-primary"
                >
                  Login
                </Link>
                <Link
                  href={registerHref}
                  className="rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-5 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300/60 p-2 text-slate-600 transition duration-200 hover:border-slate-400 hover:text-slate-800 lg:hidden"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200/70 bg-white/95 px-4 pb-6 pt-4 shadow-sm backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-slate-100"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-base font-bold uppercase text-brand-primary">
                    {initials}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {displayName}
                    </span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:border-brand-primary/60 hover:text-brand-primary"
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-full border border-brand-primary/40 px-4 py-2 text-sm font-semibold text-brand-primary transition duration-200 hover:bg-brand-primary/10"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className="rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-600 transition duration-200 hover:border-brand-primary/60 hover:text-brand-primary"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href={registerHref}
                  className="rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition duration-200 hover:shadow-md"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
