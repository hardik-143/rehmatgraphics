import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { listProducts } from "@/lib/products";
import AdminLayout from "@/app/admin/components/AdminLayout";
import ProductsManager from "./ProductsManager";

interface PageProps { searchParams?: Promise<{ page?: string; limit?: string }> }

const ProductsPage = async ({ searchParams }: PageProps) => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect("/login");
  if (!authUser.is_admin) redirect("/");

  const sp = searchParams ? await searchParams : undefined;
  const page = parseInt(sp?.page || "1", 10);
  const limit = Math.min(parseInt(sp?.limit || "10", 10), 100);

  const initial = await listProducts(page, limit);

  return (
    <AdminLayout currentAdmin={{ email: authUser.email, firstName: authUser.firstName }} title="Products">
      <ProductsManager initial={initial} />
    </AdminLayout>
  );
};

export default ProductsPage;
