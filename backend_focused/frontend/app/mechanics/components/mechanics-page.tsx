'use client';

import { Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { ListPagination } from '@/components/list-pagination';
import { MascotButton } from '@/components/mascot/mascot-button';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { useMechanicPage } from '../hooks/use-mechanic-page';
import { MechanicDetailsDialog } from './mechanic-details-dialog';
import { MechanicFilters } from './mechanic-filters';
import { MechanicFormDialog } from './mechanic-form-dialog';
import { MechanicsTable } from './mechanics-table';

export function MechanicsPage() {
  const state = useMechanicPage();
  const { mechanics } = state;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Mechanics"
        navigation={<SectionTabs />}
        description="Manage mechanic profiles, certifications, and availability."
        action={<MascotButton onClick={() => state.setEditing(null)}>Add mechanic</MascotButton>}
      />
      <MechanicFilters search={state.search} />
      <QueryState
        isPending={mechanics.isPending}
        isError={mechanics.isError}
        error={mechanics.error}
        onRetry={() => mechanics.refetch()}
      />
      {mechanics.isError && state.page > 1 && (
        <Button onClick={() => state.setPage(1)} sx={{ alignSelf: 'flex-start' }}>
          Back to first page
        </Button>
      )}
      {mechanics.data && !mechanics.isError && (
        <Card>
          {mechanics.isFetching && <LinearProgress aria-label="Refreshing mechanics" />}
          {mechanics.data.results?.length ? (
            <>
              <MechanicsTable
                mechanics={mechanics.data.results}
                onView={state.setViewing}
                onEdit={state.setEditing}
                onDelete={state.requestDelete}
              />
              <ListPagination
                page={state.page}
                count={mechanics.data.count ?? 0}
                onPageChange={state.setPage}
              />
            </>
          ) : (
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="h6">
                  {state.search.hasFilters
                    ? 'No mechanics match these filters'
                    : 'No mechanics yet'}
                </Typography>
                <Typography color="text.secondary">
                  {state.search.hasFilters
                    ? 'Try another search or status, or clear the filters to see all mechanics.'
                    : 'Add a mechanic before recording maintenance.'}
                </Typography>
                {state.search.hasFilters ? (
                  <Button onClick={state.search.reset}>Clear filters</Button>
                ) : (
                  <Button onClick={() => state.setEditing(null)}>Add mechanic</Button>
                )}
              </Stack>
            </CardContent>
          )}
        </Card>
      )}
      {state.editing !== undefined && (
        <MechanicFormDialog
          key={state.editing?.id ?? 'new'}
          mechanic={state.editing}
          onClose={() => state.setEditing(undefined)}
          onSaved={state.onSaved}
        />
      )}
      {state.viewing && (
        <MechanicDetailsDialog
          mechanic={state.viewing}
          onClose={() => state.setViewing(null)}
          onEdit={() => {
            state.setEditing(state.viewing);
            state.setViewing(null);
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={Boolean(state.deleting)}
        title="Delete mechanic?"
        description={`Delete ${state.deleting?.name ?? 'this mechanic'}? Mechanics linked to maintenance records cannot be deleted.`}
        isPending={state.deletion.isPending}
        error={state.deletion.error}
        onClose={() => state.setDeleting(null)}
        onConfirm={state.confirmDelete}
      />
    </Stack>
  );
}
