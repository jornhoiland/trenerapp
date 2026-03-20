import { notFound } from 'next/navigation';
import { getSession } from '@/lib/actions/sessions';
import { getExerciseTemplates } from '@/lib/actions/templates';
import SessionDetail from './SessionDetail';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [session, templates] = await Promise.all([
    getSession(id),
    getExerciseTemplates().catch(() => []),
  ]);

  if (!session) notFound();

  return <SessionDetail session={session} templates={templates ?? []} />;
}
