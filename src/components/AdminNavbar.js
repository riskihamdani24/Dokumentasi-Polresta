'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminNavbar.module.css';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/dashboard/add-kegiatan', label: '➕ Tambah Kegiatan', icon: '➕' },
    { href: '/admin/dashboard/pages', label: '📝 Edit Halaman', icon: '📝' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h2>Admin Panel TIK POLRI</h2>
        </div>
        
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
