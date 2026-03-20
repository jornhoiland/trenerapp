'use client';

import { useState, useEffect, useTransition } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import { PlayCircleIcon, CloseIcon, OpenInNewIcon, SearchIcon, DeleteIcon } from '@/components/icons';
import { SKADEFRI_VIDEOS, type SkadefriVideo, parseVideoUrl } from '@/lib/videos';
import { getSavedVideos, deleteSavedVideo } from '@/lib/actions/videos';
import type { SavedVideo } from '@/types/database';

const LEVEL_TABS = [
  { label: 'Nivå 1', value: 1 },
  { label: 'Nivå 2', value: 2 },
  { label: 'Nivå 3', value: 3 },
];

const CATEGORY_CHIPS: { label: string; value: string }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Løp', value: 'løp' },
  { label: 'Kne', value: 'kne' },
  { label: 'Skulder', value: 'skulder' },
  { label: 'Styrke', value: 'styrke' },
];

export default function VideoerClient() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openVideo, setOpenVideo] = useState<SkadefriVideo | null>(null);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [showAllSaved, setShowAllSaved] = useState(false);

  useEffect(() => {
    getSavedVideos().then(setSavedVideos).catch(() => {});
  }, []);

  const filtered = SKADEFRI_VIDEOS.filter((e) => {
    const matchLevel = e.level === activeLevel;
    const matchCategory = activeCategory === 'all' || e.category === activeCategory;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchCategory && matchSearch;
  });

  function handleDeleteSaved(id: string) {
    startTransition(async () => {
      await deleteSavedVideo(id);
      setSavedVideos((prev) => prev.filter((v) => v.id !== id));
    });
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Videoer
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        Skadefri-øvelser og lagrede videoer
      </Typography>

      {/* Mine lagrede videoer */}
      {savedVideos.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Mine lagrede videoer ({savedVideos.length})
          </Typography>
          {(showAllSaved ? savedVideos : savedVideos.slice(0, 3)).map((v) => {
            const parsed = parseVideoUrl(v.url);
            return (
              <Card key={v.id} sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        backgroundColor: 'rgba(67, 85, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (parsed.type === 'vimeo') {
                          window.open(`https://vimeo.com/${parsed.id}`, '_blank', 'noopener,noreferrer');
                        } else {
                          window.open(parsed.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <PlayCircleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {v.title || v.url}
                      </Typography>
                      {v.title && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {v.url}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSaved(v.id)}
                      disabled={isPending}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
          {savedVideos.length > 3 && (
            <Button
              size="small"
              onClick={() => setShowAllSaved((prev) => !prev)}
              sx={{ mt: 0.5, mb: 1, textTransform: 'none', fontWeight: 600 }}
            >
              {showAllSaved ? 'Vis færre' : `Vis alle (${savedVideos.length})`}
            </Button>
          )}
          <Divider sx={{ my: 2 }} />
        </>
      )}

      {/* Skadefri */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Skadefri-øvelser
      </Typography>

      <TextField
        placeholder="Søk etter øvelse..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1.5 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Tabs
        value={activeLevel}
        onChange={(_, v) => setActiveLevel(v)}
        sx={{ mb: 1.5, minHeight: 40 }}
        variant="fullWidth"
      >
        {LEVEL_TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            sx={{ minHeight: 40, textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap" useFlexGap>
        {CATEGORY_CHIPS.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            size="small"
            onClick={() => setActiveCategory(chip.value)}
            color={activeCategory === chip.value ? 'primary' : 'default'}
            variant={activeCategory === chip.value ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {filtered.map((exercise, i) => (
        <Card key={`${exercise.vimeoId}-${i}`} sx={{ mb: 1.5 }}>
          <CardContent
            sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:last-child': { pb: 1.5 } }}
            onClick={() => setOpenVideo(exercise)}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: 'rgba(67, 85, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PlayCircleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {exercise.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {exercise.reps}
                </Typography>
              </Box>
              <Chip
                label={`Nivå ${exercise.level}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 22 }}
              />
            </Stack>
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          Ingen øvelser i denne kategorien på nivå {activeLevel}
        </Typography>
      )}

      <Button
        variant="outlined"
        fullWidth
        startIcon={<OpenInNewIcon />}
        href="https://skadefri.no/idretter/handball/skadefri-handball/"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ mt: 2, mb: 1, py: 1, fontWeight: 600 }}
      >
        Åpne Skadefri.no
      </Button>

      {/* Video dialog */}
      <Dialog
        open={!!openVideo}
        onClose={() => setOpenVideo(null)}
        fullScreen
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpenVideo(null)}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 1, flex: 1 }} variant="subtitle1" fontWeight={600} noWrap>
              {openVideo?.title}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
          <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
            {openVideo && (
              <iframe
                src={`https://player.vimeo.com/video/${openVideo.vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {openVideo?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {openVideo?.reps}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
