"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
  loginHref = "#login",
  registerHref = "#register",
}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col px-4">
        <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Mamaji Print Home"
          >
            <div className="relative h-11 w-32">
              <Image
                src={logoSrc}
                alt="Mamaji Print logo"
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
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
