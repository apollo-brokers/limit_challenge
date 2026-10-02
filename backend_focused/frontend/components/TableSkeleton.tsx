'use client';

import {
  Box,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

type Props = {
  rows?: number;
  columns?: number;
};

export default function TableSkeleton({ rows = 6, columns = 5 }: Props) {
  return (
    <Box aria-busy="true" aria-label="Loading vehicles">
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton width={80} height={14} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, row) => (
              <TableRow key={row}>
                {Array.from({ length: columns }).map((_, col) => (
                  <TableCell key={col}>
                    <Skeleton height={18} width={col === 0 ? '70%' : '55%'} />
                    {col < 2 ? <Skeleton height={12} width="40%" sx={{ mt: 0.75 }} /> : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, p: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Skeleton width="55%" height={20} />
            <Skeleton width="35%" height={14} sx={{ mt: 1 }} />
            <Skeleton width="70%" height={14} sx={{ mt: 1.5 }} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton variant="rounded" width={72} height={28} />
              <Skeleton variant="rounded" width={56} height={28} />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
