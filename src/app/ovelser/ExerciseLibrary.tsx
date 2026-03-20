'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { AddIcon, DeleteIcon, EditIcon, PersonOutlineIcon, SearchIcon, PlayCircleIcon } from '@/components/icons';
import SvgIcon from '@mui/material/SvgIcon';

function ExpandMoreIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </SvgIcon>
  );
}

import { createExerciseTemplate, updateExerciseTemplate, deleteExerciseTemplate } from '@/lib/actions/templates';
import VideoPicker from '@/components/VideoPicker';
import { getVideoLabel, parseVideoUrl } from '@/lib/videos';
import type { ExerciseTemplate } from '@/types/database';

interface Props {
  templates: ExerciseTemplate[];
}

export default function ExerciseLibrary({ templates }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ExerciseTemplate | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isIndividual, setIsIndividual] = useState(false);
  const [individualNote, setIndividualNote] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState('');

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditTemplate(null);
    setName('');
    setDescription('');
    setIsIndividual(false);
    setIndividualNote('');
    setVideoUrl(null);
    setDuration('');
    setDialogOpen(true);
  };

  const openEdit = (t: ExerciseTemplate) => {
    setEditTemplate(t);
    setName(t.name);
    setDescription(t.description || '');
    setIsIndividual(t.is_individual);
    setIndividualNote(t.individual_note || '');
    setVideoUrl(t.video_url);
    setDuration(t.duration_minutes?.toString() || '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const durationNum = duration ? parseInt(duration, 10) : null;
    const validDuration = durationNum && !isNaN(durationNum) && durationNum > 0 ? durationNum : null;
    startTransition(async () => {
      if (editTemplate) {
        await updateExerciseTemplate(editTemplate.id, {
          name: name.trim(),
          description: description.trim() || null,
          is_individual: isIndividual,
          individual_note: isIndividual ? individualNote.trim() || null : null,
          video_url: videoUrl,
          duration_minutes: validDuration,
        });
      } else {
        await createExerciseTemplate({
          name: name.trim(),
          description: description.trim() || null,
          is_individual: isIndividual,
          individual_note: isIndividual ? individualNote.trim() || null : null,
          video_url: videoUrl,
          duration_minutes: validDuration,
        });
      }
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteExerciseTemplate(id);
      router.refresh();
    });
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        placeholder="Søk i øvelser..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          },
        }}
        sx={{ mb: 2 }}
      />

      {filtered.length > 0 ? (
        <Stack spacing={1}>
          {filtered.map((t) => {
            const isExpanded = expandedId === t.id;
            const hasDetails = t.description || t.duration_minutes || t.is_individual || t.video_url;
            return (
              <Card key={t.id}>
                <CardContent
                  sx={{ py: 1.5, '&:last-child': { pb: hasDetails && !isExpanded ? 1.5 : undefined }, cursor: hasDetails ? 'pointer' : undefined }}
                  onClick={() => hasDetails && setExpandedId(isExpanded ? null : t.id)}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {t.name}
                        </Typography>
                        {t.is_individual && (
                          <Tooltip title={t.individual_note || 'Individuell øvelse'}>
                            <span>
                              <PersonOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            </span>
                          </Tooltip>
                        )}
                        {t.video_url && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const parsed = parseVideoUrl(t.video_url!);
                              if (parsed.type === 'vimeo') {
                                window.open(`https://vimeo.com/${parsed.id}`, '_blank', 'noopener,noreferrer');
                              } else {
                                window.open(parsed.url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            sx={{ p: 0.25 }}
                          >
                            <PlayCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </IconButton>
                        )}
                        {t.duration_minutes && (
                          <Typography variant="caption" color="text.secondary">
                            {t.duration_minutes} min
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    {hasDetails && (
                      <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    )}
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(t); }} color="primary">
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} color="error" disabled={isPending}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </CardContent>
                {hasDetails && (
                  <Collapse in={isExpanded}>
                    <Divider />
                    <CardContent sx={{ pt: 1.5, '&:last-child': { pb: 1.5 } }}>
                      {t.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                          {t.description}
                        </Typography>
                      )}
                      {t.is_individual && t.individual_note && (
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                          <PersonOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {t.individual_note}
                          </Typography>
                        </Stack>
                      )}
                      {t.video_url && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PlayCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {getVideoLabel(t.video_url)}
                          </Typography>
                        </Stack>
                      )}
                    </CardContent>
                  </Collapse>
                )}
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Box textAlign="center" mt={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? 'Ingen treff' : 'Ingen øvelser ennå'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trykk + for å opprette en gjenbrukbar øvelse
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        onClick={openCreate}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1100,
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editTemplate ? 'Rediger øvelse' : 'Ny øvelse'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Øvelsesnavn"
            placeholder="F.eks. Knebøy"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Beskrivelse (valgfritt)"
            placeholder="F.eks. 3 sett x 10 rep"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={6}
            maxRows={14}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tid (minutter)"
            placeholder="F.eks. 10"
            type="number"
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ mb: 2 }}
          />
          <VideoPicker value={videoUrl} onChange={setVideoUrl} />
          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                checked={isIndividual}
                onChange={(e) => setIsIndividual(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PersonOutlineIcon sx={{ fontSize: 20 }} />
                <span>Individuell øvelse</span>
              </Stack>
            }
          />
          {isIndividual && (
            <TextField
              margin="dense"
              label="Notat for individuell tilpasning"
              fullWidth
              value={individualNote}
              onChange={(e) => setIndividualNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Avbryt
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!name.trim() || isPending}>
            {editTemplate ? 'Lagre' : 'Opprett'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
