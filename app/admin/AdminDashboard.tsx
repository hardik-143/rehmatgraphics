"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Shield,
  Users,
  Clock,
  ShieldAlert,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
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

interface ActivityType {
  key: string;
  value: string;
  label: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

interface CurrentAdmin {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AdminDashboardProps {
  stats: AdminStats;
  initialUsers: AdminUserRow[];
  currentAdmin: CurrentAdmin;
}

type TabType = "users" | "activity";

const AdminDashboard = ({ stats, initialUsers, currentAdmin }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [metrics, setMetrics] = useState(stats);
  const [rows, setRows] = useState(initialUsers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    | { type: "success" | "error"; message: string }
    | null
  >(null);

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activityPagination, setActivityPagination] = useState<Pagination | null>(null);
  const [activityFilter, setActivityFilter] = useState<string>("");
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async (page = 1, action?: string) => {
    setActivityLoading(true);
    setActivityError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (action) params.set("action", action);

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch activity logs");
      }

      setActivityLogs(data.logs);
      setActivityStats(data.stats);
      setActivityTypes(data.activityTypes);
      setActivityPagination(data.pagination);
    } catch (error) {
      console.error("fetchActivityLogs error:", error);
      setActivityError(error instanceof Error ? error.message : "Failed to load activity logs");
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "activity" && activityLogs.length === 0) {
      fetchActivityLogs();
    }
  }, [activeTab, activityLogs.length, fetchActivityLogs]);

  const handleActivityFilterChange = (action: string) => {
    setActivityFilter(action);
    fetchActivityLogs(1, action || undefined);
  };

  const handleActivityPageChange = (page: number) => {
    fetchActivityLogs(page, activityFilter || undefined);
  };

  const approveUser = async (userId: string) => {
    setProcessingId(userId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Unable to approve this user.";
        setFeedback({ type: "error", message });
        setProcessingId(null);
        return;
      }

      setRows((previous) =>
        previous.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_approved: true,
              }
            : user
        )
      );

      setMetrics((previous) => ({
        ...previous,
        approvedUsers: previous.approvedUsers + 1,
        pendingUsers: Math.max(0, previous.pendingUsers - 1),
      }));

      setFeedback({
        type: "success",
        message: "Account approved successfully.",
      });
    } catch (error) {
      console.error("approveUser error:", error);
      setFeedback({
        type: "error",
        message: "Request failed. Please try again.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const renderStatusBadge = (user: AdminUserRow) => {
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <Shield className="h-3.5 w-3.5" aria-hidden /> Admin
        </span>
      );
    }

    if (user.is_approved) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approved
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" aria-hidden /> Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
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
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                activeTab === "users"
                  ? "bg-slate-900/5 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                activeTab === "activity"
                  ? "bg-slate-900/5 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Activity className="h-4 w-4" />
              Activity Logs
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Manage account approvals and review platform activity.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                <Shield className="h-4 w-4" aria-hidden />
                Admin Access Enabled
              </div>
            </div>
          </header>

          <section className="space-y-6 px-6 py-8">
            {/* Stats Grid - always visible */}
            {activeTab === "users" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Total Users
                    </p>
                    <Users className="h-5 w-5 text-brand-primary" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {metrics.totalUsers}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Approved
                    </p>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {metrics.approvedUsers}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Pending Approval
                    </p>
                    <ShieldAlert className="h-5 w-5 text-amber-500" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {metrics.pendingUsers}
                  </p>
                </div>
              </div>
            )}

            {/* Activity Stats */}
            {activeTab === "activity" && activityStats && (
              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Activity Types
                    </p>
                    <Shield className="h-5 w-5 text-amber-500" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {activityStats.activityBreakdown.length}
                  </p>
                </div>
              </div>
            )}

            {feedback ? (
              <div
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  <ShieldAlert className="h-4 w-4" aria-hidden />
                )}
                <span>{feedback.message}</span>
              </div>
            ) : null}

            {/* Users Tab Content */}
            {activeTab === "users" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Name
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Firm & Contact
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Location
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Visiting Card
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Joined
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((user) => {
                      const displayName = [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                      const joined = new Date(user.createdAt).toLocaleDateString();
                      const locationLine = [
                        user.address?.city,
                        user.address?.state,
                      ]
                        .filter(Boolean)
                        .join(", ");
                      const streetLine = [
                        user.address?.line1,
                        user.address?.line2,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 text-slate-900">
                            <p className="font-medium">
                              {displayName || "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.firmName || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <p>{user.email}</p>
                            <p className="text-xs text-slate-500">
                              {user.phoneNumber || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <p>{locationLine || "—"}</p>
                            <p className="text-xs text-slate-500">
                              {streetLine || ""}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
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
                          </td>
                          <td className="px-6 py-4">
                            {renderStatusBadge(user)}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{joined}</td>
                          <td className="px-6 py-4 text-right">
                            {!user.is_admin && !user.is_approved ? (
                              <button
                                type="button"
                                onClick={() => approveUser(user.id)}
                                disabled={processingId === user.id}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {processingId === user.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                    Approving…
                                  </>
                                ) : (
                                  <>Approve</>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">
                                {user.is_admin ? "Admin" : "Approved"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No users found.
                </div>
              ) : null}
            </div>
            )}

            {/* Activity Logs Tab Content */}
            {activeTab === "activity" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Activity Logs
                  </h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={activityFilter}
                      onChange={(e) => handleActivityFilterChange(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                    >
                      <option value="">All Activities</option>
                      {activityTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => fetchActivityLogs(activityPagination?.page || 1, activityFilter || undefined)}
                      disabled={activityLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${activityLoading ? "animate-spin" : ""}`} aria-hidden />
                      Refresh
                    </button>
                  </div>
                </div>

                {activityError && (
                  <div className="px-6 py-4 text-sm text-red-600 bg-red-50">
                    {activityError}
                  </div>
                )}

                {activityLoading && activityLogs.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading activity logs...</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                              Activity
                            </th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                              User
                            </th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                              Details
                            </th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                              IP Address
                            </th>
                            <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                              Date & Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                  <Activity className="h-3 w-3" aria-hidden />
                                  {log.actionLabel}
                                </span>
                              </td>
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
                              <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                {log.details || "—"}
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                {log.ipAddress || "—"}
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                {log.createdAt
                                  ? new Date(log.createdAt).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {activityLogs.length === 0 && !activityLoading && (
                      <div className="px-6 py-10 text-center text-sm text-slate-500">
                        No activity logs found.
                      </div>
                    )}

                    {/* Pagination */}
                    {activityPagination && activityPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <p className="text-sm text-slate-500">
                          Page {activityPagination.page} of {activityPagination.totalPages}
                          {" • "}
                          {activityPagination.total} total records
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
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
