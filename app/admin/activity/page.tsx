import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { getActivityLogs, getActivityStats } from "@/lib/activityLogger";
import AdminLayout from "@/app/admin/components/AdminLayout";
import EmptyState from "@/app/admin/components/EmptyState";

interface PageProps {
  searchParams?: Promise<{ page?: string; action?: string; limit?: string }>;
}

const ActivityPage = async ({ searchParams }: PageProps) => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect("/login");
  if (!authUser.is_admin) redirect("/");

  const sp = searchParams ? await searchParams : undefined;
  const page = parseInt(sp?.page || "1", 10);
  const limit = Math.min(parseInt(sp?.limit || "10", 10), 100);
  const action = sp?.action;

  await connectToDatabase();
  const [logsData, stats] = await Promise.all([
    getActivityLogs({ page, limit, action: action as any }),
    getActivityStats(),
  ]);

  return (
    <AdminLayout currentAdmin={{ email: authUser.email, firstName: authUser.firstName }} title="Activity Logs">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Activities</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.totalActivities}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Today&apos;s Activities</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.todayActivities}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Activity Types</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.activityBreakdown.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Activity Logs</h2>
          <form className="flex items-center gap-3" action="/admin/activity" method="GET">
            <select
              name="action"
              defaultValue={action || ""}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
            >
              <option value="">All Activities</option>
              {/* Server-side options could be added here if needed */}
              <option value="LOGIN">User Login</option>
              <option value="REGISTER">User Registration</option>
            </select>
            <select
              name="limit"
              defaultValue={String(limit)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
            >
              {[5,10,25,50,100].map((opt) => (
                <option key={opt} value={opt}>{opt} / page</option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              Apply
            </button>
          </form>
        </div>

        {logsData.logs.length === 0 ? (
          <EmptyState title="No activity logs found" description="Activity will appear as users interact with the platform." />
        ) : (
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
                {logsData.logs.map((log: any) => (
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
                    <td className="px-6 py-4 text-slate-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {logsData.logs.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-500">Rows per page</label>
              <form action="/admin/activity" method="GET">
                <input type="hidden" name="action" value={action || ""} />
                <input type="hidden" name="page" value={1} />
                <select
                  name="limit"
                  defaultValue={String(limit)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                >
                  {[5,10,25,50,100].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Apply
                </button>
              </form>
            </div>
            {logsData.pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/activity?page=${Math.max(1, logsData.pagination.page - 1)}&limit=${limit}${action ? `&action=${action}` : ""}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Previous
                </a>
                <a
                  href={`/admin/activity?page=${Math.min(logsData.pagination.totalPages, logsData.pagination.page + 1)}&limit=${limit}${action ? `&action=${action}` : ""}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Next
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityPage;
