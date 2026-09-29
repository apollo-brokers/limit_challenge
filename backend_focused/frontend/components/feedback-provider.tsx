'use client';

import { Alert, Snackbar } from '@mui/material';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const FeedbackContext = createContext<{ notify: (message: string) => void } | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState('');
  const notify = useCallback((value: string) => setMessage(value), []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar open={!!message} autoHideDuration={4500} onClose={() => setMessage('')}>
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const feedback = useContext(FeedbackContext);
  if (!feedback) throw new Error('useFeedback requires FeedbackProvider');
  return feedback;
}
