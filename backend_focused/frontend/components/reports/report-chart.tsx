'use client';

import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { QueryState } from '@/components/query-state';
import { formatCost } from '@/lib/format';

const BarChart = dynamic(() => import('@mui/x-charts/BarChart').then((module) => module.BarChart), {
  ssr: false,
  loading: () => <QueryState isPending isError={false} />,
});

type Props = {
  rows: { label: string; value: number }[];
  metricLabel: string;
  valueFormat?: 'count' | 'cost';
};

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact' });
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function ReportChart({ rows, metricLabel, valueFormat = 'count' }: Props) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('sm'));
  const formatValue =
    valueFormat === 'cost' ? formatCost : (value: number) => wholeNumber.format(value);
  const allZero = rows.every((row) => row.value === 0);
  const minimum = rows.reduce((value, row) => Math.min(value, row.value), 0);
  const maximum = rows.reduce((value, row) => Math.max(value, row.value), 0);
  const labelLimit = narrow ? 16 : 32;

  return (
    <Stack spacing={1}>
      <Typography variant="h6" component="h2">
        {metricLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Hover or focus the chart for exact values. Use List to view all fields.
      </Typography>
      {allZero && (
        <Typography variant="body2" color="text.secondary">
          All values are zero for this metric.
        </Typography>
      )}
      <Box
        component="section"
        aria-label={`${metricLabel} chart`}
        data-testid="report-chart"
        sx={{ minWidth: 0 }}
      >
        <BarChart
          title={`${metricLabel} chart`}
          desc="All records are included. Use the arrow keys to explore each value or switch to List for the full report."
          layout="horizontal"
          height={Math.max(300, rows.length * 36 + 70)}
          margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          yAxis={[
            {
              scaleType: 'band',
              // The API aggregates have no IDs; indices keep duplicate names as distinct bars.
              data: rows.map((_, index) => index),
              width: narrow ? 112 : 224,
              tickLabelInterval: () => true,
              valueFormatter: (index: number, context) => {
                const label = rows[index]?.label ?? '';
                return context.location === 'tick' && label.length > labelLimit
                  ? `${label.slice(0, labelLimit - 1)}…`
                  : label;
              },
            },
          ]}
          xAxis={[
            {
              // Cost totals may be signed; keep zero visible without clipping negative values.
              min: minimum,
              max: allZero ? 1 : maximum,
              tickMinStep: valueFormat === 'count' || allZero ? 1 : undefined,
              valueFormatter: (value: number) => compactNumber.format(value),
            },
          ]}
          series={[
            {
              id: 'report-values',
              data: rows.map((row) => row.value),
              label: metricLabel,
              color: theme.palette.primary.main,
              valueFormatter: (value) => (value === null ? '—' : formatValue(value)),
            },
          ]}
          grid={{ vertical: true }}
          hideLegend
          skipAnimation
        />
      </Box>
    </Stack>
  );
}
