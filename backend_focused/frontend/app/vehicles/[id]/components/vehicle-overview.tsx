import { Grid, Paper, Stack, Typography } from '@mui/material';
import { StatusChip } from '@/components/status-chip';
import type { VehicleDetail } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

export function VehicleOverview({ vehicle }: { vehicle: VehicleDetail }) {
  const fields = [
    { label: 'License plate', value: vehicle.license_plate },
    { label: 'VIN', value: vehicle.vin },
    { label: 'Year', value: vehicle.year },
    { label: 'Added', value: formatDate(vehicle.created_at) },
  ];
  return (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Vehicle details</Typography>
          <StatusChip active={vehicle.active ?? true} />
        </Stack>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid key={field.label} size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {field.label}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
}
