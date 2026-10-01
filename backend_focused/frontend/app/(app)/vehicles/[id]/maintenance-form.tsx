'use client';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { ErrorAlert, PageSpinner } from '@/components/query-state';
import { useNotify } from '@/app/providers';
import { apiClient } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-errors';
import { todayIso } from '@/lib/format';
import { useMaintenanceTypes, useMechanics } from '@/lib/lookups';
import type { MaintenanceRecordWrite, MaintenanceType, Mechanic } from '@/lib/types';

type FormValues = {
  type: string;
  mechanic: string;
  performed_on: string;
  cost: string;
  notes: string;
};

/** API field name -> form field name. */
const API_FIELDS = {
  type_id: 'type',
  mechanic_id: 'mechanic',
  performed_on: 'performed_on',
  cost: 'cost',
  notes: 'notes',
};

type MaintenanceFormProps = {
  vehicleId: number;
  types: MaintenanceType[];
  mechanics: Mechanic[];
  isPending: boolean;
  error: unknown;
  onSubmit: (values: MaintenanceRecordWrite) => void;
  onCancel: () => void;
};

/**
 * Form for a new maintenance record of one vehicle.
 *
 * The API checks the rules (valid ids, non-negative cost). Its 400 messages are shown next to the
 * matching inputs, and messages for other fields go in an alert on top.
 */
export function MaintenanceForm({
  vehicleId,
  types,
  mechanics,
  isPending,
  error,
  onSubmit,
  onCancel,
}: MaintenanceFormProps) {
  const [values, setValues] = useState<FormValues>(() => ({
    type: '',
    mechanic: '',
    performed_on: todayIso(),
    cost: '',
    notes: '',
  }));
  const [editedFields, setEditedFields] = useState<Set<string>>(() => new Set());
  const { message, fieldErrors } = parseApiError(error, API_FIELDS);

  function field(name: keyof FormValues, label: string) {
    const fieldError = editedFields.has(name) ? undefined : fieldErrors[name];
    return {
      name,
      label,
      value: values[name],
      onChange: (event: { target: { value: string } }) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        setEditedFields((current) => new Set(current).add(name));
      },
      error: Boolean(fieldError),
      helperText: fieldError,
      fullWidth: true,
    };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEditedFields(new Set());
    onSubmit({
      vehicle_id: vehicleId,
      type_id: values.type === '' ? null : Number(values.type),
      mechanic_id: values.mechanic === '' ? null : Number(values.mechanic),
      performed_on: values.performed_on,
      cost: values.cost,
      notes: values.notes,
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogContent sx={{ pt: 1 }}>
        {message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select required {...field('type', 'Type')}>
              {types.map((type) => (
                <MenuItem key={type.id} value={String(type.id)}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select required {...field('mechanic', 'Mechanic')}>
              {mechanics.map((mechanic) => (
                <MenuItem key={mechanic.id} value={String(mechanic.id)}>
                  {mechanic.name} ({mechanic.certification_number})
                  {mechanic.active ? '' : ' · inactive'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              required
              {...field('performed_on', 'Date')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              required
              {...field('cost', 'Cost (USD)')}
              slotProps={{ htmlInput: { step: '0.01', inputMode: 'decimal' } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField multiline minRows={2} {...field('notes', 'Notes')} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={isPending}>
          Add maintenance
        </Button>
      </DialogActions>
    </Box>
  );
}

function AddMaintenanceContent({ vehicleId, onClose }: { vehicleId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const types = useMaintenanceTypes();
  const mechanics = useMechanics();

  const create = useMutation({
    mutationFn: (values: MaintenanceRecordWrite) =>
      apiClient.post('/v1/maintenance-records/', values),
    onSuccess: () => {
      // History, search results by maintenance and the due list can all change.
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-due'] });
      notify('Maintenance added');
      onClose();
    },
  });

  const loadError = types.error ?? mechanics.error;
  if (loadError) {
    return (
      <DialogContent>
        <ErrorAlert
          error={loadError}
          onRetry={() => {
            types.refetch();
            mechanics.refetch();
          }}
        />
      </DialogContent>
    );
  }
  if (!types.data || !mechanics.data) return <PageSpinner />;

  return (
    <MaintenanceForm
      vehicleId={vehicleId}
      types={types.data}
      mechanics={mechanics.data}
      isPending={create.isPending}
      error={create.error}
      onSubmit={(values) => create.mutate(values)}
      onCancel={onClose}
    />
  );
}

/**
 * Dialog that adds a maintenance record to a vehicle.
 *
 * The content mounts only while the dialog is open, so types and mechanics load on first use and
 * each opening starts with a clean form.
 */
export default function AddMaintenanceDialog({
  vehicleId,
  open,
  onClose,
}: {
  vehicleId: number;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add maintenance</DialogTitle>
      <AddMaintenanceContent vehicleId={vehicleId} onClose={onClose} />
    </Dialog>
  );
}
