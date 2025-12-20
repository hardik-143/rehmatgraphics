import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { User } from "@/models/User";
import { getActivityLogs } from "@/lib/activityLogger";
import Link from "next/link";
import { Activity, Mail, Phone, User as UserIcon, IdCard, MapPin } from "lucide-react";
import AdminLayout from "@/app/admin/components/AdminLayout";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface PageProps {
  params: { userId: string };
  searchParams?: Promise<{ page?: string }>;
}

const fetchUserDetail = async (userId: string, page = 1) => {
  await connectToDatabase();

  const user = await User.findById(userId)
    .select(
      "firstName lastName email phoneNumber firmName address visitingCardAssetId visitingCardAssetUrl visitingCardOriginalFilename is_admin is_approved createdAt updatedAt"
    )
    .lean();

  if (!user) return null;

  const logsData = await getActivityLogs({ userId, page, limit: 25 });

  return {
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firmName: user.firmName,
      address: {
        line1: user.address?.line1 ?? "",
        line2: user.address?.line2 ?? "",
        city: user.address?.city ?? "",
        state: user.address?.state ?? "",
      },
      visitingCardAssetId: user.visitingCardAssetId ?? null,
      visitingCardAssetUrl: user.visitingCardAssetUrl ?? null,
      visitingCardOriginalFilename: user.visitingCardOriginalFilename ?? null,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    },
    logs: logsData.logs.map((log: any) => ({
      id: log._id?.toString(),
      action: log.action,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : null,
    })),
    pagination: logsData.pagination,
  };
};

const AdminUserDetailPage = async ({ params, searchParams }: PageProps) => {
  const authUser = await getAuthenticatedUserFromCookies();
  const {userId} = params ? await params : {userId: ""};
  const searchParamsResolved = searchParams ? await searchParams : undefined;
  if (!authUser) {
    redirect("/login");
  }

  if (!authUser.is_admin) {
    redirect("/");
  }

  const page = parseInt(searchParamsResolved?.page || "1", 10);
  const data = await fetchUserDetail(userId, page);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">User not found.</p>
            <Link href="/admin" className="mt-4 inline-block text-sm font-semibold text-brand-primary">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, logs, pagination } = data;

  return (
    <AdminLayout
      currentAdmin={{ email: authUser.email, firstName: authUser.firstName }}
      title="User Details"
    >
            {/* User Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">User Details</h2>
              </div>
              <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-slate-900">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</span>
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.phoneNumber || "—"}</span>
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-slate-600">
                    <IdCard className="h-4 w-4" />
                    <span>{user.firmName || "—"}</span>
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[user.address.city, user.address.state].filter(Boolean).join(", ") || "—"}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {[user.address.line1, user.address.line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-4 text-sm text-slate-500">
                    Status: {user.is_admin ? "Admin" : user.is_approved ? "Approved" : "Pending"}
                  </p>
                  {user.visitingCardAssetUrl ? (
                    <a
                      href={user.visitingCardAssetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary transition hover:text-brand-secondary"
                    >
                      View Visiting Card
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  <Activity className="h-4 w-4" />
                  Activity Logs
                </h2>
              </div>

              <div className="overflow-x-auto">
                <Table className="divide-y divide-slate-100 text-left text-sm text-slate-600">
                  <TableHeader className="bg-white">
                    <TableRow>
                      <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Action
                      </TableCell>
                      <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Details
                      </TableCell>
                      <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        IP Address
                      </TableCell>
                      <TableCell isHeader className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">
                        Date & Time
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 bg-white">
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/70">
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600 max-w-xs truncate">
                          {log.details || "—"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-500 font-mono text-xs">
                          {log.ipAddress || "—"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-500">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <p className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}{" • "}
                    {pagination.total} total records
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}?page=${Math.max(1, pagination.page - 1)}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                      Previous
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}?page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                      Next
                    </Link>
                  </div>
                </div>
              )}
            </div>
    </AdminLayout>
  );
};

export default AdminUserDetailPage;
