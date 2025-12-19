"use client";

import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {icon ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        )}
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
