# Department Management API — Frontend Guide

Overview
- Purpose: Frontend reference for listing, viewing and managing Departments (Admin/HR UX).
- Base path: `/api/` → Departments endpoint: `/api/departments/`
- Current backend behavior: Department endpoints now support full CRUD plus helper endpoints: `assign-manager`, `dropdown`, and `manager-dropdown`.
- Swagger UI: `/swagger/` for live schemas.

Authentication
- Supported: JWT (Bearer) and Session auth.
- Use header: `Authorization: Bearer <access_token>` for API calls.

Common headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Model fields
- `department_id` (integer) — read-only primary key
- `name` (string) — required on create
- `code` (string) — optional short code (unique when provided)
- `manager` (integer|null) — Employee id (FK to `Employee`). Writeable on create/update. Returned as id by default.
- `manager_name` (string|null) — read-only convenience field (first + last); included in list/detail responses to avoid an extra lookup.
- `manager_detail` (object|null) — returned when `?expand=manager` is provided; includes basic employee fields.
- `created_at` (datetime) — read-only

Notes about `manager` field
- The API accepts an `employee` id for `manager` and validates that it references an **active** employee; otherwise the request returns `400 Bad Request`.
- To display manager name/title, use `manager_name` from list/detail responses or enable `?expand=manager` to receive `manager_detail` with `employee_id`, `first_name`, `last_name`, `email`, and `status`.
- For minimal frontend requests when populating selects, use the manager search endpoint: `/api/departments/manager-dropdown/?q=...&limit=...`.

Endpoints (live)

1) List departments
- Method: GET
- Path: `/api/departments/`
- Description: Paginated list of departments ordered by name. Returns `manager` id and `manager_name` by default.
- Query params:
  - `page` (int) — page number
  - `page_size` (int) — page size
  - `expand=manager` — optional; when present the response includes `manager_detail` for each result.
- Permissions: Authenticated users (`IsAuthenticated`)
- Success: `200 OK`
- Example request (curl):

```bash
curl -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  "https://example.com/api/departments/"
```

- Example response (paginated):

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "department_id": 3,
      "name": "Engineering",
      "code": "ENG",
      "manager": 12,
      "manager_name": "Amina Tekle",
      "created_at": "2026-01-19T10:00:00Z"
    },
    {
      "department_id": 4,
      "name": "Human Resources",
      "code": "HR",
      "manager": null,
      "manager_name": null,
      "created_at": "2026-01-22T08:30:00Z"
    }
  ]
}
```

2) Retrieve a department
- Method: GET
- Path: `/api/departments/{department_id}/`
- Description: Return a single department object. Use `?expand=manager` to include nested manager fields.
- Permissions: Authenticated users
- Success: `200 OK` / Error: `404 Not Found`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://example.com/api/departments/3/?expand=manager"
```

3) Create department
- Method: POST
- Path: `/api/departments/`
- Permissions: HR/Admin only (protected by `IsHRStaffOrAdmin`)
- Request body (JSON):

```json
{
  "name": "Customer Success",
  "code": "CS",
  "manager": 27
}
```

- Success: `201 Created` with created object (same shape as GET). Example response includes `manager_name` if manager set.
- Validation errors: `400 Bad Request` (e.g., missing `name`, or `manager` not an active employee).

4) Update department (full)
- Method: PUT
- Path: `/api/departments/{department_id}/`
- Request body: full resource (name, code, manager)
- Permissions: HR/Admin only
- Success: `200 OK`

5) Partial update
- Method: PATCH
- Path: `/api/departments/{department_id}/`
- Request body: only fields to change (e.g., `{ "manager": 42 }`)
- Permissions: HR/Admin only
- Success: `200 OK`

6) Assign manager (convenience action)
- Method: PATCH
- Path: `/api/departments/{department_id}/assign-manager/`
- Description: Convenience endpoint to set or clear the department `manager` field. Accepts `{ "manager": <employee_id> }` to assign or `{ "manager": null }` to remove.
- Permissions: HR/Admin only
- Success: `200 OK` with updated department object (includes `manager_name`).
- Example request (assign):

```bash
curl -X PATCH "https://example.com/api/departments/3/assign-manager/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"manager": 12}'
```

- Example response (200):

```json
{
  "department_id": 3,
  "name": "Engineering",
  "code": "ENG",
  "manager": 12,
  "manager_name": "Amina Tekle",
  "created_at": "2026-01-19T10:00:00Z"
}
```

