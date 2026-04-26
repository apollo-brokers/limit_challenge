import { Snackbar, Alert, AlertProps } from '@mui/material';

interface ValidationErrorSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertProps['severity'];
  autoHideDuration?: number;
}

export function ValidationErrorSnackbar({
  open,
  onClose,
  message,
  severity = 'error',
  autoHideDuration = 4000,
}: ValidationErrorSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
