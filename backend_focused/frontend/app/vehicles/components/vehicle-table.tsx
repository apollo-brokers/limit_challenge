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
import { StatusChip } from '@/components/status-chip';
import type { Office, Vehicle } from '@/lib/api/types';

type Props = {
  vehicles: Vehicle[];
  offices: Office[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

export function VehicleTable({ vehicles, offices, onEdit, onDelete }: Props) {
  const officeNames = new Map(offices.map((office) => [office.id, office.name]));
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Vehicles" sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Vehicle</TableCell>
            <TableCell>License plate</TableCell>
            <TableCell>Office</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} hover>
              <TableCell>
                <MuiLink component={Link} href={`/vehicles/${vehicle.id}`} fontWeight={600}>
                  {vehicle.make} {vehicle.model}
                </MuiLink>
                <Typography variant="body2" color="text.secondary">
                  {vehicle.year} · {vehicle.vin}
                </Typography>
              </TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>
                {officeNames.get(vehicle.office) ?? `Office #${vehicle.office}`}
              </TableCell>
              <TableCell>
                <StatusChip active={vehicle.active ?? true} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => onEdit(vehicle)}
                    aria-label={`Edit ${vehicle.license_plate}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(vehicle)}
                    aria-label={`Delete ${vehicle.license_plate}`}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
