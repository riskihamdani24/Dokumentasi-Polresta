import { NextResponse } from 'next/server';
import { getPageContent, savePageContent } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pageName = searchParams.get('page');
  
  if (!pageName) {
    return NextResponse.json({ error: 'Page name required' }, { status: 400 });
  }

  const content = getPageContent(pageName);
  if (!content) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json(content);
}

export async function POST(request) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session || session.value !== 'admin-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pageName, content } = body;

    if (!pageName || !content) {
      return NextResponse.json({ error: 'Page name and content required' }, { status: 400 });
    }

    const savedContent = savePageContent(pageName, content);
    return NextResponse.json({ success: true, content: savedContent });
  } catch (error) {
    console.error('Error saving page content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
