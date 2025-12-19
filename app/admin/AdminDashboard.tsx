"use client";

import { useState, useEffect, useCallback } from "react";
// Users list removed; no Link usage
import {
  Loader2,
  Users,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
} from "lucide-react";
import EmptyState from "@/app/admin/components/EmptyState";
import AdminLayout from "@/app/admin/components/AdminLayout";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
}

interface ActivityLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  actionLabel: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string | null;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  activityBreakdown: Array<{ action: string; count: number }>;
}

// Removed ActivityType usage

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Removed AdminUserAddress usage

// Removed AdminUserRow usage

interface CurrentAdmin {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AdminDashboardProps {
  stats: AdminStats;
  currentAdmin: CurrentAdmin;
}

// Removed tabs

const AdminDashboard = ({ stats, currentAdmin }: AdminDashboardProps) => {
  const [metrics] = useState(stats);
  // Removed user approval flows and feedback
  // Removed users table in favor of metrics + activity logs
  // Users table removed

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activityPagination, setActivityPagination] = useState<Pagination | null>(null);
  const [activityRange, setActivityRange] = useState<string>("today");
  const [activityLimit, setActivityLimit] = useState<number>(10);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async (page = 1, range?: string, limit: number = activityLimit) => {
    setActivityLoading(true);
    setActivityError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (range) params.set("range", range);

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch activity logs");
      }

      setActivityLogs(data.logs);
      setActivityStats(data.stats);
      setActivityPagination(data.pagination);
      setActivityLimit(data.pagination.limit);
    } catch (error) {
      console.error("fetchActivityLogs error:", error);
      setActivityError(error instanceof Error ? error.message : "Failed to load activity logs");
    } finally {
      setActivityLoading(false);
    }
  }, [activityLimit]);

  useEffect(() => {
    if (activityLogs.length === 0) {
      fetchActivityLogs();
    }
  }, [activityLogs.length, fetchActivityLogs]);

  const handleActivityRangeChange = (range: string) => {
    setActivityRange(range);
    fetchActivityLogs(1, range, activityLimit);
  };

  const handleActivityPageChange = (page: number) => {
    fetchActivityLogs(page, activityRange || undefined, activityLimit);
  };

  // User approval UI removed

  return (
    <AdminLayout
      currentAdmin={{ email: currentAdmin.email, firstName: currentAdmin.firstName }}
      title="Admin Dashboard"
    >
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Users</p>
                  <Users className="h-5 w-5 text-brand-primary" aria-hidden />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Products</p>
                  <Package className="h-5 w-5 text-emerald-600" aria-hidden />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.totalProducts}</p>
              </div>
            </div>

            {/* Activity Stats (optional) */}
            {activityStats && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Total Activities
                    </p>
                    <Activity className="h-5 w-5 text-brand-primary" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {activityStats.totalActivities}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Today&apos;s Activities
                    </p>
                    <Clock className="h-5 w-5 text-emerald-500" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {activityStats.todayActivities}
                  </p>
                </div>
              </div>
            )}

            {/* Activity Logs */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Activity Logs</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={activityRange}
                    onChange={(e) => handleActivityRangeChange(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => fetchActivityLogs(activityPagination?.page || 1, activityRange || undefined, activityLimit)}
                    disabled={activityLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${activityLoading ? "animate-spin" : ""}`} aria-hidden />
                    Refresh
                  </button>
                </div>
              </div>

              {activityError && (
                <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{activityError}</div>
              )}

              {activityLoading && activityLogs.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">Loading activity logs...</p>
                </div>
              ) : (
                <>
                  {activityLogs.length === 0 ? (
                    <EmptyState title="No activity logs" description="No activity in the selected range." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Activity</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">User</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Details</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">IP Address</th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-4">{log.actionLabel}</td>
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activityLogs.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Rows per page</label>
                        <select
                          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                          value={activityLimit}
                          onChange={(e) => {
                            const newLimit = Number(e.target.value);
                            setActivityLimit(newLimit);
                            fetchActivityLogs(1, activityRange || undefined, newLimit);
                          }}
                        >
                          {[5, 10, 25, 50, 100].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      {activityPagination && activityPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                          <p className="text-sm text-slate-500 hidden sm:block">
                            Page {activityPagination.page} of {activityPagination.totalPages} • {activityPagination.total} total
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleActivityPageChange(activityPagination.page - 1)}
                              disabled={activityPagination.page <= 1 || activityLoading}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ChevronLeft className="h-4 w-4" aria-hidden />
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActivityPageChange(activityPagination.page + 1)}
                              disabled={activityPagination.page >= activityPagination.totalPages || activityLoading}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
