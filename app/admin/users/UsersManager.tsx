"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import EmptyState from "@/app/admin/components/EmptyState";
import { Search } from "lucide-react";

interface AdminUserAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
}

interface AdminUserRow {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  firmName: string;
  address: AdminUserAddress;
  visitingCardAssetId: string | null;
  visitingCardAssetUrl: string | null;
  visitingCardOriginalFilename: string | null;
  is_admin: boolean;
  is_approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersManager() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Manage state locally (no URL sync)
  const initialPage = 1;
  const initialLimit = 10;
  const [q, setQ] = useState<string>("");

  const fetchPage = async (page = 1, nextLimit = limit, nextQ = q) => {
    setLoading(true);
    setError(null);
    try {
      const usp = new URLSearchParams();
      usp.set("page", String(page));
      usp.set("limit", String(nextLimit));
      if (nextQ) usp.set("q", nextQ);
      const res = await fetch(`/api/admin/users?${usp.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setRows(data.items);
      setPagination(data.pagination);
      setLimit(data.pagination.limit);
      // No URL updates; keep state-driven
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to approve this user.");
      setRows((prev) => prev.map((u) => (u.id === userId ? { ...u, is_approved: true } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Request failed");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    setPagination((p) => ({ ...p, page: initialPage, limit: initialLimit }));
    setLimit(initialLimit);
    fetchPage(initialPage, initialLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Users</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={q}
            onChange={(e) => {
              const next = e.target.value;
              setQ(next);
              fetchPage(1, limit, next);
            }}
            className="w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>
        <div>
            <Table className="divide-y divide-slate-100 text-left text-sm text-slate-600">
              <TableHeader className="bg-white">
                <TableRow>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500 min-w-[200px]">Name</TableCell>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Firm & Contact</TableCell>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500 min-w-[200px]">Location</TableCell>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500 min-w-[170px]">Visiting Card</TableCell>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Status</TableCell>
                  <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Joined</TableCell>
                  <TableCell isHeader className="px-6 py-3" />
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-8">
                  <EmptyState title="No users found" description="Newly registered users will appear here." />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((user) => {
                    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
                    const joined = new Date(user.createdAt).toLocaleDateString();
                    const locationLine = [user.address?.city, user.address?.state].filter(Boolean).join(", ");
                    const streetLine = [user.address?.line1, user.address?.line2].filter(Boolean).join(", ");

                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50/70">
                        <TableCell className="px-6 py-4 text-slate-900">
                          <p className="font-medium">
                            <Link href={`/admin/users/${user.id}`} className="text-brand-primary hover:text-brand-secondary">
                              {displayName || "—"}
                            </Link>
                          </p>
                          <p className="text-xs text-slate-500">{user.firmName || "—"}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600">
                          <p>{user.email}</p>
                          <p className="text-xs text-slate-500">{user.phoneNumber || "—"}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600">
                          <p>{locationLine || "—"}</p>
                          <p className="text-xs text-slate-500 ">{streetLine || ""}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600">
                          {user.visitingCardAssetUrl ? (
                            <a
                              href={user.visitingCardAssetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary transition hover:text-brand-secondary"
                            >
                              View Card
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {user.is_admin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Admin
                            </span>
                          ) : user.is_approved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-500">{joined}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {!user.is_admin && !user.is_approved ? (
                            <button
                              type="button"
                              onClick={() => approveUser(user.id)}
                              disabled={processingId === user.id}
                              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {processingId === user.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" /> Approving…
                                </>
                              ) : (
                                <>Approve</>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">{user.is_admin ? "Admin" : "Approved"}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
            )}
          </TableBody>
        </Table>
      </div>

      {(loading || rows.length > 0) && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Rows per page</label>
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
              value={limit}
              onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setLimit(newLimit);
                    fetchPage(1, newLimit, q);
              }}
            >
              {[5, 10, 25, 50, 100].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:gap-4">
            <p className="text-sm text-slate-500 hidden sm:block">
              Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                      onClick={() => fetchPage(Math.max(1, pagination.page - 1), limit, q)}
                disabled={pagination.page <= 1 || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                      onClick={() => fetchPage(Math.min(pagination.totalPages || 1, (pagination.page || 1) + 1), limit, q)}
                disabled={pagination.page >= (pagination.totalPages || 1) || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
