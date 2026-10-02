'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Fleetline — operational SaaS theme
 * Slate foundation + teal action accent (fleet/ops, not generic purple SaaS)
 */
export const fleetTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E',
      light: '#14B8A6',
      dark: '#115E59',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#334155',
      light: '#64748B',
      dark: '#1E293B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#15803D',
      light: '#DCFCE7',
      dark: '#166534',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#B45309',
      light: '#FEF3C7',
      dark: '#92400E',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#B91C1C',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0369A1',
      light: '#E0F2FE',
      dark: '#075985',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1F5F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
    action: {
      hover: 'rgba(15, 118, 110, 0.06)',
      selected: 'rgba(15, 118, 110, 0.1)',
      focus: 'rgba(15, 118, 110, 0.16)',
    },
  },
  typography: {
    fontFamily: 'var(--font-body), "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '1.875rem', lineHeight: 1.25 },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.5rem', lineHeight: 1.3 },
    h3: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.25rem', lineHeight: 1.35 },
    h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.125rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.45 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.45, color: '#64748B' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#64748B' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    overline: {
      fontWeight: 700,
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#64748B',
    },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.04)',
    '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    '0 4px 12px rgba(15, 23, 42, 0.06)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(15, 118, 110, 0.07), transparent)',
        },
        '*:focus-visible': {
          outline: '2px solid #0F766E',
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 16,
          paddingBlock: 8,
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#115E59' },
        },
        sizeSmall: { paddingInline: 12, paddingBlock: 6, fontSize: '0.8125rem' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 0.15s ease',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
          },
        },
        notchedOutline: { borderColor: '#CBD5E1' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderBottom: '1px solid #E2E8F0',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          paddingTop: 14,
          paddingBottom: 14,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.12s ease',
          '&:hover': { backgroundColor: 'rgba(15, 118, 110, 0.03)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.125rem',
          letterSpacing: '-0.02em',
          paddingBottom: 8,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          '&.Mui-selected': { color: '#0F766E' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, border: '1px solid transparent' },
        standardInfo: {
          backgroundColor: '#F0F9FF',
          borderColor: '#BAE6FD',
          color: '#0C4A6E',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A',
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
  },
});
