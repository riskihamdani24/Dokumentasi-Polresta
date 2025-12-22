import { NextResponse } from 'next/server';
import { getActivities, saveActivity } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET() {
  const activities = getActivities();
  // Sort by date descending
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(activities);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const date = formData.get('date');
    const type = formData.get('type'); // zoom, apel, etc.
    const description = formData.get('description');
    const files = formData.getAll('files');

    const uploadedFiles = [];
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (files && files.length > 0) {
      for (const file of files) {
        if (!file || file.size === 0) continue;

        // Import file type detection
        const { getFileType } = await import('@/lib/fileUtils');
        const fileType = getFileType(file.name);

        // Validate file size
        const maxSize = fileType === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        if (file.size > maxSize) {
          const maxSizeMB = maxSize / (1024 * 1024);
          return NextResponse.json({ 
            success: false, 
            message: `File ${file.name} terlalu besar. Maksimal ${maxSizeMB}MB untuk ${fileType === 'video' ? 'video' : 'file'}.` 
          }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = Date.now() + '-' + safeName;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Create upload directory if it doesn't exist
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        uploadedFiles.push({
          url: `/uploads/${uniqueName}`,
          name: file.name,
          type: fileType
        });
      }
    }

    const activity = saveActivity({
      title,
      date,
      type,
      description,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
