import { NextResponse } from 'next/server';
import { deleteActivity, getActivities, updateActivity } from '@/lib/db';
import { put, del } from '@vercel/blob';

export async function GET(request, { params }) {
  const { id } = await params;
  const activities = await getActivities();
  const activity = activities.find(a => a.id === id);
  
  if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(activity);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();
  
  // Ambil field form
  const title = formData.get('title');
  const date = formData.get('date');
  const type = formData.get('type');
  const description = formData.get('description');
  const newFiles = formData.getAll('files');
  const filesToRemove = formData.getAll('filesToRemove');
  
  const activities = await getActivities();
  const existingActivity = activities.find(a => a.id === id);
  
  if (!existingActivity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  // 1. Ambil file lama
  let currentFiles = existingActivity.files ? [...existingActivity.files] : [];
  // Backward compatibility (jika ada data format lama)
  if (currentFiles.length === 0 && existingActivity.fileUrl) {
    currentFiles.push({ url: existingActivity.fileUrl, name: existingActivity.fileName || 'File', type: 'unknown' });
  }

  // 2. Hapus File yang diminta
  if (filesToRemove.length > 0) {
    currentFiles = currentFiles.filter(f => !filesToRemove.includes(f.url));
    // Hapus dari Vercel Blob
    for (const url of filesToRemove) {
      if (url.includes('public.blob.vercel-storage.com')) {
        await del(url).catch(e => console.error("Gagal hapus blob:", e));
      }
    }
  }
  
  // 3. Upload File Baru
  if (newFiles && newFiles.length > 0) {
    for (const file of newFiles) {
        if (!file || file.size === 0) continue;
        const { getFileType } = await import('@/lib/fileUtils');
        const fileType = getFileType(file.name);
        
        // Upload ke Vercel Blob
        const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
        currentFiles.push({ url: blob.url, name: file.name, type: fileType });
    }
  }
  
  // 4. Update Database
  const updatedData = {
    title, date, type, description, 
    files: currentFiles,
    // Fields lama untuk jaga-jaga
    fileUrl: currentFiles[0]?.url || null,
    fileName: currentFiles[0]?.name || null
  };
  
  const result = await updateActivity(id, updatedData);
  return NextResponse.json(result);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  // Hapus file fisiknya dulu di cloud
  const activities = await getActivities();
  const activity = activities.find(a => a.id === id);
  if (activity?.files) {
    for (const f of activity.files) {
        if (f.url.includes('public.blob.vercel-storage.com')) await del(f.url).catch(console.error);
    }
  }

  await deleteActivity(id);
  return NextResponse.json({ success: true });
}