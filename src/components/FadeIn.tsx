'use client';

import Box from '@mui/material/Box';

export default function FadeIn({ children }: { children: React.ReactNode }) {
  return <Box className="fade-in">{children}</Box>;
}
