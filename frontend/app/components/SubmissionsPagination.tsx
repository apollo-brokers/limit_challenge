import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface SubmissionsPaginationProps {
  page: string;
  totalCount: number | undefined;
  hasPrevious: boolean;
  hasNext: boolean;
  onPreviousClick: () => void;
  onNextClick: () => void;
  onPageClick: (pageNumber: number) => void;
}

export function SubmissionsPagination({
  page,
  totalCount,
  hasPrevious,
  hasNext,
  onPreviousClick,
  onNextClick,
  onPageClick,
}: SubmissionsPaginationProps) {
  const currentPage = Number(page);
  const itemsPerPage = 10; // Backend default page size
  const totalPages = Math.ceil((totalCount ?? 0) / itemsPerPage);
  const [goToPageInput, setGoToPageInput] = useState('');

  const handleGoToPage = () => {
    const pageNum = Number(goToPageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageClick(pageNum);
      setGoToPageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  // Generate page numbers to display (max 5 pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <Button disabled={!hasPrevious} onClick={onPreviousClick} size="small">
          Previous
        </Button>

        {pageNumbers.map((pageNum, idx) =>
          pageNum === '...' ? (
            <Typography key={`dots-${idx}`} sx={{ px: 0.5 }}>
              ...
            </Typography>
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

      <Box display="flex" alignItems="center" gap={1} ml={2}>
        <Typography variant="body2" color="text.secondary">
          Go to
        </Typography>

        <TextField
          type="number"
          size="small"
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          inputProps={{ min: 1, max: totalPages }}
          sx={{ width: 70 }}
        />

        <Typography variant="body2" color="text.secondary">
          / {totalPages}
        </Typography>

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
