import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { User } from "@/models/User";
import AdminDashboard from "./AdminDashboard";

const fetchAdminData = async () => {
  await connectToDatabase();

  const [users, totalUsers, approvedUsers] = await Promise.all([
    User.find({})
      .sort({ createdAt: -1 })
      .select(
        "firstName lastName email is_admin is_approved createdAt updatedAt"
      )
      .lean(),
    User.countDocuments().exec(),
    User.countDocuments({ is_approved: true }).exec(),
  ]);

  return {
    stats: {
      totalUsers,
      approvedUsers,
      pendingUsers: totalUsers - approvedUsers,
    },
    users: users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    })),
  };
};

const AdminPage = async () => {
  const authUser = await getAuthenticatedUserFromCookies();

  if (!authUser) {
    redirect("/login");
  }

  if (!authUser.is_admin) {
    redirect("/");
  }

  const data = await fetchAdminData();

  return (
    <AdminDashboard
      stats={data.stats}
      initialUsers={data.users}
      currentAdmin={
        {
          id: authUser._id.toString(),
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
        } as const
      }
    />
  );
};

export default AdminPage;
