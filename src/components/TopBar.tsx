'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import HandballLogo from '@/components/HandballLogo';

const fontStyle = {
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  fontSize: '1.3rem',
  background: 'linear-gradient(135deg, #fff 0%, #C7D2FE 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export default function TopBar({ fontClass }: { fontClass: string }) {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
          <HandballLogo size={30} />
          <Typography variant="h6" component="div" className={fontClass} sx={fontStyle}>
            Tren
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
