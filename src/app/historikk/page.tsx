import { Suspense } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { getSessions } from '@/lib/actions/sessions';
import { getFolders } from '@/lib/actions/folders';
import HistoryAccordion from '@/components/HistoryAccordion';

function HistorikkSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}

async function HistorikkContent() {
  const [sessions, folders] = await Promise.all([
    getSessions('completed'),
    getFolders(),
  ]);

  if (sessions && sessions.length > 0) {
    return <HistoryAccordion sessions={sessions} folders={folders ?? []} />;
  }

  return (
    <Box textAlign="center" mt={6}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Ingen fullførte økter ennå
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Fullførte økter vil dukke opp her
      </Typography>
    </Box>
  );
}

export default function HistorikkPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Historikk
      </Typography>
      <Suspense fallback={<HistorikkSkeleton />}>
        <HistorikkContent />
      </Suspense>
    </Container>
  );
}
