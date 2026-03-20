'use client';

import { useState, useCallback, useRef, useTransition, useEffect, useId, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ExerciseItem from '@/components/ExerciseItem';
const VideoPicker = dynamic(() => import('@/components/VideoPicker'));
import CompletionDialog from '@/components/CompletionDialog';
import {
  ArrowBackIcon,
  StarIcon,
  StarBorderIcon,
  AddIcon,
  CheckCircleIcon,
  PersonOutlineIcon,
  SearchIcon,
  CloseIcon,
  PlayCircleIcon,
  ContentCopyIcon,
  EditIcon,
  DeleteIcon,
} from '@/components/icons';
import { updateSession, completeSession, toggleFavorite, duplicateSession, reopenSession } from '@/lib/actions/sessions';
import { addExercise, reorderExercises } from '@/lib/actions/exercises';
import { addSection, renameSection, deleteSection } from '@/lib/actions/sections';
import { createExerciseTemplate } from '@/lib/actions/templates';
import type { SessionWithExercises, ExerciseTemplate, SessionSection } from '@/types/database';
import DatePickerField from '@/components/DatePickerField';

interface Props {
  session: SessionWithExercises;
  templates: ExerciseTemplate[];
}

export default function SessionDetail({ session, templates }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(session.notes || '');
  const [isFavorite, setIsFavorite] = useState(session.is_favorite);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [newExName, setNewExName] = useState('');
  const [newExIndividual, setNewExIndividual] = useState(false);
  const [newExNote, setNewExNote] = useState('');
  const [newExVideoUrl, setNewExVideoUrl] = useState<string | null>(null);
  const [newExDuration, setNewExDuration] = useState('');
  const [newExSaveToLibrary, setNewExSaveToLibrary] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dndId = useId();
  const [reuseDialogOpen, setReuseDialogOpen] = useState(false);
  const [reuseTitle, setReuseTitle] = useState(session.title);
  const [reuseDate, setReuseDate] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);
  const [renamingSectionName, setRenamingSectionName] = useState('');
  const [addToSectionId, setAddToSectionId] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const isCompleted = session.status === 'completed';
  const exercises = session.exercises || [];
  const sections = useMemo(
    () => (session.session_sections || []).slice().sort((a, b) => a.sort_order - b.sort_order),
    [session.session_sections]
  );

  const handleToggleFavorite = () => {
    const newVal = !isFavorite;
    setIsFavorite(newVal);
    startTransition(async () => {
      await toggleFavorite(session.id, newVal);
    });
  };

  const handleMarkDone = useCallback(() => {
    startTransition(async () => {
      await completeSession(session.id);
      setShowCompletion(true);
    });
  }, [session.id, startTransition]);

  const doneCount = exercises.filter((e) => e.is_done).length;
  // const handleRestoreSession = () => {
  //   startTransition(async () => {
  //     await updateSession(session.id, { status: 'planned' });
  //     router.refresh();
  //   });
  // };
  const allDone = exercises.length > 0 && doneCount === exercises.length;
  const prevAllDoneRef = useRef(allDone);

  // Auto-complete session when all exercises are checked
  useEffect(() => {
    if (allDone && !prevAllDoneRef.current && !isCompleted) {
      handleMarkDone();
    }
    prevAllDoneRef.current = allDone;
  }, [allDone, isCompleted, handleMarkDone]);

  // DnD sensors — stable references
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  const sortedExercises = useMemo(
    () => exercises.slice().sort((a, b) => a.sort_order - b.sort_order),
    [exercises]
  );
  const unsectionedExercises = useMemo(
    () => sortedExercises.filter((e) => !e.section_id),
    [sortedExercises]
  );
  const exercisesBySectionId = useCallback(
    (sId: string) => sortedExercises.filter((e) => e.section_id === sId),
    [sortedExercises]
  );
  const allSortableIds = useMemo(
    () => [
      ...sections.flatMap((s) => exercisesBySectionId(s.id).map((e) => e.id)),
      ...unsectionedExercises.map((e) => e.id),
    ],
    [sections, exercisesBySectionId, unsectionedExercises]
  );

  const renderExercises = useCallback(
    (items: typeof exercises) =>
      items.map((exercise) => (
        <ExerciseItem
          key={exercise.id}
          exercise={exercise}
          readOnly={isCompleted}
          sections={sections}
        />
      )),
    [isCompleted, sections]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      // Sync to server
      startTransition(async () => {
        const currentExercises = exercises.slice();
        const oldIndex = currentExercises.findIndex((e) => e.id === active.id);
        const newIndex = currentExercises.findIndex((e) => e.id === (over?.id ?? ''));
        if (oldIndex === -1 || newIndex === -1) return;
        const [moved] = currentExercises.splice(oldIndex, 1);
        currentExercises.splice(newIndex, 0, moved);
        await reorderExercises(session.id, currentExercises.map((e) => e.id));
      });
    },
    [exercises, session.id, startTransition]
  );

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          await updateSession(session.id, { notes: value });
        });
      }, 800);
    },
    [session.id, startTransition]
  );

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    const durationNum = newExDuration ? parseInt(newExDuration, 10) : undefined;
    const validDuration = durationNum && !isNaN(durationNum) && durationNum > 0 ? durationNum : undefined;
    startTransition(async () => {
      await addExercise(session.id, newExName.trim(), newExIndividual, newExNote || undefined, undefined, newExVideoUrl || undefined, validDuration, addToSectionId || undefined);
      if (newExSaveToLibrary) {
        await createExerciseTemplate({
          name: newExName.trim(),
          is_individual: newExIndividual,
          individual_note: newExIndividual ? newExNote.trim() || null : null,
          video_url: newExVideoUrl,
          duration_minutes: validDuration ?? null,
        });
      }
      setNewExName('');
      setNewExIndividual(false);
      setNewExNote('');
      setNewExVideoUrl(null);
      setNewExDuration('');
      setNewExSaveToLibrary(false);
      setShowAddExercise(false);
      setShowManualForm(false);
      router.refresh();
    });
  };

  const handleQuickAddTemplate = (template: ExerciseTemplate) => {
    startTransition(async () => {
      await addExercise(
        session.id,
        template.name,
        template.is_individual,
        template.individual_note || undefined,
        template.description || undefined,
        template.video_url || undefined,
        template.duration_minutes ?? undefined,
        addToSectionId || undefined,
      );
      router.refresh();
    });
  };

  const handleCloseAddDialog = () => {
    setShowAddExercise(false);
    setShowManualForm(false);
    setTemplateSearch('');
    setNewExName('');
    setNewExIndividual(false);
    setNewExNote('');
    setNewExVideoUrl(null);
    setNewExDuration('');
    setNewExSaveToLibrary(false);
    setAddToSectionId(null);
  };

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.name.toLowerCase().includes(templateSearch.toLowerCase())),
    [templates, templateSearch]
  );

  const handleCompletionClose = () => {
    setShowCompletion(false);
    // Dialog lukkes, økten vises videre
  };

  const formattedDate = useMemo(
    () => new Date(session.date).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [session.date]
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: isCompleted ? 'rgba(30,32,53,0.9)' : undefined }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }} noWrap>
            {session.title}
          </Typography>
          <IconButton color="inherit" onClick={handleToggleFavorite}>
            {isFavorite ? <StarIcon sx={{ color: '#F59E0B' }} /> : <StarBorderIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
          {isCompleted && <Chip label="Fullført" size="small" color="success" />}
        </Stack>

        {exercises.length > 0 && (
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            {doneCount} av {exercises.length} øvelser gjennomført
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Øvelser
        </Typography>

        {exercises.length > 0 || sections.length > 0 ? (
          (() => {
            const content = (
              <>
                {sections.map((section) => {
                  const sectionExercises = exercisesBySectionId(section.id);
                  return (
                    <Box key={section.id} sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', flex: 1 }}>
                          {section.name}
                        </Typography>
                        {!isCompleted && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAddToSectionId(section.id);
                                setShowAddExercise(true);
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <AddIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setRenamingSectionId(section.id);
                                setRenamingSectionName(section.name);
                              }}
                              sx={{ color: 'text.secondary' }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                startTransition(async () => {
                                  await deleteSection(section.id, session.id);
                                  router.refresh();
                                });
                              }}
                              disabled={isPending}
                              sx={{ color: 'text.disabled' }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                      <Box sx={{ pl: 1 }}>
                        {sectionExercises.length > 0 ? (
                          renderExercises(sectionExercises)
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ pl: 1, display: 'block', mb: 1 }}>
                            Ingen øvelser i denne seksjonen
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
                {unsectionedExercises.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {sections.length > 0 && (
                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                        Uten seksjon
                      </Typography>
                    )}
                    {renderExercises(unsectionedExercises)}
                  </Box>
                )}
              </>
            );

            if (!isMounted) return content;
            return (
              <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
                  {content}
                </SortableContext>
              </DndContext>
            );
          })()
        ) : (
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingen øvelser lagt til ennå
          </Typography>
        )}

        {!isCompleted && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setAddToSectionId(null);
                setShowAddExercise(true);
              }}
              sx={{ flex: 1 }}
            >
              Legg til øvelse
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setAddSectionOpen(true)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              + Seksjon
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Notater
        </Typography>

        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder="Skriv notater om økten her..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={isCompleted}
          variant="outlined"
          sx={{ mb: 3 }}
        />

        {!isCompleted && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<CheckCircleIcon />}
            onClick={handleMarkDone}
            disabled={isPending}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 3,
            }}
          >
            Marker som ferdig
          </Button>
        )}

        {isCompleted && (
          <Stack spacing={1.5} sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon sx={{ fontSize: 20 }} />}
              fullWidth
              onClick={() => setReuseDialogOpen(true)}
            >
              Gjenbruk økt
            </Button>
            <Button
              variant="outlined"
              fullWidth
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await reopenSession(session.id);
                  router.refresh();
                });
              }}
            >
              Gjenåpne økt
            </Button>
          </Stack>
        )}
      </Container>

      {/* Add Exercise Dialog */}
      <Dialog
        open={showAddExercise}
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          Legg til øvelse
          <IconButton onClick={handleCloseAddDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 0 }}>
          {templates.length > 0 && (
            <>
              <TextField
                size="small"
                placeholder="Søk i øvelsesbiblioteket..."
                fullWidth
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />
              <List disablePadding sx={{ maxHeight: 140, overflow: 'auto', mb: 1 }}>
                {filteredTemplates.map((t) => (
                  <ListItemButton
                    key={t.id}
                    onClick={() => handleQuickAddTemplate(t)}
                    disabled={isPending}
                    dense
                    sx={{ borderRadius: 1.5, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{t.name}</span>
                          {t.is_individual && (
                            <PersonOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          )}
                          {t.video_url && (
                            <PlayCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          )}
                        </Stack>
                      }
                      secondary={t.description}
                      slotProps={{ secondary: { noWrap: true } }}
                    />
                  </ListItemButton>
                ))}
                {filteredTemplates.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Ingen treff i biblioteket
                  </Typography>
                )}
              </List>
              <Divider />
            </>
          )}

          {!showManualForm ? (
            <Button
              fullWidth
              onClick={() => setShowManualForm(true)}
              sx={{ my: 1.5, justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
              startIcon={<AddIcon />}
            >
              Opprett ny øvelse manuelt
            </Button>
          ) : (
            <Box sx={{ pt: 1.5, pb: 1 }}>
              <TextField
                autoFocus
                size="small"
                label="Øvelsesnavn"
                placeholder="F.eks. Knebøy 3x10"
                fullWidth
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
                sx={{ mb: 1.5 }}
              />
              <TextField
                size="small"
                label="Beskrivelse (valgfritt)"
                placeholder="Forklaring, tips eller notat"
                fullWidth
                multiline
                minRows={2}
                maxRows={5}
                value={newExNote}
                onChange={(e) => setNewExNote(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <TextField
                size="small"
                label="Tid (minutter)"
                placeholder="F.eks. 10"
                type="number"
                fullWidth
                value={newExDuration}
                onChange={(e) => setNewExDuration(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ mb: 1.5 }}
              />
              <VideoPicker value={newExVideoUrl} onChange={setNewExVideoUrl} />
              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Switch
                    checked={newExIndividual}
                    onChange={(e) => setNewExIndividual(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PersonOutlineIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">Individuell øvelse</Typography>
                  </Stack>
                }
              />
              {newExIndividual && (
                <TextField
                  size="small"
                  label="Individuell notat (valgfritt)"
                  placeholder="F.eks. hvem, forklaring, etc."
                  fullWidth
                  value={newExNote}
                  onChange={(e) => setNewExNote(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newExSaveToLibrary}
                    onChange={(e) => setNewExSaveToLibrary(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Lagre i øvelsesbiblioteket</Typography>}
                sx={{ mt: 1, display: 'flex' }}
              />
              <Button
                onClick={handleAddExercise}
                variant="contained"
                fullWidth
                disabled={!newExName.trim() || isPending}
                sx={{ mt: 1.5 }}
              >
                Legg til
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <CompletionDialog open={showCompletion} onClose={handleCompletionClose} />

      <Dialog open={reuseDialogOpen} onClose={() => setReuseDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Gjenbruk økt</DialogTitle>
        <DialogContent>
          <TextField
            label="Tittel"
            fullWidth
            value={reuseTitle}
            onChange={(e) => setReuseTitle(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
          <DatePickerField value={reuseDate} onChange={setReuseDate} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReuseDialogOpen(false)}>Avbryt</Button>
          <Button variant="contained" onClick={async () => {
            setReuseDialogOpen(false);
            await duplicateSession(session.id, reuseTitle.trim() || session.title, reuseDate);
            router.push('/');
          }}>Opprett</Button>
        </DialogActions>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onClose={() => setAddSectionOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ny seksjon</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Seksjonsnavn"
            placeholder="F.eks. Oppvarming, Hoveddel, Avslutning"
            fullWidth
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSectionName.trim()) {
                startTransition(async () => {
                  await addSection(session.id, newSectionName.trim());
                  setNewSectionName('');
                  setAddSectionOpen(false);
                  router.refresh();
                });
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSectionOpen(false)}>Avbryt</Button>
          <Button
            variant="contained"
            disabled={!newSectionName.trim() || isPending}
            onClick={() => {
              startTransition(async () => {
                await addSection(session.id, newSectionName.trim());
                setNewSectionName('');
                setAddSectionOpen(false);
                router.refresh();
              });
            }}
          >
            Opprett
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Section Dialog */}
      <Dialog open={!!renamingSectionId} onClose={() => setRenamingSectionId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Endre seksjonsnavn</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Seksjonsnavn"
            fullWidth
            value={renamingSectionName}
            onChange={(e) => setRenamingSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renamingSectionName.trim() && renamingSectionId) {
                startTransition(async () => {
                  await renameSection(renamingSectionId!, session.id, renamingSectionName.trim());
                  setRenamingSectionId(null);
                  router.refresh();
                });
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenamingSectionId(null)}>Avbryt</Button>
          <Button
            variant="contained"
            disabled={!renamingSectionName.trim() || isPending}
            onClick={() => {
              if (!renamingSectionId) return;
              startTransition(async () => {
                await renameSection(renamingSectionId!, session.id, renamingSectionName.trim());
                setRenamingSectionId(null);
                router.refresh();
              });
            }}
          >
            Lagre
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
