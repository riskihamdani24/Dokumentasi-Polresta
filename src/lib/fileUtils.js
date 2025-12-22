/**
 * File type detection utilities
 */

export function isImage(fileName) {
  if (!fileName) return false;
  const ext = fileName.toLowerCase();
  return ext.endsWith('.jpg') || 
         ext.endsWith('.jpeg') || 
         ext.endsWith('.png') || 
         ext.endsWith('.webp') ||
         ext.endsWith('.gif');
}

export function isPDF(fileName) {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
}

export function isWord(fileName) {
  if (!fileName) return false;
  const ext = fileName.toLowerCase();
  return ext.endsWith('.doc') || ext.endsWith('.docx');
}

export function isExcel(fileName) {
  if (!fileName) return false;
  const ext = fileName.toLowerCase();
  return ext.endsWith('.xls') || ext.endsWith('.xlsx');
}

export function isVideo(fileName) {
  if (!fileName) return false;
  const ext = fileName.toLowerCase();
  return ext.endsWith('.mp4') || 
         ext.endsWith('.mov') || 
         ext.endsWith('.avi') || 
         ext.endsWith('.mkv') ||
         ext.endsWith('.webm');
}

export function getFileType(fileName) {
  if (!fileName) return 'document';
  if (isImage(fileName)) return 'image';
  if (isVideo(fileName)) return 'video';
  if (isPDF(fileName)) return 'document';
  if (isWord(fileName)) return 'document';
  if (isExcel(fileName)) return 'document';
  return 'document';
}

export function getFileTypeIcon(fileName) {
  if (!fileName) return '📎';
  if (isImage(fileName)) return '🖼️';
  if (isVideo(fileName)) return '🎥';
  if (isPDF(fileName)) return '📄';
  if (isWord(fileName)) return '📝';
  if (isExcel(fileName)) return '📊';
  return '📎';
}

export function getFileTypeLabel(fileName) {
  if (!fileName) return 'File';
  if (isImage(fileName)) return 'Gambar';
  if (isVideo(fileName)) return 'Video';
  if (isPDF(fileName)) return 'PDF';
  if (isWord(fileName)) return 'Word';
  if (isExcel(fileName)) return 'Excel';
  return 'File';
}
