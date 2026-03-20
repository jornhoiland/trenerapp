'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useMemo, memo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import {
  ContentCopyIcon,
  StarIcon,
  FolderIcon,
  CreateNewFolderIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
} from '@/components/icons';
import { duplicateSession, deleteSession } from '@/lib/actions/sessions';
import { useNavigationProgress } from '@/components/NavigationProgress';
import { createFolder, deleteFolder, renameFolder, moveSessionToFolder } from '@/lib/actions/folders';
import type { SessionWithExercises, HistoryFolder } from '@/types/database';
import SvgIcon from '@mui/material/SvgIcon';
import DatePickerField from './DatePickerField';

function ExpandMoreIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </SvgIcon>
  );
}

const monthNames = [
  'januar', 'februar', 'mars', 'april', 'mai', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'desember',
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function groupByWeek(sessions: SessionWithExercises[]) {
  const grouped: Record<string, { week: number; month: string; year: number; days: Record<string, SessionWithExercises[]> }> = {};

  sessions.forEach((session) => {
    const date = new Date(session.date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const month = monthNames[date.getMonth()];
    const key = `${year}-W${week}`;
    const dayKey = session.date;

    if (!grouped[key]) grouped[key] = { week, month, year, days: {} };
    if (!grouped[key].days[dayKey]) grouped[key].days[dayKey] = [];
    grouped[key].days[dayKey].push(session);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, val]) => val);
}

interface Props {
  sessions: SessionWithExercises[];
  folders: HistoryFolder[];
}

export default function HistoryAccordion({ sessions, folders }: Props) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderOpen, setRenameFolderOpen] = useState<HistoryFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const router = useRouter();
  const [reuseDate, setReuseDate] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.exercises?.some((e) => e.name.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const unfolderedSessions = filtered.filter((s) => !s.folder_id);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    startTransition(async () => {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderOpen(false);
      router.refresh();
    });
  };

  const handleDeleteFolder = (id: string) => {
    startTransition(async () => {
      await deleteFolder(id);
      router.refresh();
    });
  };

  const handleRenameFolder = () => {
    if (!renameFolderOpen || !renameFolderName.trim()) return;
    startTransition(async () => {
      await renameFolder(renameFolderOpen!.id, renameFolderName.trim());
      setRenameFolderOpen(null);
      router.refresh();
    });
  };

  return (
    <>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Søk i historikk..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5 } }}
      >
        <Tab label="Kategorier" />
        <Tab label="Tidslinje" />
      </Tabs>

      {/* Category view */}
      {tab === 0 && (
        <>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setNewFolderOpen(true)}
            size="small"
            sx={{ mb: 2 }}
          >
            Ny kategori
          </Button>

          {folders.map((folder) => {
            const fsessions = filtered.filter((s) => s.folder_id === folder.id);
            return (
              <Accordion key={folder.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={1} width="100%" pr={1}>
                    <FolderIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                      {folder.name}
                    </Typography>
                    <Chip label={`${fsessions.length}`} size="small" variant="outlined" />
                    <Tooltip title="Endre navn">
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameFolderName(folder.name);
                          setRenameFolderOpen(folder);
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Slett kategori">
                      <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        disabled={isPending}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1, pt: 0 }}>
                  {fsessions.length > 0 ? (
                    <List disablePadding>
                      {fsessions
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((session) => (
                          <SessionItem key={session.id} session={session} folders={folders} />
                        ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Ingen økter i denne kategorien
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

          {unfolderedSessions.length > 0 && (
            <>
              {folders.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, mb: 1, display: 'block' }}>
                  Usortert ({unfolderedSessions.length})
                </Typography>
              )}
              <List disablePadding>
                {unfolderedSessions
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((session) => (
                    <SessionItem key={session.id} session={session} folders={folders} />
                  ))}
              </List>
            </>
          )}

          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
              Ingen treff
            </Typography>
          )}
        </>
      )}

      {/* Timeline view */}
      {tab === 1 && (
        <>
          {filtered.length > 0 ? (
            <TimelineView sessions={filtered} folders={folders} />
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
              Ingen treff
            </Typography>
          )}
        </>
      )}

      {/* Create folder dialog */}
      <Dialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ny kategori</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Kategorinavn"
            placeholder="F.eks. Skuldertrening, Oppvarming"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderOpen(false)}>Avbryt</Button>
          <Button variant="contained" onClick={handleCreateFolder} disabled={!newFolderName.trim() || isPending}>
            Opprett
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename folder dialog */}
      <Dialog open={!!renameFolderOpen} onClose={() => setRenameFolderOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Endre kategorinavn</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Kategorinavn"
            fullWidth
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameFolderOpen(null)}>Avbryt</Button>
          <Button variant="contained" onClick={handleRenameFolder} disabled={!renameFolderName.trim() || isPending}>
            Lagre
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ── Timeline View ── */
function TimelineView({ sessions, folders }: { sessions: SessionWithExercises[]; folders: HistoryFolder[] }) {
  const weeks = groupByWeek(sessions);

  return (
    <>
      {weeks.map((group, i) => {
        const totalInWeek = Object.values(group.days).reduce((s, d) => s + d.length, 0);
        const days = Object.keys(group.days).sort().reverse();

        return (
          <Accordion key={`${group.year}-${group.week}`} defaultExpanded={i === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Uke {group.week}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.month} {group.year}
                </Typography>
                <Chip
                  label={`${totalInWeek} økt${totalInWeek !== 1 ? 'er' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, pt: 0 }}>
              {days.map((day) => (
                <Box key={day}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pl: 1, pt: 1, display: 'block', textTransform: 'capitalize' }}
                  >
                    {formatDay(day)}
                  </Typography>
                  <List disablePadding>
                    {group.days[day].map((session) => (
                      <SessionItem key={session.id} session={session} folders={folders} />
                    ))}
                  </List>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
}

/* ── Session Item ── */
const SessionItem = memo(function SessionItem({ session, folders }: { session: SessionWithExercises; folders: HistoryFolder[] }) {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [moveAnchor, setMoveAnchor] = useState<null | HTMLElement>(null);
  const [reuseDate, setReuseDate] = useState('');

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(session.title);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    startTransition(async () => {
      const newSession = await duplicateSession(session.id, title.trim() || session.title, reuseDate);
      startNavigation();
      router.push(`/sessions/${newSession.id}`);
    });
  };

  const handleMoveToFolder = (folderId: string | null) => {
    setMoveAnchor(null);
    startTransition(async () => {
      await moveSessionToFolder(session.id, folderId);
      router.refresh();
    });
  };

  const handleDeleteSession = () => {
    setDeleteConfirmOpen(false);
    startTransition(async () => {
      await deleteSession(session.id);
      router.refresh();
    });
  };

  const exerciseCount = session.exercises?.length || 0;
  const doneCount = session.exercises?.filter((e) => e.is_done).length || 0;
  const folder = folders.find((f) => f.id === session.folder_id);

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <Stack direction="row" spacing={0}>
            <Tooltip title="Flytt til kategori">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoveAnchor(e.currentTarget);
                }}
                disabled={isPending}
              >
                <FolderIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gjenbruk denne økten">
              <IconButton onClick={handleDuplicateClick} disabled={isPending} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Slett økt">
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmOpen(true);
                }}
                disabled={isPending}
                color="error"
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      >
        <ListItemButton component={Link} href={`/sessions/${session.id}`} onClick={() => startNavigation()} sx={{ pl: 2, borderRadius: 1.5 }}>
          <ListItemText
            primary={
              <span>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {session.is_favorite && <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />}
                  <span>{session.title}</span>
                </Stack>
              </span>
            }
            secondary={
              <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                <span>{doneCount}/{exerciseCount} øvelser</span>
                {folder && (
                  <>
                    <span>·</span>
                    <Chip label={folder.name} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
                  </>
                )}
              </Stack>
            }
            slotProps={{ secondary: { component: 'span' } }}
          />
        </ListItemButton>
      </ListItem>

      <Menu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={() => setMoveAnchor(null)}>
        {session.folder_id && (
          <MenuItem onClick={() => handleMoveToFolder(null)}>
            <Typography variant="body2" color="text.secondary">Fjern fra kategori</Typography>
          </MenuItem>
        )}
        {folders
          .filter((f) => f.id !== session.folder_id)
          .map((f) => (
            <MenuItem key={f.id} onClick={() => handleMoveToFolder(f.id)}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FolderIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <span>{f.name}</span>
              </Stack>
            </MenuItem>
          ))}
        {folders.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">Opprett en kategori først</Typography>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Gjenbruk økt</DialogTitle>
        <DialogContent>
          <TextField
            label="Tittel"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
          <DatePickerField value={reuseDate} onChange={setReuseDate} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Avbryt</Button>
          <Button variant="contained" onClick={handleConfirm}>
            Opprett
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Slett økt</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Er du sikker på at du vil slette «{session.title}»? Dette kan ikke angres.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Avbryt</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSession} disabled={isPending}>
            Slett
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
