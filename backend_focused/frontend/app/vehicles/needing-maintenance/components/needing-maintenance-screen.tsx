'use client';

import Link from 'next/link';
import {
  Alert,
  Button,
  Chip,
  LinearProgress,
  Link as MuiLink,
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
import { ListPagination } from '@/components/list-pagination';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { useOfficeOptions } from '@/hooks/api/use-offices';
import { useVehiclesNeedingMaintenance } from '@/hooks/api/use-vehicles';
import { usePageParam } from '@/hooks/use-page-param';
import { formatDate } from '@/lib/format';

export function NeedingMaintenanceScreen() {
  const { page, setPage } = usePageParam();
  const query = useVehiclesNeedingMaintenance(page);
  const offices = useOfficeOptions();
  const officeNames = new Map((offices.data ?? []).map((office) => [office.id, office.name]));
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Vehicles"
        navigation={<SectionTabs />}
        description="Active vehicles with no recorded maintenance, or whose last maintenance was more than 365 days ago."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
      />
      {query.isError && page > 1 && (
        <Button onClick={() => setPage(1)}>Return to first page</Button>
      )}
      {query.isFetching && !query.isPending && (
        <LinearProgress aria-label="Refreshing vehicles needing maintenance" />
      )}
      {query.isSuccess && (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {query.data.count} vehicles need attention
          </Typography>
          {query.data.results.length ? (
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="Vehicles needing maintenance" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>License plate</TableCell>
                    <TableCell>Office</TableCell>
                    <TableCell>Last maintenance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {query.data.results.map((vehicle) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        <MuiLink component={Link} href={`/vehicles/${vehicle.id}`} fontWeight={600}>
                          {vehicle.make} {vehicle.model}
                        </MuiLink>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.year} · {vehicle.vin}
                        </Typography>
                      </TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell>
                        {officeNames.get(vehicle.office) ?? `Office #${vehicle.office}`}
                      </TableCell>
                      <TableCell>
                        {vehicle.last_maintenance ? (
                          formatDate(vehicle.last_maintenance)
                        ) : (
                          <Chip
                            label="No maintenance"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">No active vehicles currently need maintenance.</Alert>
          )}
          <ListPagination page={page} count={query.data.count} onPageChange={setPage} />
        </Stack>
      )}
    </Stack>
  );
}
