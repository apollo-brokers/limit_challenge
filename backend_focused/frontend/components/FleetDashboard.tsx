'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import VehicleDetailDialog from '@/components/VehicleDetailDialog';
import VehicleFormDialog from '@/components/VehicleFormDialog';
import { useSnackbar } from '@/components/SnackbarProvider';
import {
  deleteVehicle,
  getErrorMessage,
  listOffices,
  searchVehicles,
  vehiclesNeedingMaintenance,
} from '@/lib/fleet-api';
import type { Vehicle } from '@/lib/types';

type TabKey = 'search' | 'due';

function useVehicleSearchParams() {
  const searchParams = useSearchParams();
  return useMemo(
    () => ({
      office: searchParams.get('office') ?? '',
      active: searchParams.get('active') ?? '',
      make: searchParams.get('make') ?? '',
      model: searchParams.get('model') ?? '',
      maintained_from: searchParams.get('maintained_from') ?? '',
      maintained_to: searchParams.get('maintained_to') ?? '',
      mechanic_certification: searchParams.get('mechanic_certification') ?? '',
      page: searchParams.get('page') ?? '1',
      tab: (searchParams.get('tab') as TabKey) || 'search',
    }),
    [searchParams],
  );
}

function activeFilterCount(draft: Record<string, string>) {
  return Object.values(draft).filter(Boolean).length;
}

