'use client';

import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { ReportMetric, ReportView } from '@/hooks/use-report-display';

type Props = {
  view: ReportView;
  setView: (view: ReportView) => void;
  metric: ReportMetric;
  setMetric: (metric: ReportMetric) => void;
  countLabel: string;
  costLabel: string;
};

export function ReportControls({ view, setView, metric, setMetric, countLabel, costLabel }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="flex-start">
      <ToggleButtonGroup
        exclusive
        color="primary"
        size="small"
        value={view}
        aria-label="Report view"
        onChange={(_, value: ReportView | null) => {
          if (value) setView(value);
        }}
      >
        <ToggleButton value="list">List</ToggleButton>
        <ToggleButton value="chart">Chart</ToggleButton>
      </ToggleButtonGroup>
      {view === 'chart' && (
        <ToggleButtonGroup
          exclusive
          color="primary"
          size="small"
          value={metric}
          aria-label="Chart metric"
          onChange={(_, value: ReportMetric | null) => {
            if (value) setMetric(value);
          }}
        >
          <ToggleButton value="count">{countLabel}</ToggleButton>
          <ToggleButton value="cost">{costLabel}</ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );
}
