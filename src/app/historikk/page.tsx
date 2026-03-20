import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getSessions } from '@/lib/actions/sessions';
import { getFolders } from '@/lib/actions/folders';
import HistoryAccordion from '@/components/HistoryAccordion';
import FadeIn from '@/components/FadeIn';

export default async function HistorikkPage() {
  const [sessions, folders] = await Promise.all([
    getSessions('completed'),
    getFolders(),
  ]);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Historikk
      </Typography>
      <FadeIn>
        {sessions && sessions.length > 0 ? (
          <HistoryAccordion sessions={sessions} folders={folders ?? []} />
        ) : (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ingen fullførte økter ennå
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fullførte økter vil dukke opp her
            </Typography>
          </Box>
        )}
      </FadeIn>
    </Container>
  );
}
