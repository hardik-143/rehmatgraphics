import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import AdminLayout from '@/app/admin/components/AdminLayout';
import ProductsManager from './ProductsManager';

const ProductsPage = async () => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect('/login');
  if (!authUser.is_admin) redirect('/');

  return (
    <AdminLayout
      currentAdmin={{ email: authUser.email, firstName: authUser.firstName }}
      title="Products"
    >
      <ProductsManager />
    </AdminLayout>
  );
};

export default ProductsPage;
