'use client';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

import StatusBadge from '@/components/StatusBadge';
import { useSnackbar } from '@/components/SnackbarProvider';
import { assignVehicle, getErrorMessage, getVehicleDetails, listOffices } from '@/lib/fleet-api';

type Props = {
  vehicleId: number | null;
  onClose: () => void;
};

export default function VehicleDetailDialog({ vehicleId, onClose }: Props) {
  const queryClient = useQueryClient();
  const { notify } = useSnackbar();
  const [officeId, setOfficeId] = useState<number | ''>('');
  const [assignError, setAssignError] = useState<string | null>(null);

  const detailsQuery = useQuery({
    queryKey: ['vehicle-details', vehicleId],
    queryFn: () => getVehicleDetails(vehicleId as number),
    enabled: vehicleId !== null,
  });

  const officesQuery = useQuery({
    queryKey: ['offices'],
    queryFn: listOffices,
    enabled: vehicleId !== null,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignVehicle(vehicleId as number, Number(officeId)),
    onSuccess: async () => {
      setAssignError(null);
      setOfficeId('');
      await queryClient.invalidateQueries({ queryKey: ['vehicle-details', vehicleId] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['needing-maintenance'] });
      notify('Vehicle reassigned', 'success');
    },
    onError: (error) => setAssignError(getErrorMessage(error)),
  });

  const vehicle = detailsQuery.data;

  const handleClose = () => {
    setOfficeId('');
    setAssignError(null);
    onClose();
  };

  return (
    <Dialog
      open={vehicleId !== null}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="vehicle-detail-title"
      slotProps={{
        container: {
          sx: {
            alignItems: 'flex-start',
            justifyContent: 'center',
            p: 0,
          },
        },
        paper: {
          sx: {
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: 'min(82vh, 640px)' },
            display: 'flex',
            flexDirection: 'column',
            m: 0,
            mx: 'auto',
            mt: 0,
            mb: 0,
            width: { xs: '100%', sm: 'calc(100% - 32px)' },
            borderRadius: { xs: 0, sm: '0 0 12px 12px' },
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 1.75, sm: 2 },
          pb: 1.25,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        {detailsQuery.isLoading ? (
          <Stack spacing={1.5} aria-busy="true" aria-label="Loading vehicle details">
            <Skeleton width="40%" height={24} />
            <Skeleton width="55%" height={18} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} />
              <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} />
              <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} />
            </Stack>
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={280} />
          </Stack>
        ) : null}

        {detailsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => detailsQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {getErrorMessage(detailsQuery.error)}
          </Alert>
        ) : null}

        {vehicle ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              flex: 1,
              minHeight: 0,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1.5}
              sx={{ flexShrink: 0 }}
            >
              <Box minWidth={0}>
                <Typography
                  id="vehicle-detail-title"
                  variant="overline"
                  component="p"
                  sx={{ mb: 0.25 }}
                >
                  Vehicle details
                </Typography>
                <Typography variant="h3" component="h2" noWrap>
                  {vehicle.make} {vehicle.model}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Model year {vehicle.year}
                </Typography>
              </Box>
              <StatusBadge active={vehicle.is_active} />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                alignItems: 'start',
                flexShrink: 0,
              }}
            >
              <MetaTile label="VIN" value={vehicle.vin} mono />
              <MetaTile label="License plate" value={vehicle.license_plate} />
              <MetaTile
                label="Office"
                value={
                  vehicle.office.city && vehicle.office.city !== vehicle.office.name
                    ? `${vehicle.office.name}, ${vehicle.office.city}`
                    : vehicle.office.name
                }
                icon={<BusinessOutlinedIcon fontSize="small" color="action" />}
              />
            </Box>

            <Box
              sx={{
                px: 1.75,
                py: 1.25,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#F8FAFC',
                flexShrink: 0,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <SwapHorizOutlinedIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" color="text.primary" fontWeight={700}>
                  Reassign office
                </Typography>
              </Stack>
              {assignError ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {assignError}
                </Alert>
              ) : null}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                alignItems={{ sm: 'center' }}
              >
                <TextField
                  select
                  size="small"
                  label="New office"
                  value={officeId}
                  onChange={(e) => setOfficeId(Number(e.target.value))}
                  sx={{ minWidth: { sm: 220 }, flex: 1 }}
                  helperText={`Currently at ${vehicle.office.name}`}
                >
                  {(officesQuery.data ?? [])
                    .filter((office) => office.id !== vehicle.office.id)
                    .map((office) => (
                      <MenuItem key={office.id} value={office.id}>
                        {office.name} — {office.city}
                      </MenuItem>
                    ))}
                </TextField>
                <Button
                  variant="contained"
                  disabled={!officeId || assignMutation.isPending}
                  onClick={() => assignMutation.mutate()}
                  sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, mb: { sm: 2.5 } }}
                >
                  {assignMutation.isPending ? 'Moving…' : 'Move vehicle'}
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                flex: 1,
                minHeight: 0,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ flexShrink: 0 }}
              >
                <Typography variant="subtitle1">Maintenance history</Typography>
                <Typography variant="caption">
                  {vehicle.maintenance_history.length} record
                  {vehicle.maintenance_history.length === 1 ? '' : 's'} · newest first
                </Typography>
              </Stack>

              {vehicle.maintenance_history.length === 0 ? (
                <Alert severity="info">No maintenance records for this vehicle yet.</Alert>
              ) : (
                <TableContainer
                  sx={{
                    flex: '1 1 auto',
                    minHeight: { xs: 180, sm: 200 },
                    maxHeight: { xs: 200, sm: 220 },
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '& .MuiTableCell-root': {
                      py: 0.75,
                    },
                  }}
                >
                  <Table size="small" stickyHeader aria-label="Maintenance history">
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
                      {vehicle.maintenance_history.map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="mono" variant="body2">
                              {record.maintenance_date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {record.maintenance_type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{record.mechanic.name}</Typography>
                            <Typography variant="caption" className="mono" display="block">
                              {record.mechanic.certification_number}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography className="mono" variant="body2" fontWeight={600}>
                              $
                              {Number(record.cost).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              title={record.notes || undefined}
                            >
                              {record.notes || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{ px: 2.5, py: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MetaTile({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#FFFFFF',
        minWidth: 0,
        height: 'fit-content',
        alignSelf: 'start',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {icon}
        <Typography
          component="span"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        className={mono ? 'mono' : undefined}
        component="div"
        variant="body2"
        fontWeight={500}
        sx={{ wordBreak: 'break-all', lineHeight: 1.35 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
