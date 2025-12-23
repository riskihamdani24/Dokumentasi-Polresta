'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '@/components/AdminNavbar';
import styles from './dashboard.module.css';

export default function DashboardView({ initialActivities }) {
  const router = useRouter();
  
  const handleDelete = async (id) => {
    if(!confirm('Hapus kegiatan ini?')) return;
    await fetch(`/api/activities/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className={styles.pageContainer}>
      <AdminNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>📊 Dashboard Admin</h1>
          <p>Kelola semua kegiatan TIK POLRI</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{initialActivities.length}</span>
            <span className={styles.statLabel}>Total Kegiatan</span>
          </div>
        </div>

        <div className={styles.activitiesSection}>
          <h2>Daftar Kegiatan</h2>
          <div className={styles.list}>
            {initialActivities.length === 0 && (
              <div className={styles.emptyState}>
                <p>📭 Belum ada kegiatan.</p>
                <Link href="/admin/dashboard/add-kegiatan" className={styles.addFirstBtn}>
                  ➕ Tambah Kegiatan Pertama
                </Link>
              </div>
            )}
            {initialActivities.map(a => (
              <div key={a.id} className={styles.item}>
                <div className={styles.itemContent}>
                  <strong>{a.title}</strong>
                  <div className={styles.meta}>{a.date} - {a.type}</div>
                </div>
                <div className={styles.itemActions}>
                  <Link href={`/kegiatan/${a.id}`} target="_blank" className={styles.viewBtn}>
                    👁️ Lihat
                  </Link>
                  <Link href={`/admin/dashboard/edit-kegiatan/${a.id}`} className={styles.editBtn}>
                    ✏️ Edit
                  </Link>
                  <button onClick={() => handleDelete(a.id)} className={styles.deleteBtn}>
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
