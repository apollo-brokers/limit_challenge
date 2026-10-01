import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { OfficeSummary } from '@/lib/api/types';
import { formatCost, formatDate } from '@/lib/format';

export function OfficeSummaryTable({ offices }: { offices: OfficeSummary[] }) {
  return (
    <TableContainer>
      <Table size="small" aria-label="Office fleet summary" sx={{ minWidth: 620 }}>
        <TableHead>
          <TableRow>
            <TableCell>Office</TableCell>
            <TableCell>City</TableCell>
            <TableCell align="right">Active vehicles</TableCell>
            <TableCell align="right">Maintenance cost</TableCell>
            <TableCell>Last service</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offices.map((office, index) => (
            <TableRow key={index}>
              <TableCell>{office.name}</TableCell>
              <TableCell>{office.city}</TableCell>
              <TableCell align="right">{office.active_vehicle_count}</TableCell>
              <TableCell align="right">{formatCost(office.maintenance_cost_last_year)}</TableCell>
              <TableCell>{formatDate(office.last_maintenance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
