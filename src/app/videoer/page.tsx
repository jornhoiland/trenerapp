import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { getSavedVideos } from '@/lib/actions/videos';
import VideoerClient from './VideoerClient';
import FadeIn from '@/components/FadeIn';

export default async function VideoerPage() {
  const savedVideos = await getSavedVideos();

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Videoer
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Skadefri-øvelser og lagrede videoer
      </Typography>
      <FadeIn>
        <VideoerClient initialSavedVideos={savedVideos} />
      </FadeIn>
    </Container>
  );
}
