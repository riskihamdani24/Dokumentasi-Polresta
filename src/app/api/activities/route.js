import { NextResponse } from 'next/server';
import { getActivities, saveActivity } from '@/lib/db';
import { put } from '@vercel/blob';

export async function GET() {
  const activities = await getActivities();
  // Sortir tanggal (terbaru diatas)
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(activities);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const date = formData.get('date');
    const type = formData.get('type');
    const description = formData.get('description');
    const files = formData.getAll('files');

    const uploadedFiles = [];
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (files && files.length > 0) {
      for (const file of files) {
        if (!file || file.size === 0) continue;

        // Validasi ukuran
        const { getFileType } = await import('@/lib/fileUtils');
        const fileType = getFileType(file.name);
        const maxSize = fileType === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        
        if (file.size > maxSize) {
           return NextResponse.json({ success: false, message: `File ${file.name} terlalu besar.` }, { status: 400 });
        }

        // UPLOAD KE VERCEL BLOB
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true
        });

        uploadedFiles.push({
          url: blob.url, // URL cloud permanen
          name: file.name,
          type: fileType
        });
      }
    }

    const activity = await saveActivity({
      title,
      date,
      type,
      description,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: 'Upload failed: ' + error.message }, { status: 500 });
  }
}