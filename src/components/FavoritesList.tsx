'use client';

import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { StarIcon, ContentCopyIcon } from '@/components/icons';
import { duplicateSession } from '@/lib/actions/sessions';
import type { SessionWithExercises } from '@/types/database';
import { useState, useTransition, memo } from 'react';
import DatePickerField from './DatePickerField';

interface Props {
  favorites: SessionWithExercises[];
}

export default function FavoritesList({ favorites }: Props) {
  if (favorites.length === 0) return null;

  return (
    <Box mb={3}>
      <Stack direction="row" alignItems="center" spacing={0.5} mb={1.5}>
        <StarIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Favorittøkter
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
        {favorites.map((session) => (
          <FavoriteCard key={session.id} session={session} />
        ))}
      </Box>
    </Box>
  );
}

const FavoriteCard = memo(function FavoriteCard({ session }: { session: SessionWithExercises }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [reuseDate, setReuseDate] = useState('');

  const handleUse = () => {
    setTitle(session.title);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    setLoading(true);
    startTransition(async () => {
      try {
        const newSession = await duplicateSession(session.id, title.trim() || session.title, reuseDate);
        router.push(`/sessions/${newSession.id}`);
      } catch {
        setLoading(false);
      }
    });
  };

  const exerciseCount = session.exercises?.length || 0;

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            noWrap
            onClick={() => router.push(`/sessions/${session.id}`)}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {session.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {exerciseCount} øvelse{exerciseCount !== 1 ? 'r' : ''}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={handleUse}
            disabled={loading || isPending}
            sx={{ mt: 1, fontSize: '0.75rem' }}
          >
            Bruk denne
          </Button>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Gjenbruk økt</DialogTitle>
        <DialogContent>
          <TextField
            label="Tittel"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
          <DatePickerField
            value={reuseDate}
            onChange={setReuseDate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Avbryt</Button>
          <Button variant="contained" onClick={handleConfirm}>
            Opprett
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
