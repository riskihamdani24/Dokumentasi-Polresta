'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import PageEditor from '@/components/PageEditor';
import styles from './pages.module.css';

export default function PagesEditorView() {
  const router = useRouter();
  const [tentangContent, setTentangContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    setLoading(true);
    try {
      const tentangRes = await fetch('/api/pages?page=tentang');

      if (tentangRes.ok) {
        const data = await tentangRes.json();
        setTentangContent(data);
      } else {
        console.error('Failed to load page content');
        alert('Gagal memuat konten halaman');
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleSave = async (content) => {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageName: 'tentang', content }),
      });

      if (res.ok) {
        alert('Perubahan berhasil disimpan!');
        await loadPageContent(); // Reload content
        router.refresh();
      } else {
        const errorText = await res.text();
        console.error('Save failed:', errorText);
        alert('Gagal menyimpan perubahan: ' + errorText);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan perubahan: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <AdminNavbar />
        <div className={styles.content}>
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tentangContent) {
    return (
      <div className={styles.pageContainer}>
        <AdminNavbar />
        <div className={styles.content}>
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <p>Gagal memuat konten. Silakan refresh halaman.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <AdminNavbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>📝 Edit Halaman Tentang Kami</h1>
          <p>Kelola konten halaman Tentang Kami, termasuk foto sejarah Kapolrestabes</p>
        </div>

        <div className={styles.editorContainer}>
          {tentangContent && (
            <PageEditor
              pageName="tentang"
              initialContent={tentangContent}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
