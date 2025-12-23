import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session || session.value !== 'admin-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // Upload ke Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({ success: true, imageUrl: blob.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}