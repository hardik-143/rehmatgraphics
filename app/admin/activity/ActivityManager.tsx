"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/app/admin/components/EmptyState";
import { Loader2 } from "lucide-react";

type ActivityTypeKey = string;

interface ActivityLogRow {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  actionLabel: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null; // ISO
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalActivities: number;
  todayActivities: number;
  rangeActivities: number;
  activityBreakdown: { action: string; count: number }[];
}

interface ActivityTypeItem {
  key: ActivityTypeKey;
  value: string;
  label: string;
}

export default function ActivityManager() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = useMemo(() => parseInt(searchParams.get("page") || "1", 10), [searchParams]);
  const initialLimit = useMemo(() => parseInt(searchParams.get("limit") || "10", 10), [searchParams]);
  const initialAction = useMemo(() => searchParams.get("action") || "", [searchParams]);
  const initialRange = useMemo(() => searchParams.get("range") || "", [searchParams]);

  const [items, setItems] = useState<ActivityLogRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: initialPage, limit: initialLimit, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<Stats | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeItem[]>([]);
  const [action, setAction] = useState<string>(initialAction);
  const [range, setRange] = useState<string>(initialRange);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (page = pagination.page, nextLimit = limit, nextAction = action, nextRange = range) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(nextLimit));
      if (nextAction) params.set("action", nextAction);
      if (nextRange) params.set("range", nextRange);

      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch activity logs");

      setItems(data.logs);
      setPagination(data.pagination);
      setStats(data.stats);
      setActivityTypes(data.activityTypes || []);

      // Sync URL for shareable state
      const urlParams = new URLSearchParams();
      urlParams.set("page", String(data.pagination.page));
      urlParams.set("limit", String(data.pagination.limit));
      if (nextAction) urlParams.set("action", nextAction);
      else urlParams.delete("action");
      if (nextRange) urlParams.set("range", nextRange);
      else urlParams.delete("range");
      router.push(`?${urlParams.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData(initialPage, initialLimit, initialAction, initialRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Activities</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.totalActivities ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Today&apos;s Activities</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.todayActivities ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Activity Types</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.activityBreakdown?.length ?? 0}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Activity Logs</h2>
          <div className="flex items-center gap-3">
            <select
              value={action}
              onChange={(e) => {
                const next = e.target.value;
                setAction(next);
                fetchData(1, limit, next, range);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
            >
              <option value="">All Activities</option>
              {activityTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {/* Optional: range filter */}
            <select
              value={range}
              onChange={(e) => {
                const next = e.target.value;
                setRange(next);
                fetchData(1, limit, action, next);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 text-sm text-red-600 bg-red-50">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Action</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">User</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Details</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">IP Address</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading activity logs...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <EmptyState title="No activity logs found" description="Activity will appear as users interact with the platform." />
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">{log.actionLabel || log.action}</td>
                    <td className="px-6 py-4">
                      {log.userName || log.userEmail ? (
                        <>
                          <p className="font-medium text-slate-900">{log.userName || "—"}</p>
                          <p className="text-xs text-slate-500">{log.userEmail || "—"}</p>
                        </>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{log.details || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ipAddress || "—"}</td>
                    <td className="px-6 py-4 text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(loading || items.length > 0) && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500">Rows per page</label>
            <select
              value={limit}
              onChange={(e) => {
                const next = Number(e.target.value);
                setLimit(next);
                fetchData(1, next, action, range);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
            >
              {[5, 10, 25, 50, 100].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => fetchData(Math.min(pagination.totalPages || 1, (pagination.page || 1) + 1))}
              disabled={pagination.page >= (pagination.totalPages || 1) || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