function VehicleActions({
  vehicle,
  onDetails,
  onEdit,
  onDelete,
  deleting,
  compact = true,
}: {
  vehicle: Vehicle;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  compact?: boolean;
}) {
  if (!compact) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" color="inherit" onClick={onDetails}>
          Details
        </Button>
        <Button size="small" variant="outlined" color="inherit" onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" color="error" disabled={deleting} onClick={onDelete}>
          Delete
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="View details">
        <IconButton
          size="small"
          aria-label={`View details for ${vehicle.make} ${vehicle.model}`}
          onClick={onDetails}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit vehicle">
        <IconButton
          size="small"
          aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
          onClick={onEdit}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete vehicle">
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
          disabled={deleting}
          onClick={onDelete}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function VehicleMobileCard({
  vehicle,
  showLastMaintenance,
  onDetails,
  onEdit,
  onDelete,
  deleting,
}: {
  vehicle: Vehicle;
  showLastMaintenance: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2.5,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { borderColor: 'primary.light', boxShadow: 2 },
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box minWidth={0}>
            <Typography variant="subtitle1" noWrap>
              {vehicle.make} {vehicle.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.year}
            </Typography>
          </Box>
          <StatusBadge active={vehicle.is_active} />
        </Stack>

        <Box>
          <Typography variant="caption" component="div">
            VIN
          </Typography>
          <Typography className="mono" variant="body2" sx={{ wordBreak: 'break-all' }}>
            {vehicle.vin}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Plate {vehicle.license_plate}
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {vehicle.office.name}
            </Typography>
            <Typography variant="caption">{vehicle.office.city}</Typography>
          </Box>
          {showLastMaintenance ? (
            <Chip
              size="small"
              icon={<WarningAmberOutlinedIcon />}
              label={vehicle.last_maintenance ?? 'Never serviced'}
              sx={{ bgcolor: 'warning.light', color: 'warning.dark', border: '1px solid #FCD34D' }}
            />
          ) : null}
        </Stack>

        <VehicleActions
          vehicle={vehicle}
          compact={false}
          onDetails={onDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deleting}
        />
      </Stack>
    </Paper>
  );
}

export default function FleetDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const filters = useVehicleSearchParams();
  const queryClient = useQueryClient();
  const { notify } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [draft, setDraft] = useState({
    office: filters.office,
    active: filters.active,
    make: filters.make,
    model: filters.model,
    maintained_from: filters.maintained_from,
    maintained_to: filters.maintained_to,
    mechanic_certification: filters.mechanic_certification,
  });
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const officesQuery = useQuery({
    queryKey: ['offices'],
    queryFn: listOffices,
  });

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'search', filters],
    queryFn: () =>
      searchVehicles({
        office: filters.office || undefined,
        active: filters.active || undefined,
        make: filters.make || undefined,
        model: filters.model || undefined,
        maintained_from: filters.maintained_from || undefined,
        maintained_to: filters.maintained_to || undefined,
        mechanic_certification: filters.mechanic_certification || undefined,
        page: filters.page,
        page_size: '10',
      }),
    enabled: filters.tab === 'search',
  });

  const dueQuery = useQuery({
    queryKey: ['needing-maintenance', filters.page],
    queryFn: () => vehiclesNeedingMaintenance(filters.page),
    enabled: filters.tab === 'due',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['needing-maintenance'] });
      notify('Vehicle deleted', 'success');
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });

  const updateUrl = (next: Record<string, string>, replace = false) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const url = params.toString() ? `${pathname}?${params}` : pathname;
    if (replace) router.replace(url);
    else router.push(url);
  };

  const applyFilters = () => {
    updateUrl({
      tab: 'search',
      page: '1',
      ...draft,
    });
  };

  const clearFilters = () => {
    const empty = {
      office: '',
      active: '',
      make: '',
      model: '',
      maintained_from: '',
      maintained_to: '',
      mechanic_certification: '',
    };
    setDraft(empty);
    updateUrl({ tab: 'search', page: '1' });
  };

  const activeList = filters.tab === 'search' ? vehiclesQuery : dueQuery;
  const rows = activeList.data?.results ?? [];
  const count = activeList.data?.count ?? 0;
  const pageIndex = Math.max(Number(filters.page || '1') - 1, 0);
  const rowsPerPage = filters.tab === 'due' ? 20 : 10;
  const draftFilterCount = activeFilterCount(draft);
  const appliedFilterCount = activeFilterCount({
    office: filters.office,
    active: filters.active,
    make: filters.make,
    model: filters.model,
    maintained_from: filters.maintained_from,
    maintained_to: filters.maintained_to,
    mechanic_certification: filters.mechanic_certification,
  });

  const handleDelete = (vehicle: Vehicle) => {
    if (
      window.confirm(
        `Delete ${vehicle.make} ${vehicle.model} (${vehicle.vin})? This cannot be undone.`,
      )
    ) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  return (
    <AppShell
      activeTab={filters.tab}
      resultCount={activeList.isSuccess ? count : undefined}
      onNavigate={(tab) => {
        if (tab === 'search') {
          updateUrl({ ...filters, tab: 'search', page: '1' });
        } else {
          updateUrl({ tab: 'due', page: '1' });
        }
      }}
    >
      <Box
        sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3.5 }, maxWidth: 1280, mx: 'auto' }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            spacing={2}
          >
            <Box>
              <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>
                {filters.tab === 'search' ? 'Fleet directory' : 'Maintenance queue'}
              </Typography>
              <Typography variant="h1" component="h1">
                {filters.tab === 'search' ? 'Vehicles' : 'Needs maintenance'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 520 }}>
                {filters.tab === 'search'
                  ? 'Search the fleet with filters synced to the URL. Open a vehicle for full history and office assignment.'
                  : 'Active vehicles never serviced, or last serviced more than 365 days ago — oldest need first.'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, whiteSpace: 'nowrap' }}
            >
              Add vehicle
            </Button>
          </Stack>

          {filters.tab === 'search' ? (
            <Paper sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2.5,
                  py: 1.75,
                  borderBottom: filtersOpen ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <FilterListIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1">Filters</Typography>
                  {appliedFilterCount > 0 ? (
                    <Chip
                      size="small"
                      label={`${appliedFilterCount} applied`}
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption">Synced to query params</Typography>
                  )}
                </Stack>
                <Button
                  size="small"
                  onClick={() => setFiltersOpen((v) => !v)}
                  aria-expanded={filtersOpen}
                >
                  {filtersOpen ? 'Hide' : 'Show'}
                </Button>
              </Stack>

              <Collapse in={filtersOpen}>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                  }}
                  sx={{ p: 2.5 }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                          md: 'repeat(4, minmax(0, 1fr))',
                        },
                      }}
                    >
                      <TextField
                        select
                        label="Office"
                        value={draft.office}
                        onChange={(e) => setDraft((prev) => ({ ...prev, office: e.target.value }))}
                      >
                        <MenuItem value="">Any office</MenuItem>
                        {(officesQuery.data ?? []).map((office) => (
                          <MenuItem key={office.id} value={String(office.id)}>
                            {office.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        label="Status"
                        value={draft.active}
                        onChange={(e) => setDraft((prev) => ({ ...prev, active: e.target.value }))}
                      >
                        <MenuItem value="">Any status</MenuItem>
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                      </TextField>
                      <TextField
                        label="Make"
                        placeholder="e.g. Toyota"
                        value={draft.make}
                        onChange={(e) => setDraft((prev) => ({ ...prev, make: e.target.value }))}
                      />
                      <TextField
                        label="Model"
                        placeholder="e.g. Camry"
                        value={draft.model}
                        onChange={(e) => setDraft((prev) => ({ ...prev, model: e.target.value }))}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                          md: '1fr 1fr 1.35fr',
                        },
                      }}
                    >
                      <TextField
                        label="Maintained from"
                        type="date"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={draft.maintained_from}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, maintained_from: e.target.value }))
                        }
                      />
                      <TextField
                        label="Maintained to"
                        type="date"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={draft.maintained_to}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, maintained_to: e.target.value }))
                        }
                      />
                      <TextField
                        label="Mechanic certification #"
                        placeholder="CERT-1001"
                        value={draft.mechanic_certification}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            mechanic_certification: e.target.value,
                          }))
                        }
                      />
                    </Box>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="text"
                        color="inherit"
                        onClick={clearFilters}
                        disabled={!draftFilterCount && !appliedFilterCount}
                      >
                        Clear all
                      </Button>
                      <Button type="submit" variant="contained">
                        Apply filters
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          ) : (
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ alignItems: 'center' }}>
              Showing active vehicles with no service history, or last service older than 365 days.
              Never-serviced vehicles appear first.
            </Alert>
          )}

          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
              sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="subtitle1">
                {activeList.isLoading
                  ? 'Loading…'
                  : `${count.toLocaleString()} result${count === 1 ? '' : 's'}`}
              </Typography>
              {filters.tab === 'search' && appliedFilterCount > 0 ? (
                <Typography variant="caption">Filtered view</Typography>
              ) : null}
            </Stack>

            {activeList.isLoading ? (
              <TableSkeleton columns={filters.tab === 'due' ? 6 : 5} />
            ) : null}

            {activeList.isError ? (
              <Box p={3}>
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => activeList.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  {getErrorMessage(activeList.error)}
                </Alert>
              </Box>
            ) : null}

            {!activeList.isLoading && !activeList.isError && rows.length === 0 ? (
              <EmptyState
                icon={
                  filters.tab === 'search' ? (
                    <SearchOffOutlinedIcon />
                  ) : (
                    <WarningAmberOutlinedIcon />
                  )
                }
                title={
                  filters.tab === 'search'
                    ? 'No vehicles match these filters'
                    : 'Nothing due right now'
                }
                description={
                  filters.tab === 'search'
                    ? 'Try clearing filters or broadening make, model, and maintenance date range.'
                    : 'All active vehicles have recent maintenance within the last year.'
                }
                actionLabel={filters.tab === 'search' ? 'Clear filters' : 'Add vehicle'}
                onAction={
                  filters.tab === 'search'
                    ? clearFilters
                    : () => {
                        setEditing(null);
                        setFormOpen(true);
                      }
                }
              />
            ) : null}

            {!activeList.isLoading && !activeList.isError && rows.length > 0 ? (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {rows.map((vehicle) => (
                      <VehicleMobileCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        showLastMaintenance={filters.tab === 'due'}
                        onDetails={() => setDetailId(vehicle.id)}
                        onEdit={() => {
                          setEditing(vehicle);
                          setFormOpen(true);
                        }}
                        onDelete={() => handleDelete(vehicle)}
                        deleting={deleteMutation.isPending}
                      />
                    ))}
                  </Stack>
                ) : (
                  <TableContainer>
                    <Table
                      aria-label={
                        filters.tab === 'search'
                          ? 'Vehicle search results'
                          : 'Vehicles needing maintenance'
                      }
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Vehicle</TableCell>
                          <TableCell>VIN / Plate</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>Status</TableCell>
                          {filters.tab === 'due' ? <TableCell>Last maintenance</TableCell> : null}
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((vehicle) => (
                          <TableRow key={vehicle.id} hover>
                            <TableCell>
                              <Typography fontWeight={700}>
                                {vehicle.make} {vehicle.model}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.year}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography className="mono" variant="body2">
                                {vehicle.vin}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.license_plate}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {vehicle.office.name}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {vehicle.office.city}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusBadge active={vehicle.is_active} />
                            </TableCell>
                            {filters.tab === 'due' ? (
                              <TableCell>
                                {vehicle.last_maintenance ? (
                                  <Typography variant="body2">
                                    {vehicle.last_maintenance}
                                  </Typography>
                                ) : (
                                  <Chip
                                    size="small"
                                    label="Never"
                                    sx={{
                                      bgcolor: 'warning.light',
                                      color: 'warning.dark',
                                      border: '1px solid #FCD34D',
                                    }}
                                  />
                                )}
                              </TableCell>
                            ) : null}
                            <TableCell align="right">
                              <VehicleActions
                                vehicle={vehicle}
                                onDetails={() => setDetailId(vehicle.id)}
                                onEdit={() => {
                                  setEditing(vehicle);
                                  setFormOpen(true);
                                }}
                                onDelete={() => handleDelete(vehicle)}
                                deleting={deleteMutation.isPending}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <TablePagination
                  component="div"
                  count={count}
                  page={pageIndex}
                  onPageChange={(_, newPage) =>
                    updateUrl({
                      ...(filters.tab === 'search' ? filters : { tab: 'due' }),
                      tab: filters.tab,
                      page: String(newPage + 1),
                    })
                  }
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[rowsPerPage]}
                  sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1 }}
                />
              </>
            ) : null}
          </Paper>
        </Stack>
      </Box>

      <VehicleFormDialog
        open={formOpen}
        vehicle={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={(mode) =>
          notify(mode === 'create' ? 'Vehicle created' : 'Vehicle updated', 'success')
        }
      />
      <VehicleDetailDialog vehicleId={detailId} onClose={() => setDetailId(null)} />
    </AppShell>
  );
}
