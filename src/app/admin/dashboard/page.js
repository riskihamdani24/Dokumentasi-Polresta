import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardView from './DashboardView';
import { getActivities } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session || session.value !== 'admin-token') {
    redirect('/admin/login');
  }

  // FIX: Tambahkan 'await' di sini karena getActivities() itu ambil data dari Cloud (jauh)
  const rawActivities = await getActivities();

  // FIX: Pastikan yang kita terima adalah Array. Kalau null/error, jadikan array kosong []
  const activities = Array.isArray(rawActivities) ? rawActivities : [];

  // Sekarang aman untuk disortir
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return <DashboardView initialActivities={activities} />;
}