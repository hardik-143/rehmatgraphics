import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import OrdersManager from './OrdersManager';
import { redirect } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

export default async function OrdersPage() {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect('/login');
  if (!authUser.is_admin) redirect('/');

  return (
    <AdminLayout
      currentAdmin={{ email: authUser.email, firstName: authUser.firstName }}
      title="Products"
    >
      <OrdersManager />
    </AdminLayout>
  );
}
