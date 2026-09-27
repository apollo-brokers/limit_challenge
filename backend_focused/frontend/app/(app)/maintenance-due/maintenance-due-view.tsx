'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
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
  Typography,
} from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { EmptyState, ErrorAlert, LoadingRows } from '@/components/query-state';
import { apiClient } from '@/lib/api-client';
import { getErrorStatus } from '@/lib/api-errors';
import { daysSince, formatDate } from '@/lib/format';
import { type MaintenanceDueVehicle, PAGE_SIZE, type Paginated } from '@/lib/types';
import { parsePage } from '@/lib/vehicle-search';

const COLUMNS = 5;

function LastMaintenance({ date }: { date: string | null }) {
  if (!date) return <Chip size="small" color="warning" label="Never" />;
  return (
    <>
      {formatDate(date)}
      <Typography variant="body2" color="text.secondary">
        {daysSince(date)} days ago
      </Typography>
    </>
  );
}

export default function MaintenanceDueView() {
  const router = useRouter();
  const page = parsePage(useSearchParams().get('page'));

  const due = useQuery({
    queryKey: ['maintenance-due', page],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<MaintenanceDueVehicle>>('/v1/vehicles/maintenance-due/', {
          params: { page },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

  function goToPage(next: number) {
    router.push(next > 1 ? `/maintenance-due?page=${next}` : '/maintenance-due', {
      scroll: false,
    });
  }

  const data = due.data;

  return (
    <>
      <PageHeader
        title="Maintenance due"
        subtitle="Active vehicles never serviced or last serviced more than 365 days ago, most overdue first."
      />

      {getErrorStatus(due.error) === 404 ? (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => goToPage(1)}>
              Go to first page
            </Button>
          }
        >
          This page does not exist.
        </Alert>
      ) : (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert error={due.error} onRetry={() => due.refetch()} />
        </Box>
      )}

      {(data || due.isPending) && (
        <Paper variant="outlined">
          <Box sx={{ height: 4 }}>{due.isFetching && data && <LinearProgress />}</Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>License plate</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Last maintenance</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!data && <LoadingRows columns={COLUMNS} />}
                {data?.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS}>
                      <EmptyState
                        title="All active vehicles are up to date."
                        description="No active vehicle is missing maintenance for more than 365 days."
                      />
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
                    <TableCell>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </TableCell>
                    <TableCell>{vehicle.office.name}</TableCell>
                    <TableCell>
                      <LastMaintenance date={vehicle.last_maintenance} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" component={Link} href={`/vehicles/${vehicle.id}`}>
                        View
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
              page={page - 1}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[]}
              onPageChange={(_, next) => goToPage(next + 1)}
            />
          )}
        </Paper>
      )}
    </>
  );
}
