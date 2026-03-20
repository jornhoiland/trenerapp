'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { TrainingInsights } from '@/lib/actions/sessions';

const monthNames = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function getMotivation(insights: TrainingInsights): string {
  const { sessionsThisWeek, sessionsThisMonth, totalCompleted, totalExercisesThisMonth } = insights;

  if (totalCompleted === 1) {
    return 'Første økt i boks! Guttene er heldige som har deg, Marit 💪';
  }
  if (sessionsThisWeek >= 3) {
    return `${sessionsThisWeek} økter denne uka — du er i flytsonen, Marit! 🔥`;
  }
  if (sessionsThisMonth >= 8) {
    return `Wow, ${sessionsThisMonth} økter denne måneden! Guttene utvikler seg masse 🚀`;
  }
  if (sessionsThisMonth >= 4) {
    return `Stabil innsats, Marit! ${sessionsThisMonth} økter gjennomført denne måneden 👏`;
  }
  if (totalExercisesThisMonth >= 20) {
    return `${totalExercisesThisMonth} øvelser denne måneden — det er skikkelig treningsglede! 🤩`;
  }
  if (sessionsThisMonth >= 2) {
    return 'Bra jobba, Marit! Fortsett å gi guttene gode treninger 💙';
  }
  if (totalCompleted >= 10) {
    return `${totalCompleted} økter totalt — du gjør en fantastisk jobb som trener, Marit! ⭐`;
  }
  if (totalCompleted >= 5) {
    return 'Du bygger noe bra for guttene, Marit. Stå på! 💪';
  }
  return 'Godt å se deg igjen, Marit! Klar for neste økt? 😊';
}

interface Props {
  insights: TrainingInsights;
}

export default function InsightsSection({ insights }: Props) {
  const { sessionsThisMonth, totalCompleted, totalExercisesThisMonth } = insights;

  if (totalCompleted === 0 && sessionsThisMonth === 0) return null;

  const currentMonth = monthNames[new Date().getMonth()];
  const motivation = getMotivation(insights);

  return (
    <Box mb={3}>
      <Card sx={{ mb: 1.5, background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(79,70,229,0.06) 100%)' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center', color: 'text.primary' }}>
            {motivation}
          </Typography>
        </CardContent>
      </Card>

      {sessionsThisMonth > 0 && (
        <Card>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" textAlign="center" mb={1}>
              {currentMonth}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="space-around">
              <StatItem value={sessionsThisMonth} label="Økter" />
              <StatItem value={totalExercisesThisMonth} label="Øvelser" />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <Box textAlign="center">
      <Typography variant="h5" fontWeight={700} color="primary.light">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
