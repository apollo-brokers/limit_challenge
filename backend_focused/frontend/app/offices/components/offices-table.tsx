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
import type { Office } from '@/lib/api/types';

type Props = {
  offices: Office[];
  onView: (office: Office) => void;
  onEdit: (office: Office) => void;
  onDelete: (office: Office) => void;
};

export function OfficesTable({ offices, onView, onEdit, onDelete }: Props) {
  return (
    <TableContainer>
      <Table aria-label="Offices" sx={{ minWidth: 520 }}>
        <TableHead>
          <TableRow>
            <TableCell>Office</TableCell>
            <TableCell>City</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offices.map((office) => (
            <TableRow key={office.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight={600}>
                  {office.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  #{office.id}
                </Typography>
              </TableCell>
              <TableCell>{office.city}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => onView(office)}
                    aria-label={`View ${office.name}`}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onEdit(office)}
                    aria-label={`Edit ${office.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(office)}
                    aria-label={`Delete ${office.name}`}
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
