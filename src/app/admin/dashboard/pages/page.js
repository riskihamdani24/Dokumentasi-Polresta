import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PagesEditorView from './PagesEditorView';

export default async function PagesEditorPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session || session.value !== 'admin-token') {
    redirect('/admin/login');
  }

  return <PagesEditorView />;
}
