'use client';

import { Pagination, Stack, Typography } from '@mui/material';

export function ListPagination({
  page,
  count,
  onPageChange,
}: {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
}) {
  const pageSize = 10;
  return (
    <Stack
      data-testid="list-pagination"
      direction={{ xs: 'column', sm: 'row' }}
      gap={2}
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        {count
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, count)} of ${count}`
          : '0 records'}
      </Typography>
      {count > pageSize && (
        <Pagination
          count={Math.ceil(count / pageSize)}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          size="small"
        />
      )}
    </Stack>
  );
}
