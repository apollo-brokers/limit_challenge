# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

Viewsets, serializers, and base filters are in place but intentionally minimal so you can refine
the query behavior and filtering logic.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.

## Environment Variables

- Frontend requests default to `http://localhost:8000/api`. Override this by creating
  `frontend/.env.local` and setting `NEXT_PUBLIC_API_BASE_URL`.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions  # optional but recommended
# add --force to rebuild the generated sample data
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # create if you want a custom API base
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000/submissions` to start building.

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.

---

## Solution Summary

### Approach

**Backend** — `SubmissionFilterSet` (`backend/submissions/filters/submission.py`) was extended beyond
the starter `status` filter to support `brokerId` (exact match on FK id), `companySearch` (case
insensitive match across company legal name, industry, and headquarters city via `Q` objects), and the
optional extras `createdFrom`/`createdTo` (date range on `created_at`, with `createdTo` treated as
inclusive of the whole day when only a date is supplied) and `hasDocuments`/`hasNotes` (boolean filters
against the annotated `document_count`/`note_count` used for the list view). `SubmissionViewSet.get_queryset`
adds `select_related` for `broker`/`company`/`owner` on both list and detail actions and
`prefetch_related` for `contacts`/`documents`/`notes` on detail, to avoid N+1 queries. The `BrokerViewSet`
disables pagination so the frontend dropdown can consume a flat array.

**Frontend** — All three React Query hooks (`useSubmissionsList`, `useSubmissionDetail`,
`useBrokerOptions`) were enabled and wired to real endpoints. The `/submissions` list page keeps filter
state in React state, debounces the company search input (400ms), and syncs every filter plus the current
page to the URL query string via `useSearchParams`/`router.replace`, so views are shareable/bookmarkable
and survive a refresh. Results render in an MUI table with status/priority chips, document/note counts,
a latest-note preview, and page-based pagination driven by the API's `count`/page-size. A collapsible
"More filters" section exposes the optional `createdFrom`/`createdTo` date range and `hasDocuments`/
`hasNotes` tri-state selects. Loading, error (with retry), and empty states are handled by a shared
`QueryFeedback` component reused on both the list and detail pages. The `/submissions/[id]` detail page
renders the summary, a contacts table, a documents list (linking to `fileUrl`), and a notes timeline.

### Tradeoffs & Assumptions

- **Company search** matches legal name, industry, *and* city in one field rather than three separate
  inputs, favoring a simpler UX over precision; a real product might offer per-field search or a
  typeahead.
- **Date filters** use native HTML `<input type="date">` fields instead of pulling in
  `@mui/x-date-pickers` as a new dependency, keeping the bundle smaller at a small cost to visual
  polish.
- **Pagination** is page-number based (matching DRF's default `PageNumberPagination`) rather than
  cursor-based, which is simpler but can shift results slightly if records are created between page
  loads.
- **Broker pagination was disabled** entirely rather than teaching the frontend to page through broker
  results, since the dataset is small and a dropdown needs the full list anyway.
- **No authentication** was added (per the optional bonus section) since the challenge scope is a
  single internal workspace view.

### Stretch Goals Implemented

- Optional filters `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes` (backend + frontend UI).
- Filter state fully synced to the URL (not just wired to the query function).
- Debounced company search to avoid firing a request per keystroke.
- Query-level optimizations (`select_related`/`prefetch_related`) to avoid N+1s on list/detail.
- Targeted backend tests (`backend/submissions/tests.py`) covering every filter, the detail payload
  shape, 404 handling, and the unpaginated brokers endpoint.
- Shared, reusable UI primitives (`StatusChip`, `PriorityChip`, `QueryFeedback`) instead of one-off
  markup per page.

### How to Run

See [Getting Started](#getting-started) above. In short:

```bash
# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions --force
python manage.py test submissions   # optional: run the test suite
python manage.py runserver 0.0.0.0:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev   # if Turbopack crashes on your machine, use: npx next dev --webpack
```

Then visit `http://localhost:3000/submissions`.
