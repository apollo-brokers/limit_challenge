'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createVehicle,
  duplicateCheck,
  getErrorMessage,
  listOffices,
  updateVehicle,
} from '@/lib/fleet-api';
import type { Vehicle, VehicleWritePayload } from '@/lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  onSuccess?: (mode: 'create' | 'edit') => void;
};

function buildInitialForm(
  vehicle: Vehicle | null | undefined,
  defaultOfficeId: number,
): VehicleWritePayload {
  if (vehicle) {
    return {
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      office_id: vehicle.office.id,
      is_active: vehicle.is_active,
    };
  }
  return {
    vin: '',
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    office_id: defaultOfficeId,
    is_active: true,
  };
}

function VehicleFormBody({
  vehicle,
  onClose,
  defaultOfficeId,
  onSuccess,
}: {
  vehicle?: Vehicle | null;
  onClose: () => void;
  defaultOfficeId: number;
  onSuccess?: (mode: 'create' | 'edit') => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(vehicle);
  const [form, setForm] = useState<VehicleWritePayload>(() =>
    buildInitialForm(vehicle, defaultOfficeId),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const officesQuery = useQuery({
    queryKey: ['offices'],
    queryFn: listOffices,
  });

  const mutation = useMutation({
    mutationFn: async (payload: VehicleWritePayload) => {
      const check = await duplicateCheck({
        vin: payload.vin,
        license_plate: payload.license_plate,
        exclude_id: vehicle?.id,
        is_active: payload.is_active,
      });
      if (check.conflicts.length) {
        setConflicts(check.conflicts);
        throw new Error(`Conflict on: ${check.conflicts.join(', ')}. Choose unique values.`);
      }
      setConflicts([]);
      if (vehicle) {
        return updateVehicle(vehicle.id, payload);
      }
      return createVehicle(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['needing-maintenance'] });
      onSuccess?.(isEdit ? 'edit' : 'create');
      onClose();
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!form.office_id) {
      setFormError('Select an office.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          {formError ? <Alert severity="error">{formError}</Alert> : null}
          {conflicts.length ? (
            <Alert severity="warning">
              Conflicting fields: {conflicts.map((c) => c.replace('_', ' ')).join(', ')}
            </Alert>
          ) : null}

          <Box>
            <Typography variant="overline" component="p" sx={{ mb: 1.25 }}>
              Identification
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="VIN"
                required
                autoFocus={!isEdit}
                helperText={
                  conflicts.includes('vin')
                    ? 'This VIN is already registered'
                    : '11–17 characters, unique across the fleet'
                }
                value={form.vin}
                onChange={(e) => setForm((prev) => ({ ...prev, vin: e.target.value }))}
                error={conflicts.includes('vin')}
                slotProps={{ htmlInput: { className: 'mono' } }}
              />
              <TextField
                label="License plate"
                required
                helperText={
                  conflicts.includes('license_plate')
                    ? 'Plate is used by another active vehicle'
                    : 'Must be unique among active vehicles'
                }
                value={form.license_plate}
                onChange={(e) => setForm((prev) => ({ ...prev, license_plate: e.target.value }))}
                error={conflicts.includes('license_plate')}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" component="p" sx={{ mb: 1.25 }}>
              Vehicle details
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Make"
                  required
                  fullWidth
                  value={form.make}
                  onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))}
                />
                <TextField
                  label="Model"
                  required
                  fullWidth
                  value={form.model}
                  onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Year"
                  type="number"
                  required
                  fullWidth
                  value={form.year}
                  onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  slotProps={{ htmlInput: { min: 1980, max: 2100 } }}
                />
                <TextField
                  select
                  label="Office"
                  required
                  fullWidth
                  value={form.office_id || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, office_id: Number(e.target.value) }))
                  }
                  disabled={officesQuery.isLoading}
                >
                  {(officesQuery.data ?? []).map((office) => (
                    <MenuItem key={office.id} value={office.id}>
                      {office.name} — {office.city}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#F8FAFC',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Active in fleet
                  </Typography>
                  <Typography variant="caption" display="block">
                    Inactive vehicles can free a license plate for reuse
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: '100%', justifyContent: 'space-between', ml: 0 }}
              labelPlacement="start"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button onClick={onClose} disabled={mutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <CircularProgress size={18} color="inherit" />
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create vehicle'
          )}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function VehicleFormDialog({ open, onClose, vehicle, onSuccess }: Props) {
  const officesQuery = useQuery({
    queryKey: ['offices'],
    queryFn: listOffices,
  });
  const defaultOfficeId = officesQuery.data?.[0]?.id ?? 0;

  return (
    <Dialog
      open={open}
      onClose={mutationSafeClose(onClose)}
      fullWidth
      maxWidth="sm"
      aria-labelledby="vehicle-form-title"
    >
      <DialogTitle id="vehicle-form-title">
        {vehicle ? 'Edit vehicle' : 'Add vehicle'}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
          {vehicle
            ? 'Update identification, assignment, and active status.'
            : 'Register a vehicle with VIN, plate, and office assignment.'}
        </Typography>
      </DialogTitle>
      {open ? (
        <VehicleFormBody
          key={vehicle ? `edit-${vehicle.id}` : `create-${defaultOfficeId}`}
          vehicle={vehicle}
          onClose={onClose}
          defaultOfficeId={defaultOfficeId}
          onSuccess={onSuccess}
        />
      ) : null}
    </Dialog>
  );
}

function mutationSafeClose(onClose: () => void) {
  return (_: unknown, reason?: string) => {
    if (reason === 'backdropClick') return;
    onClose();
  };
}
