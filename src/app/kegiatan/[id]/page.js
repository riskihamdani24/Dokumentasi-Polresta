import Navbar from '@/components/Navbar';
import { getActivities } from '@/lib/db';
import styles from './page.module.css';
import Link from 'next/link';
import { isImage, isVideo, getFileTypeIcon, getFileTypeLabel } from '@/lib/fileUtils';

export default async function ActivityDetail({ params }) {
  const { id } = await params;
  const activities = getActivities();
  const activity = activities.find(a => a.id === id);

  if (!activity) {
    return (
      <main>
        <Navbar />
        <div className={styles.container}>
          <h1>Kegiatan tidak ditemukan</h1>
          <Link href="/" className={styles.back}>Kembali ke Beranda</Link>
        </div>
      </main>
    );
  }

  // Normalize files data
  let mediaFiles = [];
  let documentFiles = [];
  
  if (activity.files && activity.files.length > 0) {
    // New format
    activity.files.forEach(file => {
      if (file.type === 'image' || file.type === 'video') {
        mediaFiles.push(file);
      } else {
        documentFiles.push(file);
      }
    });
  } else if (activity.fileUrl) {
    // Old format backward compatibility
    const fileData = {
      url: activity.fileUrl,
      name: activity.fileName || 'File Kegiatan',
      type: isImage(activity.fileName) ? 'image' : 
            isVideo(activity.fileName) ? 'video' : 'document'
    };
    
    if (fileData.type === 'document') {
      documentFiles.push(fileData);
    } else {
      mediaFiles.push(fileData);
    }
  }

  return (
    <main>
      <Navbar />
      <div className={styles.container}>
        <Link href="/" className={styles.back}>&larr; Kembali</Link>
        <div className={styles.header}>
            <span className={styles.type}>{activity.type}</span>
            <h1 className={styles.title}>{activity.title}</h1>
            <div className={styles.date}>
              {new Date(activity.date).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
        </div>
        
        {/* Media Gallery (Images & Videos) */}
        {mediaFiles.length > 0 && (
          <div className={styles.gallery}>
            {mediaFiles.map((file, index) => (
              <div key={index} className={styles.galleryItem}>
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} loading="lazy" />
                ) : (
                  <video src={file.url} controls preload="metadata" />
                )}
                <a 
                  href={file.url} 
                  download 
                  target="_blank"
                  className={styles.downloadOverlay}
                  title="Download File"
                >
                  ⬇️
                </a>
              </div>
            ))}
          </div>
        )}

        <div className={styles.description}>
            {activity.description}
        </div>

        {/* Documents List */}
        {documentFiles.length > 0 && (
          <div>
            <h3 className={styles.sectionTitle}>Dokumen Lampiran</h3>
            <div className={styles.documentsList}>
              {documentFiles.map((file, index) => (
                <a key={index} href={file.url} download target="_blank" rel="noopener noreferrer" className={styles.documentCard}>
                  <div className={styles.docIcon}>
                    {getFileTypeIcon(file.name)}
                  </div>
                  <div className={styles.docName} title={file.name}>
                    {file.name}
                  </div>
                  <div className={styles.docType}>
                    Download {getFileTypeLabel(file.name)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
