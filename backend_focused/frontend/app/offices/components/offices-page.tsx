'use client';

import { Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { ListPagination } from '@/components/list-pagination';
import { MascotButton } from '@/components/mascot/mascot-button';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { useOfficePage } from '../hooks/use-office-page';
import { OfficeDetailsDialog } from './office-details-dialog';
import { OfficeFilters } from './office-filters';
import { OfficeFormDialog } from './office-form-dialog';
import { OfficesTable } from './offices-table';

export function OfficesPage() {
  const state = useOfficePage();
  const { offices } = state;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Offices"
        navigation={<SectionTabs />}
        description="Manage the locations that organize your fleet."
        action={<MascotButton onClick={() => state.setEditing(null)}>Add office</MascotButton>}
      />
      <OfficeFilters search={state.search} />
      <QueryState
        isPending={offices.isPending}
        isError={offices.isError}
        error={offices.error}
        onRetry={() => offices.refetch()}
      />
      {offices.isError && state.page > 1 && (
        <Button onClick={() => state.setPage(1)} sx={{ alignSelf: 'flex-start' }}>
          Back to first page
        </Button>
      )}
      {offices.data && !offices.isError && (
        <Card>
          {offices.isFetching && <LinearProgress aria-label="Refreshing offices" />}
          {offices.data.results?.length ? (
            <>
              <OfficesTable
                offices={offices.data.results}
                onView={state.setViewing}
                onEdit={state.setEditing}
                onDelete={state.requestDelete}
              />
              <ListPagination
                page={state.page}
                count={offices.data.count ?? 0}
                onPageChange={state.setPage}
              />
            </>
          ) : (
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="h6">
                  {state.search.hasFilters ? 'No offices match these filters' : 'No offices yet'}
                </Typography>
                <Typography color="text.secondary">
                  {state.search.hasFilters
                    ? 'Try another name or city, or clear the filters to see all offices.'
                    : 'Create your first office before adding vehicles.'}
                </Typography>
                {state.search.hasFilters ? (
                  <Button onClick={state.search.reset}>Clear filters</Button>
                ) : (
                  <Button onClick={() => state.setEditing(null)}>Add office</Button>
                )}
              </Stack>
            </CardContent>
          )}
        </Card>
      )}
      {state.editing !== undefined && (
        <OfficeFormDialog
          key={state.editing?.id ?? 'new'}
          office={state.editing}
          onClose={() => state.setEditing(undefined)}
          onSaved={state.onSaved}
        />
      )}
      {state.viewing && (
        <OfficeDetailsDialog
          office={state.viewing}
          onClose={() => state.setViewing(null)}
          onEdit={() => {
            state.setEditing(state.viewing);
            state.setViewing(null);
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={Boolean(state.deleting)}
        title="Delete office?"
        description={`Delete ${state.deleting?.name ?? 'this office'}? Offices with assigned vehicles cannot be deleted.`}
        isPending={state.deletion.isPending}
        error={state.deletion.error}
        onClose={() => state.setDeleting(null)}
        onConfirm={state.confirmDelete}
      />
    </Stack>
  );
}
