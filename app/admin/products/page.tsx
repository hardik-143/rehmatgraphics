import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import AdminLayout from "@/app/admin/components/AdminLayout";
import ProductsManager from "./ProductsManager";

interface PageProps { searchParams?: Promise<{ page?: string; limit?: string }> }

const ProductsPage = async ({ searchParams }: PageProps) => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect("/login");
  if (!authUser.is_admin) redirect("/");

  return (
    <AdminLayout currentAdmin={{ email: authUser.email, firstName: authUser.firstName }} title="Products">
      <ProductsManager />
    </AdminLayout>
  );
};

export default ProductsPage;
