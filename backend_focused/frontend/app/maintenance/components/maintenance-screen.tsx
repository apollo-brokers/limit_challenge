'use client';

import { Alert, Button, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { ListPagination } from '@/components/list-pagination';
import { MascotButton } from '@/components/mascot/mascot-button';
import { PageHeader } from '@/components/page-header';
import { QueryState } from '@/components/query-state';
import { useMaintenancePage } from '../hooks/use-maintenance-page';
import { MaintenanceDetailDialog } from './maintenance-detail-dialog';
import { MaintenanceFormDialog } from './maintenance-form-dialog';
import { MaintenanceFilters } from './maintenance-filters';
import { MaintenanceTable } from './maintenance-table';

export function MaintenanceScreen() {
  const state = useMaintenancePage();
  const { records, vehicles, mechanics } = state;
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Record completed work and keep your fleet’s service history up to date."
        action={<MascotButton onClick={() => state.setEditing(null)}>Add maintenance</MascotButton>}
      />
      <Stack spacing={2}>
        <MaintenanceFilters search={state.search} />
        <QueryState
          isPending={records.isPending}
          isError={records.isError}
          error={records.error}
          onRetry={() => records.refetch()}
        />
        {records.isError && state.page > 1 && (
          <Button onClick={() => state.setPage(1)}>Return to first page</Button>
        )}
        {(vehicles.isError || mechanics.isError) && (
          <Alert
            severity="warning"
            action={
              <Button
                onClick={() => {
                  void vehicles.refetch();
                  void mechanics.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Some vehicle or mechanic names could not be loaded. Record IDs are shown instead.
          </Alert>
        )}
        {records.isFetching && !records.isPending && (
          <LinearProgress aria-label="Refreshing maintenance records" />
        )}
        {records.isSuccess &&
          (!records.data.results?.length ? (
            <Paper variant="outlined" sx={{ p: 4 }}>
              <Typography variant="h2">
                {state.search.hasFilters
                  ? 'No maintenance matches these filters'
                  : 'No maintenance recorded'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {state.search.hasFilters
                  ? 'Try another search or clear the filters to see all records.'
                  : 'Add the first service to start tracking maintenance history.'}
              </Typography>
              {state.search.hasFilters && (
                <Button onClick={state.search.reset} sx={{ mt: 1 }}>
                  Show all records
                </Button>
              )}
            </Paper>
          ) : (
            <MaintenanceTable
              records={records.data.results}
              vehicles={vehicles.data ?? []}
              mechanics={mechanics.data ?? []}
              onView={state.setViewing}
              onEdit={state.setEditing}
              onDelete={state.requestDelete}
            />
          ))}
        {records.isSuccess && (
          <ListPagination
            page={state.page}
            count={records.data.count ?? 0}
            onPageChange={state.setPage}
          />
        )}
      </Stack>
      {state.editing !== undefined && (
        <MaintenanceFormDialog
          key={state.editing?.id ?? 'new'}
          record={state.editing}
          onClose={() => state.setEditing(undefined)}
          onSaved={state.onSaved}
        />
      )}
      {state.viewing && (
        <MaintenanceDetailDialog
          record={state.viewing}
          vehicle={vehicles.data?.find((vehicle) => vehicle.id === state.viewing?.vehicle)}
          mechanic={mechanics.data?.find((mechanic) => mechanic.id === state.viewing?.mechanic)}
          onClose={() => state.setViewing(null)}
          onEdit={() => {
            state.setEditing(state.viewing);
            state.setViewing(null);
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={!!state.deleting}
        title="Delete maintenance record?"
        isPending={state.deletion.isPending}
        error={state.deletion.error}
        onClose={() => state.setDeleting(null)}
        onConfirm={state.confirmDelete}
      />
    </>
  );
}
