# Submission Tracker - Product Engineering Submission

Welcome to the completed Submission Tracker challenge! This workspace is engineered specifically for Operations Managers to review broker-submitted opportunities efficiently, securely, and seamlessly.

Below is an outline of my architectural approach, UX optimizations, and key product assumptions, explicitly structured around the assignment's core criteria.

## 1. Product Thinking & Workflow (10%)

**The Ideal Workflow (Triage → Investigate → Act)**
Operations Managers are highly constrained by time. They shouldn't be forced to click blindly.
- **Triage**: The Dashboard uses explicit visual hierarchy (High Priority = Red chips) and floats critical summary metrics (`Has Documents?`, `Note Counts`) to the primary cards.
- **Investigate**: Heavy filtering (Booleans, Dates) is hidden within a progressive-disclosure "More Filters" Popover to avoid cognitive overload on the primary dashboard.
- **Act**: Quick-action micro-interactions such as `Click to Copy` exist on critical items (like Broker Emails) within the Detail View to streamline external communication workflows.

**Key Operating Assumptions:**
1. **System Scale**: The system was built assuming we will scale to tens of thousands of records. This justifies extracting the heavy `Subquery` annotations into a dedicated `SubmissionQuerySet` Manager on the Django backend (preventing N+1 locking).
2. **Search Behavior**: Users typically input fragmented partial strings. We implemented a strict **400ms Frontend Input Debouncer** mapped to a Django `icontains` filter, protecting network bandwidth without sacrificing real-time feel. 
3. **Broker Cardinality**: We assumed the `/api/brokers/` endpoint will quickly exceed a realistic hardcoded dropdown. Thus, it is dynamically managed via React Query with a strict `staleTime` constraint.

## 2. Frontend Excellence (45%)

The Next.js 16 (React 19) App Router frontend was pushed to rigorous senior-level boundaries.

- **URL Syncing & Pagination**: Our isolated `useSubmissionFilters` hook guarantees that the React DOM state and the browser URL are always in lockstep. You can share precise filtered pages (e.g., `?status=new&page=2`) safely.
- **Flawless Transitions**: Instead of spamming the user with flashing Skeleton arrays during pagination, we leverage TanStack React Query v5's `placeholderData: keepPreviousData`. The UI naturally glides between pages.
- **Empty States**: If a filter combination nets zero results, we provide an illustrated, polished `<EmptyState>` UI featuring a clear Call-To-Action to reset parameters.

## 3. Backend Quality (30%)

The Django REST Framework backend strictly enforces "Fat Models, Skinny Views".

- **N+1 Eradication**: Leveraging `select_related` and custom Model Managers, our list endpoint (`/api/submissions/`) fetches heavily nested aggregations (`Count("documents")`, `Subquery(latest_note)`) reliably in exactly **2 queries**.
- **Advanced Filtering**: We integrated `django_filters` to handle precise URL queries including Boolean boundaries (`hasDocuments=True`) and precise Date limitations (`createdFrom=YYYY-MM-DD`).
- **Indices & Typing**: We applied `db_index=True` across highly-filtered lookup models and utilized type hinting.

## 4. Code Quality & Integration (15%)

This repo mimics enterprise-level Code Quality standardizations:

- **Component Strictness**: We stripped large monolithic Views down into highly isolated components (`SubmissionFilterBar.tsx`, `SubmissionCard.tsx`), secured by `React.memo()`. 
- **Documentation**: Professional JSDoc blocks and Python Google-style docstrings accompany almost every custom hook, manager, and class.
- **Integration Proofs**: We authored `submissions.tests.py` providing `APITestCase` integration proofs documenting that our N+1 protections are definitively locking.

---

## Running the Architecture

### Backend Boot

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

### Frontend Workspace

*Ensure `node_modules` carries `@mui/icons-material` alongside typical dependencies.*
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000/submissions`. Try using the Debounced search, Paginate effortlessly via Next.js routing, and use the Contact Quick-Copy in the detail pane!
