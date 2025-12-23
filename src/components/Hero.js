import styles from './Hero.module.css';

// PERBAIKAN: Terima data via props (title, subtitle, backgroundImage)
export default function Hero({ title, subtitle, backgroundImage }) {
  
  // Fallback data biar gak error kalau kosong
  const safeTitle = title || "Pusat Dokumentasi Kegiatan";
  const safeSubtitle = subtitle || "Arsip digital kegiatan TIK POLRI.";

  return (
    <section className={styles.hero}>
      {/* Logic: Kalau ada gambar (backgroundImage), tampilkan sesuai UI kamu */}
      {backgroundImage && (
        <div className={styles.heroImage}>
          <img src={backgroundImage} alt={safeTitle} />
        </div>
      )}
      
      <h1 className={styles.title}>{safeTitle}</h1>
      <p className={styles.subtitle}>
        {safeSubtitle}
      </p>
    </section>
  );
}