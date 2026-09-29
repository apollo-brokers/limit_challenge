'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Alert,
  Button,
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
import type { VehicleDetail } from '@/lib/api/types';
import { formatCost, formatDate } from '@/lib/format';

export function MaintenanceHistory({
  records,
  vehicleId,
}: {
  records: VehicleDetail['maintenance_records'];
  vehicleId: number;
}) {
  const sorted = useMemo(
    () =>
      [...records].sort(
        (a, b) => b.maintenance_date.localeCompare(a.maintenance_date) || b.id - a.id,
      ),
    [records],
  );
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
        alignItems={{ sm: 'center' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6">Maintenance history</Typography>
          <Typography variant="body2" color="text.secondary">
            {records.length} records · complete history · newest first
          </Typography>
        </Stack>
        <Button component={Link} href={`/maintenance?vehicle=${vehicleId}`} variant="outlined">
          Manage maintenance
        </Button>
      </Stack>
      {!records.length ? (
        <Alert severity="info">No maintenance has been recorded for this vehicle yet.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Vehicle maintenance history" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Mechanic</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((record) => (
                <TableRow key={record.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(record.maintenance_date)}
                  </TableCell>
                  <TableCell>{record.maintenance_type}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.mechanic.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.mechanic.certification_number}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatCost(record.cost)}</TableCell>
                  <TableCell
                    sx={{ maxWidth: 320, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {record.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
