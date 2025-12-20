import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import AdminLayout from '@/app/admin/components/AdminLayout';
import UsersManager from './UsersManager';

const UsersPage = async () => {
  const authUser = await getAuthenticatedUserFromCookies();
  if (!authUser) redirect('/login');
  if (!authUser.is_admin) redirect('/');

  return (
    <AdminLayout
      currentAdmin={{ email: authUser.email, firstName: authUser.firstName }}
      title="Users"
    >
      <UsersManager />
    </AdminLayout>
  );
};

export default UsersPage;
