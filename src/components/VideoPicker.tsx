'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { PlayCircleIcon, SearchIcon, CloseIcon, DeleteIcon } from '@/components/icons';
import { SKADEFRI_VIDEOS, parseVideoUrl, getVideoLabel } from '@/lib/videos';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

const CATEGORIES = [
  { label: 'Alle', value: 'all' },
  { label: 'Løp', value: 'løp' },
  { label: 'Kne', value: 'kne' },
  { label: 'Skulder', value: 'skulder' },
  { label: 'Styrke', value: 'styrke' },
];

export default function VideoPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [externalUrl, setExternalUrl] = useState('');

  const filtered = useMemo(
    () => SKADEFRI_VIDEOS.filter((v) => {
      const matchCat = category === 'all' || v.category === category;
      const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
    [category, search]
  );

  const handleSelectVimeo = (vimeoId: string) => {
    onChange(`vimeo:${vimeoId}`);
    setOpen(false);
    setSearch('');
  };

  const handleSaveExternal = () => {
    const url = externalUrl.trim();
    if (!url) return;
    onChange(url);
    setOpen(false);
    setExternalUrl('');
  };

  const handleRemove = () => {
    onChange(null);
  };

  if (value) {
    const label = getVideoLabel(value);
    const parsed = parseVideoUrl(value);
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <Chip
          icon={<PlayCircleIcon sx={{ fontSize: 16 }} />}
          label={label}
          color="primary"
          variant="outlined"
          onDelete={handleRemove}
          deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
          onClick={() => {
            if (parsed.type === 'vimeo') {
              window.open(`https://vimeo.com/${parsed.id}`, '_blank');
            } else {
              window.open(parsed.url, '_blank');
            }
          }}
          sx={{ cursor: 'pointer', maxWidth: '100%' }}
        />
      </Stack>
    );
  }

  return (
    <>
      <Button
        size="small"
        startIcon={<PlayCircleIcon />}
        onClick={() => setOpen(true)}
        sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}
      >
        Legg til treningsvideo
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '80vh' } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          Velg treningsvideo
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ mb: 1.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'none' } }}
          >
            <Tab label="Skadefri-videoer" />
            <Tab label="Ekstern lenke" />
          </Tabs>

          {tab === 0 && (
            <>
              <TextField
                size="small"
                placeholder="Søk i videoer..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />
              <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap" useFlexGap>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.value}
                    label={c.label}
                    size="small"
                    onClick={() => setCategory(c.value)}
                    color={category === c.value ? 'primary' : 'default'}
                    variant={category === c.value ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              <List disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filtered.map((v, i) => (
                  <ListItemButton
                    key={`${v.vimeoId}-${i}`}
                    onClick={() => handleSelectVimeo(v.vimeoId)}
                    dense
                    sx={{ borderRadius: 1.5, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlayCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{v.title}</span>
                          <Chip label={`Nivå ${v.level}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Stack>
                      }
                      secondary={v.reps}
                    />
                  </ListItemButton>
                ))}
                {filtered.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    Ingen treff
                  </Typography>
                )}
              </List>
            </>
          )}

          {tab === 1 && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                Lim inn en lenke til treningsvideo fra handball.no, YouTube eller andre kilder.
              </Typography>
              <TextField
                autoFocus
                size="small"
                label="Video-URL"
                placeholder="https://handball.no/..."
                fullWidth
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveExternal()}
                sx={{ mb: 1.5 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleSaveExternal}
                disabled={!externalUrl.trim()}
              >
                Legg til
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
