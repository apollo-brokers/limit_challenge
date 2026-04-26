type StatusColorMapping = {
  new: 'info';
  in_review: 'warning';
  closed: 'success';
  lost: 'error';
};

type PriorityColorMapping = {
  high: 'error';
  medium: 'warning';
  low: 'success';
};

export type SubmissionColorMappings = {
  status: StatusColorMapping;
  priority: PriorityColorMapping;
  alternatingRowBackground: string;
};

export const SUBMISSION_COLOR_MAPPINGS: SubmissionColorMappings = {
  status: {
    new: 'info',
    in_review: 'warning',
    closed: 'success',
    lost: 'error',
  },
  priority: {
    high: 'error',
    medium: 'warning',
    low: 'success',
  },
  alternatingRowBackground: 'rgba(15, 98, 254, 0.05)',
};

declare module '@mui/material/styles' {
  interface Theme {
    submissionColorMappings: SubmissionColorMappings;
    heroGradient: string;
  }
  interface ThemeOptions {
    submissionColorMappings?: SubmissionColorMappings;
    heroGradient?: string;
  }
}
