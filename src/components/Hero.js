import styles from './Hero.module.css';
import { getPageContent } from '@/lib/db';

export default function Hero() {
  const content = getPageContent('beranda');
  
  return (
    <section className={styles.hero}>
      {content.image && (
        <div className={styles.heroImage}>
          <img src={content.image} alt={content.title} />
        </div>
      )}
      <h1 className={styles.title}>{content.title}</h1>
      <p className={styles.subtitle}>
        {content.subtitle}
      </p>
    </section>
  );
}
