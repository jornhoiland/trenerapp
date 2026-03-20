'use client';

import { createTheme, alpha } from '@mui/material/styles';

// ── Design tokens ──────────────────────────────────────────
const PRIMARY = '#6366F1';      // electric indigo
const PRIMARY_LIGHT = '#818CF8';
const PRIMARY_DARK = '#4F46E5';
const BG_DEFAULT = '#0B0D17';   // near-black blue
const BG_PAPER = '#141625';     // elevated surface
const BG_CARD = '#1A1D2E';      // card surface
const BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F1F5F9';
const TEXT_SECONDARY = '#94A3B8';
const ACCENT_AMBER = '#F59E0B';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: PRIMARY,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main: '#A78BFA',
    },
    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
    success: {
      main: '#22C55E',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: ACCENT_AMBER,
    },
    divider: BORDER,
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
    body2: { color: TEXT_SECONDARY },
    caption: { color: TEXT_SECONDARY, letterSpacing: '0.02em' },
    button: { fontWeight: 600 },
  },
  components: {
    // ── Surfaces ──────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG_DEFAULT,
          color: TEXT_PRIMARY,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_PAPER,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },

    // ── Buttons ──────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
          boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY} 100%)`,
            boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.45)}`,
          },
        },
        outlined: {
          borderColor: alpha(PRIMARY, 0.4),
          color: PRIMARY_LIGHT,
          '&:hover': {
            borderColor: PRIMARY,
            backgroundColor: alpha(PRIMARY, 0.08),
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
          boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.4)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY} 100%)`,
          },
        },
      },
    },

    // ── Inputs ───────────────────────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha('#fff', 0.03),
            '& fieldset': {
              borderColor: BORDER,
            },
            '&:hover fieldset': {
              borderColor: alpha(PRIMARY, 0.4),
            },
            '&.Mui-focused fieldset': {
              borderColor: PRIMARY,
            },
          },
        },
      },
    },

    // ── Selection controls ───────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(PRIMARY_LIGHT, 0.5),
          '&.Mui-checked': {
            color: PRIMARY_LIGHT,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: PRIMARY_LIGHT,
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: PRIMARY,
          },
        },
      },
    },

    // ── Chips ────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
        outlined: {
          borderColor: BORDER,
        },
      },
    },

    // ── Navigation ───────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BG_DEFAULT, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: 'none',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BG_DEFAULT, 0.85),
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${BORDER}`,
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: TEXT_SECONDARY,
          '&.Mui-selected': {
            color: PRIMARY_LIGHT,
          },
        },
      },
    },

    // ── Lists & dividers ─────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BORDER,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: alpha(PRIMARY, 0.06),
          },
        },
      },
    },

    // ── Progress ─────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(PRIMARY, 0.12),
        },
        bar: {
          borderRadius: 3,
          background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
        },
      },
    },

    // ── Accordion ────────────────────────────
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER}`,
          '&:before': { display: 'none' },
          backgroundImage: 'none',
        },
      },
    },

    // ── Tabs ─────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
