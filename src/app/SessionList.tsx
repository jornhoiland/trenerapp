'use client';

import { useState } from 'react';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { AddIcon } from '@/components/icons';
import SessionCard from '@/components/SessionCard';
import FavoritesList from '@/components/FavoritesList';
import NewSessionDialog from '@/components/NewSessionDialog';
import type { SessionWithExercises } from '@/types/database';

const monthNames = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function groupByMonth(sessions: SessionWithExercises[]) {
  const groups: { key: string; label: string; sessions: SessionWithExercises[] }[] = [];
  const map = new Map<string, SessionWithExercises[]>();

  for (const s of sessions) {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, []);
      groups.push({
        key,
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        sessions: map.get(key)!,
      });
    }
    map.get(key)!.push(s);
  }

  return groups;
}

interface Props {
  sessions: SessionWithExercises[];
  favorites: SessionWithExercises[];
}

export default function SessionList({ sessions, favorites }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const monthGroups = groupByMonth(sessions);

  return (
    <>
      <FavoritesList favorites={favorites} />

      {monthGroups.map((group) => (
        <Box key={group.key} mb={2}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1} mt={1}>
            {group.label}
          </Typography>
          {group.sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </Box>
      ))}

      <Fab
        color="primary"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1100,
        }}
      >
        <AddIcon />
      </Fab>

      <NewSessionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
