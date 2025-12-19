"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Shield, Users, Clock, ShieldAlert } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
}

interface AdminUserAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
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

const AdminDashboard = ({ stats, initialUsers, currentAdmin }: AdminDashboardProps) => {
  const [metrics, setMetrics] = useState(stats);
  const [rows, setRows] = useState(initialUsers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    | { type: "success" | "error"; message: string }
    | null
  >(null);

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
            <p className="rounded-xl bg-slate-900/5 px-3 py-2 text-slate-900">
              Dashboard
            </p>
            <p className="rounded-xl px-3 py-2 text-slate-500">Users</p>
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
                        user.address?.country,
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
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
