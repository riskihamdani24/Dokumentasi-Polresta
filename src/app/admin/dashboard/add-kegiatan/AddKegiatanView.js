'use client';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import UploadForm from '@/components/UploadForm';
import styles from './addkegiatan.module.css';

export default function AddKegiatanView() {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <AdminNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>➕ Tambah Kegiatan Baru</h1>
          <p>Upload kegiatan baru dengan mengisi form di bawah ini</p>
        </div>
        
        <div className={styles.formContainer}>
          <UploadForm onUploadSuccess={() => router.push('/admin/dashboard')} />
        </div>
      </div>
    </div>
  );
}
