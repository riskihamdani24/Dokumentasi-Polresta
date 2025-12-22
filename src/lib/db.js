import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getActivities() {
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    return [];
  }
  try {
    const fileData = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading activities:", error);
    return [];
  }
}

export function saveActivity(activity) {
  const activities = getActivities();
  const newActivity = {
    ...activity,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  activities.push(newActivity);
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
  return newActivity;
}

export function deleteActivity(id) {
  let activities = getActivities();
  activities = activities.filter(a => a.id !== id);
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
}

export function updateActivity(id, updatedData) {
  let activities = getActivities();
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Activity not found');
  }
  activities[index] = {
    ...activities[index],
    ...updatedData,
    id, // Preserve original id
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
  return activities[index];
}


// Page Content Management
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');

const DEFAULT_PAGES = {
  beranda: {
    title: "Pusat Dokumentasi Kegiatan",
    subtitle: "Arsip digital kegiatan TIK POLRI. Zoom, Apel, dan kegiatan lainnya terdokumentasi dengan rapi di sini.",
    image: ""
  },
  tentang: {
    title: "Tentang Kami",
    subtitle: "Pusat Dokumentasi Kegiatan TIK POLRI - Mencatat setiap langkah kemajuan teknologi informasi di lingkungan Kepolisian Republik Indonesia",
    sections: [
      {
        heading: "Visi & Misi",
        content: "**Visi:** Menjadi pusat dokumentasi digital terdepan yang mendukung transparansi dan akuntabilitas kegiatan TIK di lingkungan POLRI.\n\n**Misi:**\n- Mendokumentasikan seluruh kegiatan TIK secara sistematis dan terstruktur\n- Menyediakan akses informasi yang mudah dan cepat bagi seluruh anggota\n- Meningkatkan transparansi dan akuntabilitas kegiatan TIK POLRI\n- Membangun arsip digital yang aman dan terpercaya"
      },
      {
        heading: "Tentang Platform",
        content: "Platform Dokumentasi Kegiatan ini dikembangkan untuk memudahkan pengelolaan dan akses informasi kegiatan-kegiatan yang dilaksanakan oleh bagian TIK POLRI. Mulai dari meeting virtual, apel, hingga kegiatan-kegiatan penting lainnya, semua terdokumentasi dengan rapi di sini.\n\nDengan sistem yang user-friendly, masyarakat umum dapat mengakses informasi kegiatan tanpa perlu login, sementara admin dapat mengelola konten dengan mudah dan aman."
      },
      {
        heading: "Fitur Utama",
        content: "- Dokumentasi kegiatan lengkap dengan foto dan file lampiran\n- Akses publik tanpa perlu registrasi\n- Dashboard admin yang mudah digunakan\n- Sistem upload file yang aman dan terstruktur\n- Responsive design untuk semua perangkat"
      },
      {
        heading: "Hubungi Kami",
        content: "📧 Email: tik@polri.go.id\n📞 Telp: (021) 1234-5678\n📍 Alamat: Markas Besar POLRI, Jakarta"
      }
    ],
    image: ""
  }
};

export function getPageContent(pageName) {
  if (!fs.existsSync(PAGES_FILE)) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(DEFAULT_PAGES, null, 2));
    return DEFAULT_PAGES[pageName] || null;
  }
  try {
    const fileData = fs.readFileSync(PAGES_FILE, 'utf8');
    const pages = JSON.parse(fileData);
    return pages[pageName] || DEFAULT_PAGES[pageName] || null;
  } catch (error) {
    console.error("Error reading page content:", error);
    return DEFAULT_PAGES[pageName] || null;
  }
}

export function savePageContent(pageName, content) {
  let pages = DEFAULT_PAGES;
  if (fs.existsSync(PAGES_FILE)) {
    try {
      const fileData = fs.readFileSync(PAGES_FILE, 'utf8');
      pages = JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading existing pages:", error);
    }
  }
  pages[pageName] = content;
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2));
  return pages[pageName];
}

