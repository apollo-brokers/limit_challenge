'use client';

import React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography, Chip, useTheme } from '@mui/material';
import Link from 'next/link';
import { UseQueryResult } from '@tanstack/react-query';

import { getStatusColor, getStatusLabel, getPriorityColor } from '@/lib/utils/submission-utils';
import { formatDateTime } from '@/lib/utils/date-utils';
// import { SubmissionsPagination } from '../SubmissionsPagination';
import { PaginatedResponse, SubmissionListItem } from '@/lib/types';
import { Button } from '@mui/material';
// import { ApiErrorState } from '../ApiErrorState';
import { SubmissionCardSkeleton } from '../ui/skeletons';
import { ApiErrorState, SubmissionsPagination } from '../ui';
// import { SubmissionCardSkeleton } from '../SubmissionCardSkeleton';

interface SubmissionsListProps {
  page: string;
  submissionsQuery: UseQueryResult<PaginatedResponse<SubmissionListItem>, Error>;
  submissionQueryData: PaginatedResponse<SubmissionListItem> | undefined;
  updateFilter: (key: string, value: string) => void;
}

function SubmissionsListComponent({
  page,
  submissionsQuery,
  submissionQueryData,
  updateFilter,
}: SubmissionsListProps) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: { xs: 'auto', md: 'calc(100vh - 130px)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          overflowY: { xs: 'visible', md: 'auto' },
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography variant="h6">
              Submission list ({submissionQueryData?.count ?? 0})
            </Typography>
            <SubmissionsPagination
              page={page}
              totalCount={submissionQueryData?.count}
              hasPrevious={!!submissionQueryData?.previous}
              hasNext={!!submissionQueryData?.next}
              onPreviousClick={() => updateFilter('page', String(Number(page) - 1))}
              onNextClick={() => updateFilter('page', String(Number(page) + 1))}
              onPageClick={(pageNumber) => updateFilter('page', String(pageNumber))}
            />
          </Stack>

          <Divider />

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 1,
            }}
          >
            <Stack spacing={2}>
              {/* Loading */}
              {(submissionsQuery.isLoading || submissionsQuery.isFetching) && (
                <SubmissionCardSkeleton />
              )}

              {/* Error */}
              {submissionsQuery.error && <ApiErrorState entityName="submissions" />}

              {/* Empty */}
              {!submissionsQuery.isLoading && (submissionQueryData?.results?.length ?? 0) === 0 && (
                <Typography>No submissions found</Typography>
              )}

              {/* List */}
              {!submissionsQuery.isLoading &&
                submissionQueryData?.results?.map((item, index) => (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? theme?.submissionColorMappings?.alternatingRowBackground
                          : 'transparent',
                    }}
                  >
                    <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
                      <Stack spacing={1}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                          spacing={{ xs: 1, sm: 2 }}
                        >
                          <Box flex={1}>
                            <Typography
                              variant="h6"
                              sx={{
                                wordBreak: 'break-word',
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                fontWeight: 600,
                              }}
                            >
                              {item.company.legalName}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '.9rem' },
                                wordBreak: 'break-word',
                                mt: 0.5,
                                color: 'text.secondary',
                              }}
                            >
                              {item.summary}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                color: 'text.secondary',
                                mt: 1,
                              }}
                            >
                              Created: {formatDateTime(item.createdAt)}
                            </Typography>
                          </Box>

                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                Status:
                              </Typography>
                              <Chip
                                label={getStatusLabel(item.status)}
                                color={getStatusColor(
                                  item.status,
                                  theme.submissionColorMappings.status,
                                )}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                Priority:
                              </Typography>
                              <Chip
                                label={item.priority.toUpperCase()}
                                color={getPriorityColor(
                                  item.priority,
                                  theme.submissionColorMappings.priority,
                                )}
                                size="small"
                              />
                            </Box>
                          </Stack>
                        </Stack>

                        <Divider />

                        <Box sx={{ display: { xs: 'block', sm: 'inline' } }}>
                          <Typography component="span" color="text.secondary" variant="body2">
                            Broker:{' '}
                          </Typography>
                          <Typography component="span" variant="body2">
                            {item.broker.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'block', sm: 'inline' } }}>
                          <Typography component="span" color="text.secondary" variant="body2">
                            Owner:{' '}
                          </Typography>
                          <Typography component="span" variant="body2">
                            {item.owner.fullName}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography component="span" color="text.secondary" variant="body2">
                            Number of Document(s):{' '}
                          </Typography>
                          <Typography component="span" variant="body2">
                            {item.documentCount}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography component="span" color="text.secondary" variant="body2">
                            Number of Notes(s):{' '}
                          </Typography>
                          <Typography component="span" variant="body2">
                            {item.noteCount}
                          </Typography>
                        </Box>

                        {item.latestNote && (
                          <Box>
                            <Typography component="span" color="text.secondary" variant="body2">
                              Latest Note:{' '}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ fontStyle: 'italic' }}
                            >
                              {item.latestNote.bodyPreview}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Link href={`/submissions/${item.id}`}>
                            <Button size="small">View Details →</Button>
                          </Link>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export const SubmissionsList = React.memo(SubmissionsListComponent);
