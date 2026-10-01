'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2459a6' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#172b45', secondary: '#526175' },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.3rem', fontWeight: 650 },
    h3: { fontSize: '1.1rem', fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 650, backgroundColor: '#f5f7fb' } } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: 'sm' } },
    MuiCssBaseline: {
      styleOverrides: { body: { minWidth: 320 }, a: { textUnderlineOffset: '3px' } },
    },
  },
});
