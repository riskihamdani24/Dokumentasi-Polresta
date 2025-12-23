import EditKegiatanView from './EditKegiatanView';

export default async function EditKegiatanPage({ params }) {
  const { id } = await params;
  return <EditKegiatanView activityId={id} />;
}
