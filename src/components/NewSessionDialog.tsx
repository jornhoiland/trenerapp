'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DatePickerField from './DatePickerField';
import { useRouter } from 'next/navigation';
import { useNavigationProgress } from '@/components/NavigationProgress';
import { createSession } from '@/lib/actions/sessions';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewSessionDialog({ open, onClose }: Props) {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const session = await createSession(title.trim(), date);
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
      startNavigation();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      console.error('Feil ved opprettelse:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>Ny treningsøkt</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tittel"
          placeholder="F.eks. Styrke uke 12"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ mb: 2 }}
        />
        <DatePickerField
          value={date}
          onChange={setDate}
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Avbryt
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || loading}
        >
          {loading ? 'Oppretter...' : 'Opprett'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
