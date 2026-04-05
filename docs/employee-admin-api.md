# Employee Management API — Admin (and HR Staff)

Overview
- Purpose: CRUD endpoints for employee management used by admin/HR staff.
- Access: Protected by `IsHRStaffOrAdmin` permission. Admins and HR staff can perform all operations.
- Base path (API root may vary in deployment): `/api/`
- Employee endpoints live under: `/api/employees/`

Authentication
- Supported: JWT (Bearer) and Session authentication.
- Preferred header for API calls: `Authorization: Bearer <access_token>`
- For browser session flows, use session cookie + CSRF token.

Common Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Employee data model (fields)
- `employee_id` (integer) — read-only, primary key
- `user` (integer) — optional SystemUser id (OneToOne relationship)
- `first_name` (string) — required
- `last_name` (string) — required
- `email` (string) — required, unique, validated
- `phone` (string) — optional
- `department` (integer) — optional department id
- `position` (string) — optional
- `employment_type` (enum) — one of: `full_time`, `contract`, `intern`, `part_time` (default: `full_time`)
- `hire_date` (date) — format: `YYYY-MM-DD`
- `status` (enum) — one of: `active`, `on_leave`, `suspended`, `terminated` (default: `active`)
- `created_at` (datetime) — read-only
- `updated_at` (datetime) — read-only
- `deleted_at` (datetime) — read-only (present on model but not auto-managed by API)

Notes: `employee_id`, `created_at`, `updated_at`, and `deleted_at` are read-only fields and cannot be set on create/update.

Endpoints
1) List Employees
- Method: GET
- Path: `/api/employees/`
- Description: Returns a paginated list of employees ordered by `last_name`, `first_name`.
- Query params:
  - `page` (int) — page number (default 1)
  - `page_size` (int) — page size (default configured on backend, typically 20)
- Permissions: Admin and HR staff
- Success: `200 OK`
- Example response:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "employee_id": 12,
      "user": 45,
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "phone": "+1-555-0100",
      "department": 3,
      "position": "Software Engineer",
      "employment_type": "full_time",
      "hire_date": "2024-07-01",
      "status": "active",
      "created_at": "2024-07-02T09:12:34Z",
      "updated_at": "2024-07-10T15:00:00Z",
      "deleted_at": null
    }
  ]
}
```

2) Retrieve Employee
- Method: GET
- Path: `/api/employees/{employee_id}/`
- Description: Retrieve a single employee by `employee_id`.
- Permissions: Admin and HR staff
- Success: `200 OK`
- Error: `404 Not Found` if the employee does not exist

3) Create Employee
- Method: POST
- Path: `/api/employees/`
- Description: Create a new employee. `employee_id`, `created_at`, `updated_at`, and `deleted_at` are ignored if provided.
- Permissions: Admin and HR staff
- Success: `201 Created` (Body: created employee)
- Validation errors: `400 Bad Request`
- Example request body:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-0100",
  "department": 3,
  "position": "Software Engineer",
  "employment_type": "full_time",
  "hire_date": "2024-07-01",
  "status": "active"
}
```
- Example success response (201): same object as retrieve, including `employee_id` and timestamps.

4) Update Employee (full)
- Method: PUT
- Path: `/api/employees/{employee_id}/`
- Description: Replace the employee resource with the provided payload. Include all writable fields.
- Permissions: Admin and HR staff
- Success: `200 OK`
- Validation errors: `400 Bad Request`

5) Partial Update (patch)
- Method: PATCH
- Path: `/api/employees/{employee_id}/`
- Description: Update only provided fields.
- Permissions: Admin and HR staff
- Success: `200 OK`

6) Delete Employee
- Method: DELETE
- Path: `/api/employees/{employee_id}/`
- Description: Remove an employee. The API returns `204 No Content` on success.
- Permissions: Admin and HR staff
- Note: The `Employee` model includes a `deleted_at` field, but the API does not currently guarantee a soft-delete behavior. If you require soft-delete semantics (record remains but marked deleted), please coordinate with backend.

Error responses (examples)
- `401 Unauthorized` — missing or invalid auth token
- `403 Forbidden` — authenticated user lacks permitted role
- `400 Bad Request` — validation errors
Example validation error (email uniqueness):
```json
{
  "email": ["This field must be unique."]
}
```

Implementation notes for the frontend
- Use `Authorization: Bearer <token>` header for API calls (SIMPLE_JWT is enabled in backend).
- For session-based flows (cookies), include CSRF token and send requests from same-origin or set appropriate CORS headers.
- Pagination: Respect the `count`, `next`, `previous`, and `results` fields returned by list endpoints.
- Department and user fields expect numeric IDs. If the frontend creates `SystemUser` objects separately, pass the `user` id when associating.
- If you need search, filtering, or ordering by other fields, request backend changes (currently only page/page_size pagination is enabled by default).

Contact & next steps
- If you want additional query filters (search by name/email, filter by department/status) or soft-delete behavior, tell the backend team and we can add `django-filter` or custom query params.

-- End of spec