7) Dropdown endpoints (for search/select lists)
- Department dropdown — Method: GET
- Path: `/api/departments/dropdown/?q={query}&limit={n}`
- Description: Lightweight list for populating selects. Returns `department_id`, `name`, `code`, `manager`, and `manager_name`.
- Permissions: Authenticated users
- Example:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://example.com/api/departments/dropdown/?q=eng&limit=50"
```

- Manager dropdown — Method: GET
- Path: `/api/departments/manager-dropdown/?q={query}&limit={n}`
- Description: Searchable list of active employees suitable for use as department managers. Returns `employee_id`, `full_name`, `email`, `department_id`, `position`, `status`.
- Permissions: Authenticated users
- Example:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://example.com/api/departments/manager-dropdown/?q=amina&limit=30"
```

Delete behavior and safety
- Method: DELETE
- Path: `/api/departments/{department_id}/`
- Permissions: HR/Admin only
- Safety: Deleting a department is blocked when **active** employees are assigned. The API returns `400 Bad Request` with `active_employee_count` when blocked. This prevents accidental data orphaning; coordinate with backend to decide on reassignment behavior if desired.
- Example blocked response (400):

```json
{
  "detail": "Cannot delete a department while active employees are assigned.",
  "active_employee_count": 5
}
```

Errors and status codes
- `401 Unauthorized` — missing/invalid auth
- `403 Forbidden` — authenticated but not permitted (for write ops when enforced)
- `404 Not Found` — invalid department id
- `400 Bad Request` — validation errors; response body contains field error messages (e.g., `{"manager": ["Manager must reference an active employee record."]}`)

Validation rules (frontend expectations)
- `name`: required, non-empty string
- `code`: optional, short string; backend enforces uniqueness when set
- `manager`: optional integer; must match an existing **active** employee id if provided

Response optimization and N+1 mitigation
- To avoid additional requests when rendering manager names, use the `manager_name` field provided in list/detail responses.
- If you require more manager fields, pass `?expand=manager` on list/detail calls to include `manager_detail` inline.
- For selects/search, prefer the `manager-dropdown` endpoint to avoid fetching the entire employees list.

UI implementation notes (recommended)
- Department list view: call GET `/api/departments/` and display `name`, `code`, and `manager_name`.
- Manager select: use `GET /api/departments/manager-dropdown/?q={search}` to power the search/select and set the `manager` id on save.
- Create/edit form: fields `name` (text), `code` (text), `manager` (search/select). Show server-side validation messages.
- Assigning a manager: frontend can either call PATCH `/api/departments/{id}/` with `{ "manager": <id> }` or use the convenience `assign-manager` action.
- Confirm before delete: show modal and explain that deletion will be blocked if active employees are assigned.
- Caching: departments change rarely; cache dropdown results for short intervals and invalidate on create/update/delete.

Pagination and lists
- Use the `count/next/previous/results` format returned by DRF PageNumberPagination.
- Use `page` and `page_size` query params to allow the frontend to request specific pages or change page size.

Examples (curl)

Create
```bash
curl -X POST "https://example.com/api/departments/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Research","code":"R&D","manager":15}'
```

Assign manager (convenience)
```bash
curl -X PATCH "https://example.com/api/departments/3/assign-manager/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"manager": 12}'
```

Department dropdown
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://example.com/api/departments/dropdown/?q=eng&limit=50"
```

Developer notes / backend caveats
- Backend implementation locations:
  - `apps/common/views.py` — `DepartmentViewSet` (ModelViewSet), `assign_manager`, `dropdown`, `manager_dropdown` actions.
  - `apps/common/serializers.py` — `DepartmentSerializer` now includes `manager_name` and `?expand=manager` support and validates manager is active.
  - `common/permissions.py` — `IsHRStaffOrAdmin` covers HR/Admin roles.
- Permission matrix:
  - `GET` list/detail: `IsAuthenticated` (all authenticated users)
  - `POST`, `PUT`, `PATCH`, `DELETE`, `assign-manager`: restricted to `IsHRStaffOrAdmin` (Admin / HR roles)
- If you need different permission boundaries (e.g., only Admin and HR Manager), ask backend to adjust `IsHRStaffOrAdmin` or add a dedicated permission class.

Contact / next steps
- I updated the doc to describe the live CRUD endpoints and helper actions. The file is saved at [docs/departments-admin-api.md](docs/departments-admin-api.md).
- Want me to also update the frontend Postman collection or add example JSON fixtures? Let me know.

-- End
