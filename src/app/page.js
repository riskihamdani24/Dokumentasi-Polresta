import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ActivityList from '@/components/ActivityList';
import { getActivities } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const activities = getActivities();
  // Sort by date descending
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <main>
      <Navbar />
      <Hero />
      <div id="kegiatan" style={{ scrollMarginTop: '100px' }}>
        <ActivityList activities={activities} />
      </div>
    </main>
  );
}
