import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import AdminLayout from "@/app/admin/components/AdminLayout";
import UsersManager from "./UsersManager";

interface PageProps { searchParams?: Promise<{ page?: string; limit?: string }> }

const UsersPage = async ({ searchParams }: PageProps) => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect("/login");
  if (!authUser.is_admin) redirect("/");

  return (
    <AdminLayout currentAdmin={{ email: authUser.email, firstName: authUser.firstName }} title="Users">
      <UsersManager />
    </AdminLayout>
  );
};

export default UsersPage;
