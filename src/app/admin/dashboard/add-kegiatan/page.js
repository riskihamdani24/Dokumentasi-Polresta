import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddKegiatanView from './AddKegiatanView';

export default async function AddKegiatanPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session || session.value !== 'admin-token') {
    redirect('/admin/login');
  }

  return <AddKegiatanView />;
}
