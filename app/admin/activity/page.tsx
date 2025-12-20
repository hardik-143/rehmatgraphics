import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import AdminLayout from "@/app/admin/components/AdminLayout";
import ActivityManager from "@/app/admin/activity/ActivityManager";

const ActivityPage = async () => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect("/login");
  if (!authUser.is_admin) redirect("/");

  return (
    <AdminLayout
      currentAdmin={{ email: authUser.email, firstName: authUser.firstName }}
      title="Activity Logs"
    >
      <ActivityManager />
    </AdminLayout>
  );
};

export default ActivityPage;
