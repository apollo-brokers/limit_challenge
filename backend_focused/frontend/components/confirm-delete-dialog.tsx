'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { getErrorMessage } from '@/lib/form-errors';

export function ConfirmDeleteDialog({
  open,
  title,
  description = 'This permanently removes the record. This action cannot be undone.',
  isPending,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  isPending: boolean;
  error?: unknown;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} aria-labelledby="delete-title">
      <DialogTitle id="delete-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        {!!error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isPending} autoFocus>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} loading={isPending}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
