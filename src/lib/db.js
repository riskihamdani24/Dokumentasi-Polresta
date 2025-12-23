import { kv } from '@vercel/kv';

const ACTIVITIES_KEY = 'activities_data';
const PAGES_KEY = 'pages_data';

// --- DATA KEGIATAN ---
export async function getActivities() {
  try {
    const data = await kv.get(ACTIVITIES_KEY);
    return data || [];
  } catch (error) {
    console.error("Error reading activities from KV:", error);
    return [];
  }
}

export async function saveActivity(activity) {
  const activities = await getActivities();
  const newActivity = {
    ...activity,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  await kv.set(ACTIVITIES_KEY, activities);
  return newActivity;
}

export async function deleteActivity(id) {
  let activities = await getActivities();
  activities = activities.filter(a => a.id !== id);
  await kv.set(ACTIVITIES_KEY, activities);
}

export async function updateActivity(id, updatedData) {
  let activities = await getActivities();
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Activity not found');
  
  activities[index] = { ...activities[index], ...updatedData, id, updatedAt: new Date().toISOString() };
  await kv.set(ACTIVITIES_KEY, activities);
  return activities[index];
}

// --- DATA HALAMAN ---
const DEFAULT_PAGES = {
  beranda: { title: "Pusat Dokumentasi Kegiatan", subtitle: "Arsip digital kegiatan TIK POLRI.", image: "" },
  tentang: { title: "Tentang Kami", subtitle: "Pusat Dokumentasi Kegiatan TIK POLRI", sections: [], image: "" }
};

export async function getPageContent(pageName) {
  try {
    const pages = await kv.get(PAGES_KEY) || DEFAULT_PAGES;
    return pages[pageName] || DEFAULT_PAGES[pageName] || null;
  } catch (error) { return DEFAULT_PAGES[pageName] || null; }
}

export async function savePageContent(pageName, content) {
  let pages = await kv.get(PAGES_KEY) || DEFAULT_PAGES;
  pages[pageName] = content;
  await kv.set(PAGES_KEY, pages);
  return pages[pageName];
}