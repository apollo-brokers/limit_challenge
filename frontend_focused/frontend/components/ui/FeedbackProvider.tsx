'use client';

import { Alert, Snackbar } from '@mui/material';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface FeedbackContextValue {
  showFeedback: (message: string, severity?: Severity) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');

  const showFeedback = useCallback((nextMessage: string, nextSeverity: Severity = 'info') => {
    setMessage(nextMessage);
    setSeverity(nextSeverity);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showFeedback }), [showFeedback]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setOpen(false);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', alignItems: 'center' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
