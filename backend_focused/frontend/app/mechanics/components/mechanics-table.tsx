'use client';

import {
  Button,
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
import type { Mechanic } from '@/lib/api/types';

type Props = {
  mechanics: Mechanic[];
  onView: (mechanic: Mechanic) => void;
  onEdit: (mechanic: Mechanic) => void;
  onDelete: (mechanic: Mechanic) => void;
};

export function MechanicsTable({ mechanics, onView, onEdit, onDelete }: Props) {
  return (
    <TableContainer>
      <Table aria-label="Mechanics" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Mechanic</TableCell>
            <TableCell>Certification number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mechanics.map((mechanic) => (
            <TableRow key={mechanic.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight={600}>
                  {mechanic.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  #{mechanic.id}
                </Typography>
              </TableCell>
              <TableCell>{mechanic.certification_number}</TableCell>
              <TableCell>
                <StatusChip active={mechanic.active ?? true} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => onView(mechanic)}
                    aria-label={`View ${mechanic.name}`}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onEdit(mechanic)}
                    aria-label={`Edit ${mechanic.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(mechanic)}
                    aria-label={`Delete ${mechanic.name}`}
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
