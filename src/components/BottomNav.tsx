'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { FitnessCenterIcon, HistoryIcon, PlayCircleIcon, LibraryIcon } from '@/components/icons';

const ROUTES = ['/', '/ovelser', '/historikk', '/videoer'] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Prefetch all tab routes on mount so navigation is instant
  useEffect(() => {
    ROUTES.forEach((route) => router.prefetch(route));
  }, [router]);

  // Clear navigation state when route completes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const value = pathname.startsWith('/ovelser')
    ? 1
    : pathname.startsWith('/historikk')
      ? 2
      : pathname.startsWith('/videoer')
        ? 3
        : 0;

  const handleChange = useCallback((_: unknown, newValue: number) => {
    if (ROUTES[newValue] !== pathname) {
      setIsNavigating(true);
    }
    router.push(ROUTES[newValue]);
  }, [router, pathname]);

  return (
    <>
      {isNavigating && <div className="nav-progress" />}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }} elevation={0}>
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
        >
          <BottomNavigationAction label="Økter" icon={<FitnessCenterIcon />} />
          <BottomNavigationAction label="Øvelser" icon={<LibraryIcon />} />
          <BottomNavigationAction label="Historikk" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Videoer" icon={<PlayCircleIcon />} />
        </BottomNavigation>
      </Paper>
    </>
  );
}
