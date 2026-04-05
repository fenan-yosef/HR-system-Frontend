# Applications Page — Frontend Spec

Purpose: a concise, implementable spec for the Applications page UI, API surface, request/response samples, and permission rules the frontend needs to build the screen shown in the screenshot.

Quick overview
- Page: "Applications" — shows recent applicants as cards with match score, status badge, date, and quick actions.
- Key frontend responsibilities:
  - List and paginate applications.
  - Display AI match score and rank (from backend `evaluation`).
  - Provide filters (search, letter, date range, score, status).
  - Export CSV of the current view.
  - Allow role-based actions: Shortlist (HR Staff), Confirm/Invite/Hire (HR CEO).

Authentication & current user
- Use `Authorization: Bearer <access_token>` header for API calls.
- Keep the authenticated user in app state including `role.role_name` and `is_superuser`.

Role checks (frontend helpers)
- isAdmin(user) => `user.role.role_name === "Admin" || user.is_superuser`
- isHRCeo(user) => `user.role.role_name === "HR CEO" || user.is_superuser`
- isHRStaff(user) => `["HR Staff", "HR", "HR CEO"].includes(user.role.role_name) || user.is_superuser`

Visible UI components (map to API)
- Header: "Applications" + subtitle.
- Export CSV button -> `GET /api/recruitment/applicant-applications/export-csv` (applies current filters).
- Filter button -> opens filter panel (search, status, date range, min_score, starts_with letter).
- Alphabet quick-filter (A..Z): map to query `?starts_with=A`.
- Summary metrics: fetch `GET /api/recruitment/applicant-applications/metrics`.
- Application cards (list): call `GET /api/recruitment/applicant-applications/` with pagination and filters.
  - Card fields provided by API: applicant (name, id, email*), position (title), status, submitted_at, evaluation (matching_percentage, ai_rank, skill_score).
  - Display match score bar using `evaluation.matching_percentage` and `evaluation.ai_rank`.
- Card actions:
  - Shortlist: show if isHRStaff(user) true -> call `POST /api/recruitment/applicant-applications/{id}/shortlist`.
  - Confirm / Invite / Hire: show if isHRCeo(user) true -> call respective CEO endpoints.

API request/response details (samples)
- List applications
  - GET /api/recruitment/applicant-applications/?page=1&search=Alice&min_score=60&starts_with=A&applied_today=true
  - Response: paginated results, each item includes `evaluation` nested object when available.

Example item (already includes `evaluation`):
```json
{
  "application_id": 456,
  "applicant": { "applicant_id": 10, "full_name": "Alice", "email": "alice@example.com" },
  "evaluation": {
    "evaluation_id": 12,
    "skill_score": 72.5,
    "experience_score": 80.0,
    "matching_percentage": 76.25,
    "ai_rank": 3,
    "notes": "...",
    "evaluated_at": "2026-01-19T10:00:00Z"
  },
  "position": { "position_id": 1, "title": "Backend Developer" },
  "status": "shortlisted",
  "submitted_at": "2026-01-19T10:00:00Z"
}
```

- Shortlist (HR Staff)
  - POST /api/recruitment/applicant-applications/{id}/shortlist
  - Request body (optional): { "note": "Reason for shortlisting" }
  - Response (200): AiEvaluation object (see `AiEvaluationSerializer` fields). Use response to update the card UI immediately.

- Confirm (HR CEO)
  - POST /api/recruitment/applicant-applications/{id}/confirm
  - Request: { "confirmed_by": <user_id>, "note": "..." }
  - Response: { "status": "confirmed", "application_id": <id> }

- Invite Interview (HR CEO)
  - POST /api/recruitment/applicant-applications/{id}/invite_interview
  - Request: { "datetime": "2026-03-20T10:00:00Z", "location": "Zoom link", "message": "..." }
  - Response: { "invited": true, "invited_at": "2026-03-13T12:00:00Z" }

- Hire (HR CEO)
  - POST /api/recruitment/applicant-applications/{id}/hire
  - Request: { "start_date": "2026-04-01", "package": { "salary": 70000 }, "hired_by": <user_id> }
  - Response: { "status": "hired", "application_id": <id> }

- Export CSV
  - GET /api/recruitment/applicant-applications/export-csv?status=shortlisted&min_score=60
  - Response: `text/csv` attachment.

- Metrics
  - GET /api/recruitment/applicant-applications/metrics
  - Response: { "total": 123, "applied_today": 14, "shortlisted": 22, "pending": 87 }

Permission & error handling (frontend)
- Always guard UI by role helpers, but treat backend as source of truth. If an action returns 403:
  - Show a user-friendly message: "You don't have permission to perform this action."
  - Disable the action button (re-evaluate role state) and log the event for debugging.
- 401 -> redirect to login.
- 400 -> display validation messages.
- Network failure -> show retry option and graceful fallback.

Implementation notes & UX details
- Show skeleton loaders while fetching pages.
- Use the `evaluation.matching_percentage` for the progress bar and `evaluation.ai_rank` for small rank label.
- For alphabetical quick-filter, send `?starts_with=X` to the list endpoint.
- For "applied today" badge and count, call `GET /api/recruitment/applicant-applications/metrics` and/or `?applied_today=true`.
- For large exports, show a progress indicator and disable the Export CSV button while generating.

Testing & seeded accounts
- Run `python scripts/seed_demo_users.py` to create demo users:
  - `hr` / `1234` -> HR Staff
  - `hr_ceo` / `ceo1234` -> HR CEO
  - `admin` / `admin123` -> Admin
- Use `scripts/evaluate_all_applications.py` to ensure evaluations/match scores exist for pending apps before UI QA.

Appendix: quick frontend snippets
- Role helper (JS):
```js
const isHRCeo = (user) => user?.role?.role_name === 'HR CEO' || user?.is_superuser;
const isHRStaff = (user) => ['HR Staff','HR','HR CEO'].includes(user?.role?.role_name) || user?.is_superuser;
```

- Shortlist action (pseudo):
```js
async function shortlist(id){
  const res = await fetch(`/api/recruitment/applicant-applications/${id}/shortlist/`, {method:'POST', headers: {'Authorization': token}});
  if(res.status === 200) return res.json();
  if(res.status === 403) throw new Error('Forbidden');
}
```

Deliverable: this file contains everything your frontend engineer needs to implement the Applications page and wire up role-based UI and API calls.

File: docs/frontend-roles.md
