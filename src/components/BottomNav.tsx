'use client';

import { useRouter, usePathname } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { FitnessCenterIcon, HistoryIcon, PlayCircleIcon, LibraryIcon } from '@/components/icons';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.startsWith('/ovelser')
    ? 1
    : pathname.startsWith('/historikk')
      ? 2
      : pathname.startsWith('/videoer')
        ? 3
        : 0;

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }} elevation={0}>
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          if (newValue === 0) router.push('/');
          else if (newValue === 1) router.push('/ovelser');
          else if (newValue === 2) router.push('/historikk');
          else router.push('/videoer');
        }}
        showLabels
      >
        <BottomNavigationAction label="Økter" icon={<FitnessCenterIcon />} />
        <BottomNavigationAction label="Øvelser" icon={<LibraryIcon />} />
        <BottomNavigationAction label="Historikk" icon={<HistoryIcon />} />
        <BottomNavigationAction label="Videoer" icon={<PlayCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
