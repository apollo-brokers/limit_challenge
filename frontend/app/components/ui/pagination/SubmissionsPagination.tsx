import { Box, Button, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { PAGINATION } from '@/lib/constants/pagination';

interface SubmissionsPaginationProps {
  page: string;
  totalCount?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPreviousClick: () => void;
  onNextClick: () => void;
  onPageClick: (pageNumber: number) => void;
}

export function SubmissionsPaginationComponent({
  page,
  totalCount,
  hasPrevious,
  hasNext,
  onPreviousClick,
  onNextClick,
  onPageClick,
}: SubmissionsPaginationProps) {
  const currentPage = Number(page);
  const itemsPerPage = PAGINATION.PAGE_SIZE;
  const totalPages = Math.ceil((totalCount ?? 0) / itemsPerPage);

  const [goToPageInput, setGoToPageInput] = useState<string>('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoToPage = () => {
    const pageNum = Number(goToPageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageClick(pageNum);
      setGoToPageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGoToPage();
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = isMobile ? 3 : 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= maxPagesToShow; i++) pages.push(i);
        pages.push('...');
      } else if (currentPage >= totalPages - 1) {
        pages.push('...');
        for (let i = totalPages - (maxPagesToShow - 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      gap={2}
      mt={2}
    >
      {/* Pagination Buttons */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={1} flexWrap="wrap">
        <Button disabled={!hasPrevious} onClick={onPreviousClick} size="small">
          Prev
        </Button>

        {pageNumbers.map((pageNum, idx) =>
          pageNum === '...' ? (
            <Typography key={`dots-${idx}`}>...</Typography>
          ) : (
            <Button
              key={pageNum}
              onClick={() => onPageClick(pageNum as number)}
              variant={currentPage === pageNum ? 'contained' : 'outlined'}
              size="small"
              sx={{ minWidth: 32 }}
            >
              {pageNum}
            </Button>
          ),
        )}

        <Button disabled={!hasNext} onClick={onNextClick} size="small">
          Next
        </Button>
      </Box>

      {/* Go To Page */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
        sx={{
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {!isMobile && (
          <Typography variant="body2" color="text.secondary">
            Go to
          </Typography>
        )}

        <TextField
          type="number"
          size="small"
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          inputProps={{ min: 1, max: totalPages }}
          sx={{
            width: { xs: '80px', sm: '70px' },
          }}
        />

        {!isMobile && (
          <Typography variant="body2" color="text.secondary">
            / {totalPages}
          </Typography>
        )}

        <Button
          disabled={Number(goToPageInput) > totalPages || Number(goToPageInput) < 1}
          onClick={handleGoToPage}
          size="small"
          variant="contained"
        >
          Go
        </Button>
      </Box>
    </Box>
  );
}

export const SubmissionsPagination = React.memo(SubmissionsPaginationComponent);
