'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { EmojiEventsIcon } from '@/components/icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CompletionDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 5 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'pulse 1s ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.5)', opacity: 0 },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 48, color: '#F59E0B' }} />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Godt jobba! 💪
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Økten er fullført og lagt i historikken.
        </Typography>

        <Button
          variant="contained"
          onClick={onClose}
          size="large"
          fullWidth
          sx={{ borderRadius: 3, fontWeight: 700, fontSize: '1rem', py: 1.5 }}
        >
          Gå tilbake til økt
        </Button>
      </DialogContent>
    </Dialog>
  );
}
