import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { getExerciseTemplates } from '@/lib/actions/templates';
import ExerciseLibrary from './ExerciseLibrary';
import FadeIn from '@/components/FadeIn';

export default async function OvelserPage() {
  const templates = await getExerciseTemplates();

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Øvelser
      </Typography>
      <FadeIn>
        <ExerciseLibrary templates={templates ?? []} />
      </FadeIn>
    </Container>
  );
}
