import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import { getPageContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function TentangPage() {
  const content = getPageContent('tentang');

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i}>{line.slice(2, -2)}</strong>;
      }
      if (line.startsWith('- ')) {
        return <li key={i}>{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <main>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.hero}>
          {content.image && (
            <div className={styles.heroImage}>
              <img src={content.image} alt={content.title} />
            </div>
          )}
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.subtitle}>
            {content.subtitle}
          </p>
        </div>

        <div className={styles.content}>
          {content.sections && content.sections.map((section, index) => (
            <div key={index} className={styles.section}>
              <h2>{section.heading}</h2>
              <div>{renderContent(section.content)}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
