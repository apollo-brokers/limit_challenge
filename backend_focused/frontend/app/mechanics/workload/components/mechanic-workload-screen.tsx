'use client';

import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/components/page-header';
import { SectionTabs } from '@/components/navigation/section-tabs';
import { QueryState } from '@/components/query-state';
import { ReportChart } from '@/components/reports/report-chart';
import { ReportControls } from '@/components/reports/report-controls';
import { useMechanicWorkload } from '@/hooks/api/use-mechanics';
import { useReportDisplay } from '@/hooks/use-report-display';
import { MechanicWorkloadTable } from './mechanic-workload-table';

export function MechanicWorkloadScreen() {
  const workload = useMechanicWorkload();
  const display = useReportDisplay();
  const metricLabel = display.metric === 'count' ? 'Maintenance records' : 'Total cost';

  return (
    <>
      <PageHeader
        title="Mechanics"
        navigation={<SectionTabs />}
        description="Maintenance records and total service cost across all mechanics in the current calendar year."
      />
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <ReportControls {...display} countLabel="Maintenance records" costLabel="Total cost" />
          <QueryState
            isPending={workload.isPending}
            isError={workload.isError}
            error={workload.error}
            onRetry={() => workload.refetch()}
          />
          {workload.isFetching && !workload.isPending && (
            <LinearProgress aria-label="Refreshing mechanic workload" />
          )}
          {workload.isSuccess &&
            (workload.data.length === 0 ? (
              <Typography color="text.secondary">Add a mechanic to see their workload.</Typography>
            ) : display.view === 'list' ? (
              <MechanicWorkloadTable mechanics={workload.data} />
            ) : (
              <ReportChart
                rows={workload.data.map((mechanic) => ({
                  label: mechanic.name,
                  value:
                    display.metric === 'count'
                      ? mechanic.maintenance_count
                      : Number(mechanic.total_maintenance_cost),
                }))}
                metricLabel={metricLabel}
                valueFormat={display.metric}
              />
            ))}
        </Stack>
      </Paper>
    </>
  );
}
