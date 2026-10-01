'use client';

import { Button, Dialog, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import { MascotDialogTitle } from '@/components/mascot/mascot-dialog-title';
import type { Office } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

type Props = { office: Office; onClose: () => void; onEdit: () => void };

export function OfficeDetailsDialog({ office, onClose, onEdit }: Props) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="office-details-title">
      <MascotDialogTitle id="office-details-title">{office.name}</MascotDialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Office ID
            </Typography>
            <Typography>#{office.id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              City
            </Typography>
            <Typography>{office.city}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Created
            </Typography>
            <Typography>{formatDate(office.created_at)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated
            </Typography>
            <Typography>{formatDate(office.updated_at)}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit}>
          Edit office
        </Button>
      </DialogActions>
    </Dialog>
  );
}
