import { NextResponse } from 'next/server';
import { deleteActivity, getActivities, updateActivity } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { id } = await params;
  const activities = getActivities();
  const activity = activities.find(a => a.id === id);
  
  if (!activity) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
  }
  
  return NextResponse.json(activity);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();
  
  const title = formData.get('title');
  const date = formData.get('date');
  const type = formData.get('type');
  const description = formData.get('description');
  const newFiles = formData.getAll('files');
  const filesToRemove = formData.getAll('filesToRemove'); // Array of URLs to remove
  
  const activities = getActivities();
  const existingActivity = activities.find(a => a.id === id);
  
  if (!existingActivity) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
  }
  
  // Normalize existing files
  let currentFiles = [];
  if (existingActivity.files && existingActivity.files.length > 0) {
    currentFiles = [...existingActivity.files];
  } else if (existingActivity.fileUrl) {
    // Backward compatibility
    currentFiles.push({
      url: existingActivity.fileUrl,
      name: existingActivity.fileName || 'File Lama',
      type: 'unknown' // Will be handled by client or refined if needed
    });
  }

  // Handle file removal
  if (filesToRemove.length > 0) {
    filesToRemove.forEach(urlToRemove => {
      // Remove from filesystem
      const filePath = path.join(process.cwd(), 'public', urlToRemove);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete file ${filePath}:`, e);
        }
      }
      
      // Remove from list
      currentFiles = currentFiles.filter(f => f.url !== urlToRemove);
    });
  }
  
  // Handle new file upload
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  if (newFiles && newFiles.length > 0) {
    for (const file of newFiles) {
        if (!file || file.size === 0) continue;

        // Import file type detection
        const { getFileType } = await import('@/lib/fileUtils');
        const fileType = getFileType(file.name);

        // Validate file size
        const maxSize = fileType === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        if (file.size > maxSize) {
           // Skip oversized files or return error? For now skip with log
           console.warn(`Skipping file ${file.name} (too large)`);
           continue; 
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Remove spaces and special chars from filename for safety
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = Date.now() + '-' + safeName;
        const filePath = path.join(uploadsDir, uniqueName);
        fs.writeFileSync(filePath, buffer);
        
        currentFiles.push({
          url: `/uploads/${uniqueName}`,
          name: file.name,
          type: fileType
        });
    }
  }
  
  // Clear old legacy fields if we moved to new structure
  const updatedData = {
    title,
    date,
    type,
    description,
    files: currentFiles,
    fileUrl: currentFiles.length > 0 ? currentFiles[0].url : null, // Keep for backward compat
    fileName: currentFiles.length > 0 ? currentFiles[0].name : null // Keep for backward compat
  };
  
  const updatedActivity = updateActivity(id, updatedData);
  
  return NextResponse.json(updatedActivity);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  deleteActivity(id);
  return NextResponse.json({ success: true });
}
