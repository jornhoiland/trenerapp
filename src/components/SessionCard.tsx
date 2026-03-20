'use client';

import { useState, useTransition, memo, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { StarIcon, CalendarTodayIcon, DeleteIcon } from '@/components/icons';
import { deleteSession } from '@/lib/actions/sessions';
import type { SessionWithExercises } from '@/types/database';

export default memo(function SessionCard({ session }: { session: SessionWithExercises }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const exercises = session.exercises || [];
  const doneCount = exercises.filter((e) => e.is_done).length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const formattedDate = useMemo(
    () => new Date(session.date).toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    [session.date]
  );

  const handleDelete = () => {
    startTransition(async () => {
      await deleteSession(session.id);
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardActionArea onClick={() => router.push(`/sessions/${session.id}`)}>
          <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', flex: 1, minWidth: 0 }}>
              {session.is_favorite && (
                <StarIcon sx={{ fontSize: 18, color: '#F59E0B', mr: 0.5, verticalAlign: 'text-bottom' }} />
              )}
              {session.title}
            </Typography>
            <Chip
              label={session.status === 'completed' ? 'Fullført' : 'Planlagt'}
              size="small"
              color={session.status === 'completed' ? 'success' : 'primary'}
              variant="outlined"
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} mb={1.5}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Stack>

          {totalCount > 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {doneCount} av {totalCount} øvelser
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
              />
            </Box>
          )}

          {totalCount === 0 && (
            <Typography variant="caption" color="text.secondary">
              Ingen øvelser lagt til ennå
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pb: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => setConfirmOpen(true)}
          sx={{ color: 'text.disabled' }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Card>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Slett økt?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Er du sikker på at du vil slette «{session.title}»? Dette kan ikke angres.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmOpen(false)}>Avbryt</Button>
        <Button color="error" variant="contained" onClick={handleDelete} disabled={isPending}>
          Slett
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
});
