# Repository Guidelines

- Treat `README.md` as the source of truth for the project.
- Prefer simple, explicit, explainable implementations. Add abstractions and dependencies only when they provide concrete value, and avoid single-use pass-through layers.
- Keep HTTP concerns at the API boundary, and enforce data invariants in the appropriate layer.
- Treat query behavior, including N+1 prevention, as correctness.
- Version every application endpoint under `/api/v1/`.
- Keep Django checks, tests, migration checks, and OpenAPI validation passing.
- Preserve the existing Next.js instructions in `frontend/AGENTS.md`.
