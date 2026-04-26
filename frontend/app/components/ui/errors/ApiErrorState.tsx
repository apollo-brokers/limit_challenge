'use client';

import { Snackbar, Alert } from '@mui/material';
import { useState } from 'react';

interface ApiErrorStateProps {
  entityName?: string;
  onClose?: () => void;
}

/**
 * Reusable error snackbar for API failures
 * Shows as a notification at the bottom of the screen
 */
export function ApiErrorState({ entityName = 'data', onClose }: ApiErrorStateProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        Failed to load {entityName}. Please refresh the page or try again later.
      </Alert>
    </Snackbar>
  );
}
