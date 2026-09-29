'use client';

import Link from 'next/link';
import {
  Button,
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
import type { MaintenanceRecord, Mechanic, Vehicle } from '@/lib/api/types';
import { formatCost, formatDate } from '@/lib/format';

export function MaintenanceTable({
  records,
  vehicles,
  mechanics,
  onView,
  onEdit,
  onDelete,
}: {
  records: MaintenanceRecord[];
  vehicles: Vehicle[];
  mechanics: Mechanic[];
  onView: (record: MaintenanceRecord) => void;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (record: MaintenanceRecord) => void;
}) {
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const mechanicById = new Map(mechanics.map((mechanic) => [mechanic.id, mechanic]));
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Maintenance records" sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Vehicle</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Mechanic</TableCell>
            <TableCell align="right">Cost</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => {
            const vehicle = vehicleById.get(record.vehicle);
            return (
              <TableRow key={record.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatDate(record.maintenance_date)}
                </TableCell>
                <TableCell>
                  <MuiLink component={Link} href={`/vehicles/${record.vehicle}`}>
                    {vehicle?.license_plate ?? `Vehicle #${record.vehicle}`}
                  </MuiLink>
                  {vehicle && (
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.make} {vehicle.model}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{record.maintenance_type}</TableCell>
                <TableCell>
                  {mechanicById.get(record.mechanic)?.name ?? `Mechanic #${record.mechanic}`}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCost(record.cost)}
                </TableCell>
                <TableCell>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button size="small" onClick={() => onView(record)}>
                      View
                    </Button>
                    <Button size="small" onClick={() => onEdit(record)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => onDelete(record)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
