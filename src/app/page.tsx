import { Suspense } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { getSessions, getFavoriteSessions, getTrainingInsights } from '@/lib/actions/sessions';
import SessionList from './SessionList';
import InsightsSection from '@/components/InsightsSection';
import FadeIn from '@/components/FadeIn';

function SessionsSkeleton() {
  return (
    <>
      <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: 3 }} />
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        ))}
      </Stack>
    </>
  );
}

async function SessionsContent() {
  const [sessions, favorites, insights] = await Promise.all([
    getSessions('planned'),
    getFavoriteSessions(),
    getTrainingInsights(),
  ]);

  return (
    <FadeIn>
      <InsightsSection insights={insights} />
      <SessionList sessions={sessions ?? []} favorites={favorites ?? []} />
      {(!sessions || sessions.length === 0) && (
        <Box textAlign="center" mt={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Ingen planlagte økter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trykk + for å opprette en ny treningsøkt
          </Typography>
        </Box>
      )}
    </FadeIn>
  );
}

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Suspense fallback={<SessionsSkeleton />}>
        <SessionsContent />
      </Suspense>
    </Container>
  );
}
