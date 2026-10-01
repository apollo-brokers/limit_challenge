'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { MascotDialogTitle } from '@/components/mascot/mascot-dialog-title';
import type { MaintenanceRecord, Mechanic, Vehicle } from '@/lib/api/types';
import { formatCost, formatDate } from '@/lib/format';

export function MaintenanceDetailDialog({
  record,
  vehicle,
  mechanic,
  onClose,
  onEdit,
}: {
  record: MaintenanceRecord;
  vehicle?: Vehicle;
  mechanic?: Mechanic;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Dialog open onClose={onClose} aria-labelledby="maintenance-detail-title">
      <MascotDialogTitle id="maintenance-detail-title">{record.maintenance_type}</MascotDialogTitle>
      <DialogContent>
        <Stack gap={2}>
          <Typography>
            {formatDate(record.maintenance_date)} · Cost: {formatCost(record.cost)}
          </Typography>
          <Typography>
            <strong>Vehicle:</strong>{' '}
            {vehicle
              ? `${vehicle.license_plate} · ${vehicle.make} ${vehicle.model}`
              : `#${record.vehicle}`}
          </Typography>
          <Typography>
            <strong>Mechanic:</strong>{' '}
            {mechanic
              ? `${mechanic.name} · ${mechanic.certification_number}`
              : `#${record.mechanic}`}
          </Typography>
          <Divider />
          <Typography variant="h3">Notes</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {record.notes || 'No notes recorded.'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onEdit} variant="contained">
          Edit record
        </Button>
      </DialogActions>
    </Dialog>
  );
}
