import ActivityCard from './ActivityCard';
import styles from './ActivityList.module.css';

export default function ActivityList({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.empty}>Belum ada kegiatan yang terdokumentasi.</div>
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
