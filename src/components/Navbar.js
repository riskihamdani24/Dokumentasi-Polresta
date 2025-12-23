import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <span>Dokumentasi</span><span style={{ color: 'var(--primary)' }}>Polri</span>
      </Link>
      <div className={styles.links}>
        <Link href="/">Beranda</Link>
        <Link href="/#kegiatan">Kegiatan</Link>
        <Link href="/tentang">Tentang Kami</Link>
        <Link href="/admin/login" className={styles.loginBtn}>Admin Login</Link>
      </div>
    </nav>
  );
}
