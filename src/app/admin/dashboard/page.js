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

  const activities = getActivities();
  // Sort desc
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return <DashboardView initialActivities={activities} />;
}
