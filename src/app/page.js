import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ActivityList from '@/components/ActivityList';
// PENTING: Jangan lupa import 'getPageContent' juga
import { getActivities, getPageContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Ambil data Kegiatan & Sortir (Logic yang sudah benar tadi)
  const rawActivities = await getActivities();
  const activities = Array.isArray(rawActivities) ? rawActivities : [];
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2. Ambil data Halaman (Judul & Subtitle) <-- INI YANG KEMARIN KETINGGALAN
  // Kita ambil data untuk bagian 'beranda'
  const pageContent = await getPageContent('beranda');

  return (
    <main>
      <Navbar />
      <Hero 
        // 3. Pasang data ke komponen Hero (Agar tidak polos)
        title={pageContent?.title}
        subtitle={pageContent?.subtitle}
        backgroundImage={pageContent?.image}
      />
      <div id="kegiatan" style={{ scrollMarginTop: '100px' }}>
        <ActivityList activities={activities} />
      </div>
    </main>
  );
}