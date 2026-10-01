import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { MechanicWorkload } from '@/lib/api/types';
import { formatCost } from '@/lib/format';

export function MechanicWorkloadTable({ mechanics }: { mechanics: MechanicWorkload[] }) {
  return (
    <TableContainer>
      <Table size="small" aria-label="Mechanic workload" sx={{ minWidth: 440 }}>
        <TableHead>
          <TableRow>
            <TableCell>Mechanic</TableCell>
            <TableCell align="right">Maintenance records</TableCell>
            <TableCell align="right">Total cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mechanics.map((mechanic, index) => (
            <TableRow key={index}>
              <TableCell>{mechanic.name}</TableCell>
              <TableCell align="right">{mechanic.maintenance_count}</TableCell>
              <TableCell align="right">{formatCost(mechanic.total_maintenance_cost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
