'use client';

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorAlert, LoadingRows } from '@/components/query-state';
import StatusChip from '@/components/status-chip';
import { apiClient } from '@/lib/api-client';
import { getErrorStatus, parseApiError } from '@/lib/api-errors';
import { MONO_FONT } from '@/lib/format';
import { useOffices, useVehicleMakes, useVehicleModels } from '@/lib/lookups';
import { PAGE_SIZE, type Paginated, type Vehicle } from '@/lib/types';
import {
  EMPTY_FILTERS,
  VEHICLE_FILTER_KEYS,
  type VehicleFilters,
  type VehicleSearch,
  hasActiveFilters,
  parseVehicleSearch,
  toSearchParams,
} from '@/lib/vehicle-search';
import VehicleFiltersForm from './vehicle-filters';

const FILTER_FIELDS = Object.fromEntries(VEHICLE_FILTER_KEYS.map((key) => [key, key]));
const COLUMNS = 7;

export default function VehiclesView() {
  const router = useRouter();
  const search = parseVehicleSearch(useSearchParams());
  const queryString = toSearchParams(search).toString();
  const filtersKey = toSearchParams({ filters: search.filters, page: 1 }).toString();
  const offices = useOffices();
  const makes = useVehicleMakes();
  const models = useVehicleModels();

  const vehicles = useQuery({
    queryKey: ['vehicles', 'list', queryString],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<Vehicle>>('/v1/vehicles/', {
          params: new URLSearchParams(queryString),
        })
      ).data,
    placeholderData: keepPreviousData,
  });

  // Every search is a history entry, so browser back/forward walks through previous searches.
  function navigate(next: VehicleSearch) {
    const query = toSearchParams(next).toString();
    router.push(query ? `/vehicles?${query}` : '/vehicles', { scroll: false });
  }

  const clearFilters = () => navigate({ filters: EMPTY_FILTERS, page: 1 });
  const pageMissing = getErrorStatus(vehicles.error) === 404;
  const filterErrors = pageMissing ? {} : parseApiError(vehicles.error, FILTER_FIELDS).fieldErrors;
  const data = vehicles.data;
  const filtered = hasActiveFilters(search.filters);

  return (
    <>
      <PageHeader
        title="Vehicles"
        subtitle={data ? `${data.count} ${data.count === 1 ? 'vehicle' : 'vehicles'}` : undefined}
        actions={
          <Button variant="contained" component={Link} href="/vehicles/new">
            New vehicle
          </Button>
        }
      />

      <VehicleFiltersForm
        key={filtersKey}
        initial={search.filters}
        offices={offices.data}
        officesFailed={offices.isError}
        makes={makes.data}
        models={models.data}
        catalogFailed={makes.isError || models.isError}
        errors={filterErrors}
        onSearch={(filters: VehicleFilters) => navigate({ filters, page: 1 })}
        onClear={clearFilters}
      />

      {pageMissing ? (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate({ ...search, page: 1 })}>
              Go to first page
            </Button>
          }
        >
          This page does not exist.
        </Alert>
      ) : (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert
            error={vehicles.error}
            fields={FILTER_FIELDS}
            onRetry={() => vehicles.refetch()}
          />
        </Box>
      )}

      {(data || vehicles.isPending) && (
        <Paper variant="outlined">
          <Box sx={{ height: 4 }}>{vehicles.isFetching && data && <LinearProgress />}</Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>License plate</TableCell>
                  <TableCell>VIN</TableCell>
                  <TableCell>Make / model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!data && <LoadingRows columns={COLUMNS} />}
                {data?.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS}>
                      {filtered ? (
                        <EmptyState
                          title="No vehicles match these filters"
                          action={<Button onClick={clearFilters}>Clear filters</Button>}
                        />
                      ) : (
                        <EmptyState
                          title="No vehicles yet"
                          action={
                            <Button component={Link} href="/vehicles/new">
                              New vehicle
                            </Button>
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {data?.results.map((vehicle) => (
                  <TableRow key={vehicle.id} hover>
                    <TableCell>
                      <MuiLink component={Link} href={`/vehicles/${vehicle.id}`} fontWeight={500}>
                        {vehicle.license_plate}
                      </MuiLink>
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT }}>{vehicle.vin}</TableCell>
                    <TableCell>
                      {vehicle.make.name} {vehicle.model.name}
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.office.name}</TableCell>
                    <TableCell>
                      <StatusChip active={vehicle.active} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" component={Link} href={`/vehicles/${vehicle.id}`}>
                        View
                      </Button>
                      <Button size="small" component={Link} href={`/vehicles/${vehicle.id}/edit`}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data && data.count > 0 && (
            <TablePagination
              component="div"
              count={data.count}
              page={search.page - 1}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[]}
              onPageChange={(_, page) => navigate({ ...search, page: page + 1 })}
            />
          )}
        </Paper>
      )}
    </>
  );
}
