'use client';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorAlert, PageSpinner } from '@/components/query-state';
import StatusChip from '@/components/status-chip';
import { useNotify } from '@/app/providers';
import { apiClient } from '@/lib/api-client';
import { getErrorStatus, parseApiError } from '@/lib/api-errors';
import { MONO_FONT, formatCost, formatDate } from '@/lib/format';
import type { VehicleDetail } from '@/lib/types';
import AddMaintenanceDialog from './maintenance-form';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography component="div">{children}</Typography>
    </Grid>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const vehicle = useQuery({
    queryKey: ['vehicles', 'detail', id],
    queryFn: async () => (await apiClient.get<VehicleDetail>(`/v1/vehicles/${id}/`)).data,
  });

  const remove = useMutation({
    mutationFn: () => apiClient.delete(`/v1/vehicles/${id}/`),
    onSuccess: () => {
      // Leave the page first so the removed detail query is not refetched into a 404.
      router.replace('/vehicles');
      queryClient.removeQueries({ queryKey: ['vehicles', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-due'] });
      notify('Vehicle deleted');
    },
  });

  if (vehicle.isPending) return <PageSpinner />;

  if (vehicle.isError) {
    return getErrorStatus(vehicle.error) === 404 ? (
      <EmptyState
        title="Vehicle not found"
        description="It may have been deleted."
        action={
          <Button component={Link} href="/vehicles">
            Back to vehicles
          </Button>
        }
      />
    ) : (
      <ErrorAlert error={vehicle.error} onRetry={() => vehicle.refetch()} />
    );
  }

  const data = vehicle.data;
  const records = data.maintenance_records;
  const totalCents = records.reduce(
    (sum, record) => sum + Math.round(Number(record.cost) * 100),
    0,
  );

  return (
    <>
      <PageHeader
        back={{ href: '/vehicles', label: 'Vehicles' }}
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <span>
              {data.make.name} {data.model.name}
            </span>
            <StatusChip active={data.active} />
          </Stack>
        }
        subtitle={`${data.license_plate} · ${data.year}`}
        actions={
          <>
            <Button variant="outlined" component={Link} href={`/vehicles/${id}/edit`}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Field label="License plate">{data.license_plate}</Field>
          <Field label="VIN">
            <Box component="span" sx={{ fontFamily: MONO_FONT }}>
              {data.vin}
            </Box>
          </Field>
          <Field label="Year">{data.year}</Field>
          <Field label="Office">
            {data.office.name}
            <Typography variant="body2" color="text.secondary">
              {data.office.city}
            </Typography>
          </Field>
        </Grid>
      </Paper>

      <Paper variant="outlined">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Maintenance history
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {records.length === 0
                ? 'Full history, loaded with the vehicle in one request.'
                : `${records.length} ${records.length === 1 ? 'record' : 'records'} · ` +
                  `${formatCost(totalCents / 100)} total · full history, loaded with the vehicle in one request.`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setAddOpen(true)}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
          >
            Add maintenance
          </Button>
        </Stack>
        {records.length === 0 ? (
          <EmptyState title="No maintenance recorded for this vehicle." />
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Mechanic</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(record.performed_on)}
                    </TableCell>
                    <TableCell>{record.type.name}</TableCell>
                    <TableCell>
                      {record.mechanic.name}
                      <Typography variant="body2" color="text.secondary">
                        Cert. {record.mechanic.certification_number}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCost(record.cost)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{record.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <AddMaintenanceDialog vehicleId={data.id} open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog open={confirmOpen} onClose={() => !remove.isPending && setConfirmOpen(false)}>
        <DialogTitle>Delete {data.license_plate}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This also deletes its {records.length} maintenance{' '}
            {records.length === 1 ? 'record' : 'records'}. To keep the history, edit the vehicle and
            mark it inactive instead.
          </DialogContentText>
          {remove.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {parseApiError(remove.error).message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={remove.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => remove.mutate()}
            loading={remove.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
