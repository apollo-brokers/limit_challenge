'use client';

import { Button, Dialog, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import { MascotDialogTitle } from '@/components/mascot/mascot-dialog-title';
import { StatusChip } from '@/components/status-chip';
import type { Mechanic } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

type Props = { mechanic: Mechanic; onClose: () => void; onEdit: () => void };

export function MechanicDetailsDialog({ mechanic, onClose, onEdit }: Props) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="mechanic-details-title">
      <MascotDialogTitle id="mechanic-details-title">{mechanic.name}</MascotDialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Mechanic ID
            </Typography>
            <Typography>#{mechanic.id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Certification number
            </Typography>
            <Typography>{mechanic.certification_number}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <StatusChip active={mechanic.active ?? true} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Created
            </Typography>
            <Typography>{formatDate(mechanic.created_at)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated
            </Typography>
            <Typography>{formatDate(mechanic.updated_at)}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit}>
          Edit mechanic
        </Button>
      </DialogActions>
    </Dialog>
  );
}
