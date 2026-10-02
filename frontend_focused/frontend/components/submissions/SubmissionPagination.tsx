'use client';

import { Box, Pagination, Typography } from '@mui/material';

const PAGE_SIZE = 10;

interface SubmissionPaginationProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function SubmissionPagination({
  count,
  page,
  onPageChange,
}: SubmissionPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (count === 0) {
    return null;
  }

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, count);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
      sx={{ pt: 2, mt: 1, borderTop: 1, borderColor: 'divider' }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {start}–{end} of {count}
      </Typography>
      <Pagination
        color="primary"
        count={totalPages}
        page={page}
        onChange={(_event, nextPage) => onPageChange(nextPage)}
        siblingCount={1}
        boundaryCount={1}
      />
    </Box>
  );
}

export { PAGE_SIZE };
