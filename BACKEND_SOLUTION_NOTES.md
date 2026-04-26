# Backend Solution Notes

## API Endpoints

### Submissions List
```
GET /api/submissions/
```

**Available Filters:**
- `status` - Filter by submission status (case-insensitive)
- `broker_id` - Filter by broker ID
- `company_search` - Search company by legal name or industry
- `created_from` - Filter created date from (ISO datetime)
- `created_to` - Filter created date to (ISO datetime)
- `has_documents` - Filter by presence of documents (boolean)
- `has_notes` - Filter by presence of notes (boolean)
- `page` - Pagination (default size: 10)

**Response Fields:**
- Submission: id, status, priority, summary, created_at, updated_at
- Broker: id, name, primary_contact_email
- Company: id, legal_name, industry, headquarters_city
- Owner: id, full_name, email
- Counters: document_count, note_count
- Latest note preview: author_name, body_preview (200 chars), created_at

### Submission Detail
```
GET /api/submissions/{id}/
```

**Response Fields:**
- Submission fields (status, priority, summary, dates)
- Broker, Company, Owner (nested objects)
- Contacts: array of {id, name, role, email, phone}
- Documents: array of {id, title, doc_type, uploaded_at, file_url}
- Notes: array of {id, author_name, body, created_at}

### Brokers List
```
GET /api/brokers/
```

**Response Fields:**
- id, name, primary_contact_email

## Key Implementation Details

**ViewSet:** `SubmissionViewSet` (ReadOnlyModelViewSet)
- Uses `SubmissionFilterSet` for filtering
- Annotations for list view optimization:
  - `document_count` - Count of documents per submission
  - `note_count` - Count of notes per submission
  - `latest_note_*` - Latest note details (author, body, created_at)
- Different serializers for list vs. detail views

**Filters:** `SubmissionFilterSet` (django-filters)
- Status, broker_id, company_search, date range filters
- Custom methods for complex filters (company_search, has_documents, has_notes)

**Serializers:**
- `SubmissionListSerializer` - Optimized for list endpoint with aggregated counts
- `SubmissionDetailSerializer` - Full data with nested relationships
- Nested serializers: BrokerSerializer, CompanySerializer, TeamMemberSerializer, ContactSerializer, DocumentSerializer, NoteSerializer

## Database Queries

The backend is optimized with:
- Annotations for aggregation (document_count, note_count)
- Subqueries for latest note data
- Distinct() to prevent duplicates when filtering on relationships

No N+1 queries due to nested serializer relationships being read-only.
