import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { getSession } from '@/lib/actions/sessions';
import { getExerciseTemplates } from '@/lib/actions/templates';
import SessionDetail from './SessionDetail';
import FadeIn from '@/components/FadeIn';

function SessionSkeleton() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
      <Stack spacing={1.5}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    </Container>
  );
}

async function SessionContent({ id }: { id: string }) {
  const [session, templates] = await Promise.all([
    getSession(id),
    getExerciseTemplates().catch(() => []),
  ]);

  if (!session) notFound();

  return <FadeIn><SessionDetail session={session} templates={templates ?? []} /></FadeIn>;
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<SessionSkeleton />}>
      <SessionContent id={id} />
    </Suspense>
  );
}
