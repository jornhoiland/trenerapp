import { Suspense } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { getExerciseTemplates } from '@/lib/actions/templates';
import ExerciseLibrary from './ExerciseLibrary';
import FadeIn from '@/components/FadeIn';

function OvelserSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}

async function OvelserContent() {
  const templates = await getExerciseTemplates();
  return <FadeIn><ExerciseLibrary templates={templates ?? []} /></FadeIn>;
}

export default function OvelserPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Øvelser
      </Typography>
      <Suspense fallback={<OvelserSkeleton />}>
        <OvelserContent />
      </Suspense>
    </Container>
  );
}
