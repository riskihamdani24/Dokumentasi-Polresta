import Link from 'next/link';
import styles from './ActivityCard.module.css';
import { isImage, isVideo, getFileTypeIcon } from '@/lib/fileUtils';

export default function ActivityCard({ activity }) {
  // Support both old format (fileUrl/fileName) and new format (files array)
  const files = activity.files || [];
  const hasOldFile = activity.fileUrl && activity.fileName;
  
  // Get first image or video for thumbnail
  let thumbnailUrl = null;
  let thumbnailType = null;
  
  if (files.length > 0) {
    const firstMedia = files.find(f => f.type === 'image' || f.type === 'video');
    if (firstMedia) {
      thumbnailUrl = firstMedia.url;
      thumbnailType = firstMedia.type;
    }
  } else if (hasOldFile && isImage(activity.fileName)) {
    thumbnailUrl = activity.fileUrl;
    thumbnailType = 'image';
  } else if (hasOldFile && isVideo(activity.fileName)) {
    thumbnailUrl = activity.fileUrl;
    thumbnailType = 'video';
  }

  // Count files by type
  const imageCount = files.filter(f => f.type === 'image').length;
  const videoCount = files.filter(f => f.type === 'video').length;
  const docCount = files.filter(f => f.type === 'document').length;
  
  // Add old file to count if exists
  const totalImages = imageCount + (hasOldFile && isImage(activity.fileName) ? 1 : 0);
  const totalVideos = videoCount + (hasOldFile && isVideo(activity.fileName) ? 1 : 0);
  const totalDocs = docCount + (hasOldFile && !isImage(activity.fileName) && !isVideo(activity.fileName) ? 1 : 0);

  return (
    <Link href={`/kegiatan/${activity.id}`} className={styles.card}>
      <div className={styles.image}>
        {thumbnailUrl ? (
          <>
            {thumbnailType === 'image' ? (
              <img src={thumbnailUrl} alt={activity.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
              <div className={styles.videoThumbnail}>
                <video src={thumbnailUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                <div className={styles.playOverlay}>▶️</div>
              </div>
            )}
          </>
        ) : (
          <span>{getFileTypeIcon(activity.fileName || '')}</span>
        )}
        {(totalImages > 0 || totalVideos > 0 || totalDocs > 0) && (
          <div className={styles.fileBadges}>
            {totalImages > 0 && <span className={styles.badge}>📷 {totalImages}</span>}
            {totalVideos > 0 && <span className={styles.badge}>🎥 {totalVideos}</span>}
            {totalDocs > 0 && <span className={styles.badge}>📄 {totalDocs}</span>}
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>{activity.type}</div>
        <h3 className={styles.title}>{activity.title}</h3>
        <div className={styles.date}>
          {new Date(activity.date).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </Link>
  );
}
