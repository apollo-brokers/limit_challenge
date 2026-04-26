# Frontend Solution Notes

## Folder Structure

```
frontend/
├── app/
│   ├── components/
│   │   ├── submissions/
│   │   │   ├── SubmissionsFilters.tsx      # Filter controls
│   │   │   ├── SubmissionsList.tsx         # Submission cards + pagination
│   │   │   └── index.ts                    # Barrel export
│   │   └── ui/
│   │       ├── pagination/
│   │       │   ├── SubmissionsPagination.tsx
│   │       │   └── index.ts
│   │       ├── errors/
│   │       │   ├── ApiErrorState.tsx
│   │       │   ├── ValidationErrorSnackbar.tsx
│   │       │   └── index.ts
│   │       ├── skeletons/
│   │       │   ├── SubmissionCardSkeleton.tsx
│   │       │   ├── SubmissionDetailSkeleton.tsx
│   │       │   └── index.ts
│   │       └── index.ts                    # UI barrel export
│   ├── submissions/
│   │   ├── page.tsx                        # List page (filters + submissions)
│   │   └── [id]/
│   │       └── page.tsx                    # Detail page
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── globals.css
│
├── lib/
│   ├── api-client.ts                       # Axios instance + helper functions
│   ├── types.ts                            # TypeScript interfaces (Broker, Submission, etc.)
│   ├── theme-types.ts                      # Theme color type definitions
│   ├── hooks/
│   │   ├── useSubmissions.ts               # React Query for fetching submissions
│   │   └── useBrokerOptions.ts             # React Query for broker autocomplete
│   ├── utils/
│   │   ├── date-utils.ts                   # formatDateTime() - US locale date formatting
│   │   └── submission-utils.ts             # Status/priority helpers & color mappings
│   ├── constants/
│   │   └── pagination.ts                   # PAGINATION.PAGE_SIZE constant
│
├── .env.local                              # Local config (NEXT_PUBLIC_API_BASE_URL)
├── .env.example                            # Config template
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Module Descriptions

### Components: Submissions Domain

**SubmissionsFilters.tsx**
- All filter controls: status dropdown, broker autocomplete, company search, date range pickers, checkboxes
- Date range validation with error snackbar
- Memoized to prevent unnecessary re-renders

**SubmissionsList.tsx**
- Renders paginated submission cards
- Shows company info, status/priority chips, created date
- Memoized for performance
- Handles loading/error/empty states

### Components: UI (Reusable)

**SubmissionsPagination.tsx**
- Previous/Next buttons, page numbers, "Go to page" input
- Form validation for page input
- useMemo for page calculation efficiency

**ValidationErrorSnackbar.tsx**
- Reusable error notification component
- Props: open, onClose, message, severity, autoHideDuration
- Configured with 4-second auto-hide at bottom-left

**ApiErrorState.tsx**
- Generic error display component

**Loading Skeletons**
- SubmissionCardSkeleton.tsx: Loading state for submission cards
- SubmissionDetailSkeleton.tsx: Loading state for detail page

### Pages

**submissions/page.tsx (List Page)**
- URL-based filter state management
- Integrates SubmissionsFilters + SubmissionsList
- Responsive grid layout: 300px sidebar (filters) + flexible content (list) on desktop, stacked on mobile

**submissions/[id]/page.tsx (Detail Page)**
- Displays submission details with null-safe access
- Hero header: 70% company info + 30% status/priority
- Shows contacts, documents, notes sections
- Semantic back button, secure external links

### Data Management

**lib/hooks/useSubmissions.ts**
- React Query hook for fetching paginated submissions
- Includes filtering by status, broker, company, date range, documents/notes

**lib/hooks/useBrokerOptions.ts**
- React Query hook for broker autocomplete

**lib/api-client.ts**
- Axios instance configured with base URL
- Helper functions for API calls

### Type Definitions

**lib/types.ts**
- TypeScript interfaces: Broker, Submission, SubmissionListItem, Contact, Document, Note, TeamMember, etc.

### Utilities

**lib/utils/date-utils.ts**
- `formatDateTime()` - Formats date as US locale string (e.g., "Apr 26, 2026")
- Centralized date formatting throughout app

**lib/utils/submission-utils.ts**
- `STATUS_OPTIONS` - Dropdown options for submission status filter
- `getStatusColor()` - Maps status to MUI color variant
- `getStatusLabel()` - Maps status value to display label
- `getPriorityColor()` - Maps priority to MUI color variant

**lib/constants/pagination.ts**
- `PAGINATION.PAGE_SIZE = 10` - Single source of truth for pagination config

### Configuration

**.env.local** (git-ignored)
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`

**.env.example** (committed)
- Template showing required environment variables
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`

## Key Features

- **State Management**: URL-driven filters (searchParams) + React Query caching
- **Performance**: React.memo on components, useMemo on calculations, 1000ms debounced search
- **Validation**: Date range validation, page input validation with error feedback
- **Null Safety**: Optional chaining (?.) and fallback values throughout
- **Layout**: Responsive grid (300px/flexible on lg+, stacked on smaller screens)
- **Consistency**: Centralized date formatting and pagination constants
