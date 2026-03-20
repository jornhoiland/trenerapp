'use client';

import { useState, useTransition, memo } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import { DeleteIcon, EditIcon, PersonOutlineIcon, PlayCircleIcon, CloseIcon } from '@/components/icons';
import SvgIcon from '@mui/material/SvgIcon';
import { toggleExercise, deleteExercise, updateExercise } from '@/lib/actions/exercises';
import { parseVideoUrl, findSkadefriVideo } from '@/lib/videos';
import VideoPicker from '@/components/VideoPicker';
import type { Exercise, SessionSection } from '@/types/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

function DragHandleIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </SvgIcon>
  );
}

function TimerIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
    </SvgIcon>
  );
}

interface Props {
  exercise: Exercise;
  readOnly?: boolean;
  sections?: SessionSection[];
}

export default memo(function ExerciseItem({ exercise, readOnly = false, sections = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(exercise.name);
  const [editDesc, setEditDesc] = useState(exercise.description || '');
  const [editIndividual, setEditIndividual] = useState(exercise.is_individual);
  const [editNote, setEditNote] = useState(exercise.individual_note || '');
  const [editDuration, setEditDuration] = useState(exercise.duration_minutes?.toString() || '');
  const [editSectionId, setEditSectionId] = useState(exercise.section_id || '');
  const [editVideoUrl, setEditVideoUrl] = useState<string | null>(exercise.video_url || null);
  const [videoOpen, setVideoOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: sortableTransition,
    isDragging,
  } = useSortable({ id: exercise.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: sortableTransition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : isPending ? 0.6 : 1,
  };

  const handleToggle = () => {
    if (readOnly) return;
    const newValue = !exercise.is_done;
    startTransition(async () => {
      await toggleExercise(exercise.id, exercise.session_id, newValue);
    });
  };

  const handleDelete = () => {
    if (readOnly) return;
    startTransition(async () => {
      await deleteExercise(exercise.id, exercise.session_id);
    });
  };

  const handleEditOpen = () => {
    setEditName(exercise.name);
    setEditDesc(exercise.description || '');
    setEditIndividual(exercise.is_individual);
    setEditNote(exercise.individual_note || '');
    setEditDuration(exercise.duration_minutes?.toString() || '');
    setEditSectionId(exercise.section_id || '');
    setEditVideoUrl(exercise.video_url || null);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    const durationNum = editDuration ? parseInt(editDuration, 10) : null;
    const validDuration = durationNum && !isNaN(durationNum) && durationNum > 0 ? durationNum : null;
    startTransition(async () => {
      await updateExercise(exercise.id, exercise.session_id, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        is_individual: editIndividual,
        individual_note: editIndividual ? editNote.trim() || null : null,
        duration_minutes: validDuration,
        section_id: editSectionId || null,
        video_url: editVideoUrl,
      });
      setEditOpen(false);
    });
  };

  return (
    <>
      <ListItem
        ref={setNodeRef}
        style={style}
        sx={{
          backgroundColor: exercise.is_done ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
          borderRadius: 2,
          mb: 0.5,
          transition: 'background-color 0.2s',
          pr: !readOnly ? '88px' : undefined,
        }}
        secondaryAction={
          !readOnly ? (
            <Stack direction="row" spacing={0}>
              <Tooltip title="Rediger øvelse">
                <IconButton onClick={handleEditOpen} size="small" color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Slett øvelse">
                <IconButton onClick={handleDelete} size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : undefined
        }
      >
        {!readOnly && (
          <ListItemIcon sx={{ minWidth: 28, cursor: 'grab', touchAction: 'none' }} {...attributes} {...listeners}>
            <DragHandleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </ListItemIcon>
        )}
        <ListItemIcon sx={{ minWidth: 42 }}>
          <Checkbox
            edge="start"
            checked={exercise.is_done}
            onChange={handleToggle}
            disabled={readOnly}
            sx={{ p: 0.5 }}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography
                sx={{
                  textDecoration: exercise.is_done ? 'line-through' : 'none',
                  color: exercise.is_done ? 'text.secondary' : 'text.primary',
                }}
              >
                {exercise.name}
              </Typography>
              {exercise.duration_minutes && (
                <Chip
                  icon={<TimerIcon sx={{ fontSize: 14 }} />}
                  label={`${exercise.duration_minutes} min`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-icon': { ml: 0.5 } }}
                />
              )}
              {exercise.is_individual && (
                <Tooltip title={exercise.individual_note || 'Individuell øvelse'}>
                  <span>
                    <PersonOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </span>
                </Tooltip>
              )}
              {exercise.video_url && (
                <Tooltip title="Se treningsvideo">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const parsed = parseVideoUrl(exercise.video_url!);
                      if (parsed.type === 'vimeo') {
                        setVideoOpen(true);
                      } else {
                        window.open(parsed.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    sx={{ p: 0.25, ml: -0.25 }}
                  >
                    <PlayCircleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          }
          secondary={exercise.description}
        />
      </ListItem>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Rediger øvelse</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Øvelsesnavn"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Beskrivelse (valgfritt)"
            placeholder="Forklaring, tips eller notat"
            fullWidth
            multiline
            minRows={6}
            maxRows={14}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tid (minutter)"
            placeholder="F.eks. 10"
            type="number"
            fullWidth
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ mb: 2 }}
          />
          {sections.length > 0 && (
            <TextField
              margin="dense"
              label="Seksjon"
              select
              fullWidth
              value={editSectionId}
              onChange={(e) => setEditSectionId(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Ingen seksjon</MenuItem>
              {sections.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
          )}
          <VideoPicker value={editVideoUrl} onChange={setEditVideoUrl} />
          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                checked={editIndividual}
                onChange={(e) => setEditIndividual(e.target.checked)}
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
          {editIndividual && (
            <TextField
              margin="dense"
              label="Individuell notat (valgfritt)"
              placeholder="F.eks. hvem, forklaring, etc."
              fullWidth
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Avbryt
          </Button>
          <Button onClick={handleEditSave} variant="contained" disabled={!editName.trim() || isPending}>
            {isPending ? 'Lagrer...' : 'Lagre'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video dialog (Vimeo embed) */}
      {exercise.video_url && (() => {
        const parsed = parseVideoUrl(exercise.video_url!);
        if (parsed.type !== 'vimeo') return null;
        const skadefri = findSkadefriVideo(parsed.id);
        return (
          <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} fullScreen>
            <AppBar sx={{ position: 'relative' }}>
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={() => setVideoOpen(false)}>
                  <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 1, flex: 1 }} variant="subtitle1" fontWeight={600} noWrap>
                  {skadefri?.title || exercise.name}
                </Typography>
              </Toolbar>
            </AppBar>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
              <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
                <iframe
                  src={`https://player.vimeo.com/video/${parsed.id}?autoplay=1&title=0&byline=0&portrait=0`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </Box>
              {skadefri && (
                <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {skadefri.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {skadefri.reps}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
});
