import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { User } from "@/models/User";
import Product from "@/models/Product";
import AdminDashboard from "./AdminDashboard";

const fetchAdminData = async () => {
  await connectToDatabase();

  const [totalUsers, totalProducts] = await Promise.all([
    User.countDocuments().exec(),
    Product.countDocuments().exec(),
  ]);

  return {
    stats: {
      totalUsers,
      totalProducts,
    },
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
