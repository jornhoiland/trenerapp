import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getSessions, getFavoriteSessions, getTrainingInsights } from '@/lib/actions/sessions';
import SessionList from './SessionList';
import InsightsSection from '@/components/InsightsSection';

export default async function Home() {
  const [sessions, favorites, insights] = await Promise.all([
    getSessions('planned'),
    getFavoriteSessions(),
    getTrainingInsights(),
  ]);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
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
    </Container>
  );
}
