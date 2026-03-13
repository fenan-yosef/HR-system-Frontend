# Frontend Role & API Integration Spec

Purpose: Provide the frontend developer with a concise spec for implementing UI pages, API payloads/responses, and permission checks for HR Staff and HR CEO roles (plus Admin, Employee, Applicant). Use this to build pages, enable/disable UI actions, and call the backend safely.

Summary of roles
- Admin: full system access.
- HR CEO: strategic HR role — final approvals, interview invitations, hiring actions, access to sensitive reports.
- HR Staff: operational HR — shortlisting, screening, day-to-day employee workflows.
- Employee: internal employees (limited access).
- Applicant: external applicants.

Auth & role detection
- All API calls use `Authorization: Bearer <access_token>`.
- After login, fetch the current user (or rely on JWT claims):
  - `GET /api/users/{id}/` or `GET /api/users/me/` (if available) returns a `role` object: { "role_id": 1, "role_name": "HR CEO", ... }.
  - Alternatively inspect the token payload for a `role` or `role_name` claim if the backend includes it.

General UI rules (visibility & enablement)
- Show actions only when permitted by role:
  - `Shortlist` button: visible to roles `{ "HR Staff", "HR", "HR CEO", "Admin" }`.
  - `Confirm` / `Send Interview Invite` / `Hire` buttons: visible to `{ "HR CEO", "Admin" }` only.
  - `Manage Roles` / `Manage Users`: visible to `Admin` only.
- Defensive check: even when showing a button, the frontend must always handle 403 responses and display a friendly error if backend denies action.

Pages to implement (suggested)
- HR Dashboard
  - Overview metrics (open roles, pending applications, upcoming interviews).
  - Navigation to Candidate Queue and Hiring Pipeline.
- Candidate Queue (shortlisting)
  - List applications: `GET /api/recruitment/applications/` (paginated).
  - Actions: `Shortlist` (HR Staff), view details.
- Candidate Details
  - Show applicant data and CV.
  - Actions vary by role: `Shortlist` (HR Staff), `Confirm` / `Invite` / `Hire` (HR CEO).
- Interview Management / Scheduling
  - CEO action to create interview invites; may call an endpoint to send emails.
- Hiring Pipeline (final decisions)
  - CEO-only views for final approvals and offer letters.

Key API endpoints (existing + recommended)
(Note: adapt exact paths if backend differs; these match the current backend structure.)

- Authentication
  - POST /api/token/ (or `/api/token/obtain/`) — obtain JWT.
    - Request: { "username": "hr", "password": "1234" }
    - Response: { "access": "<jwt>", "refresh": "<refresh>" }

- Roles & Users
  - GET /api/roles/ — list roles (Admin-only).
    - Response sample:
      [{ "role_id": 2, "role_name": "HR Staff", "description": "..." }, ...]
  - GET /api/users/ — list users (Admin-only).
  - POST /api/users/ — create user (Admin-only).

- Applications / Recruitment
  - GET /api/recruitment/applications/ — list applications (HR Staff or Admin).
    - Query params: `?page=1&search=Alice`.
    - Response: paginated list of Application objects (see API docs).

  - POST /api/recruitment/applications/ — create application (public or HR flows).

  - POST /api/recruitment/applications/{id}/shortlist — shortlist action (HR Staff allowed).
    - Request: none or optional body: { "note": "Reason for shortlisting" }
    - Response (200): AI evaluation or shortlist result, sample:
      {
        "id": 123,
        "application": 456,
        "ai_rank": 0.92,
        "summary": "Good match",
        "created_at": "2026-01-19T10:00:00Z"
      }

  - POST /api/recruitment/applications/{id}/confirm — CONFIRM candidate (HR CEO only) [recommended backend endpoint].
    - Request: { "confirmed_by": "<user_id>", "note": "Final approval notes" }
    - Response (200): { "status": "confirmed", "application_id": 456 }

  - POST /api/recruitment/applications/{id}/invite_interview — send interview invite (HR CEO only) [recommended].
    - Request: { "datetime": "2026-03-20T10:00:00Z", "location": "Zoom link or address", "message": "..." }
    - Response (200): { "invited": true, "sent_at": "2026-03-13T12:00:00Z" }

  - POST /api/recruitment/applications/{id}/hire — mark hired (HR CEO only) [recommended].
    - Request: { "start_date": "2026-04-01", "package": { "salary": 70000 }, "hired_by": <user_id> }
    - Response (200): { "status": "hired", "employee_id": 789 }

UX examples & flows
- Shortlist flow (HR Staff):
  1. HR Staff opens Candidate Queue -> calls `GET /api/recruitment/applications/?status=pending`.
  2. Clicks `Shortlist` on an application -> call `POST /api/recruitment/applications/{id}/shortlist`.
  3. On success show toast "Application shortlisted" and move to next list.
  4. If 403 returned -> show "You don't have permission to shortlist this candidate." and hide the button.

- Confirm/Hire flow (HR CEO):
  1. HR CEO views shortlisted candidates -> selects candidate -> clicks `Confirm`.
  2. Call `POST /api/recruitment/applications/{id}/confirm` with optional notes.
  3. On confirm, present options to `Invite to interview` or `Hire`.

Permission handling details (frontend)
- Always maintain the authenticated user object in app state (e.g., Redux, Context) including `role.role_name`.
- Define helper functions for checks:
  - isAdmin(user) => user.role.role_name === "Admin" || user.is_superuser
  - isHRCeo(user) => user.role.role_name === "HR CEO" || user.is_superuser
  - isHRStaff(user) => ["HR Staff", "HR", "HR CEO"].includes(user.role.role_name) || user.is_superuser
- Use these helpers to control UI visibility and to disable actions. Example snippet (pseudocode):

```js
const canShortlist = isHRStaff(currentUser);
const canConfirm = isHRCeo(currentUser);
// Render
{canShortlist && <Button onClick={shortlist}>Shortlist</Button>}
{canConfirm && <Button onClick={confirm}>Confirm</Button>}
```

- Also implement optimistic UI updates carefully and always reconcile with backend responses.

Error handling & user feedback
- 401 Unauthorized: redirect to login.
- 403 Forbidden: show permission error; optionally show a small help text explaining required role.
- Validation errors (400): display field validation messages inline.
- Network errors: show retry option.

Testing notes for frontend dev
- Test with seeded demo accounts (run `python scripts/seed_demo_users.py`):
  - `hr` / `1234` -> HR Staff
  - `hr_ceo` / `ceo1234` -> HR CEO
  - `admin` / `admin123` -> Admin
- Verify flows for each role and confirm that backend returns 403 when unauthorized actions are attempted.

Appendix: sample objects
- SystemUser (from API):

```json
{
  "id": 5,
  "username": "hr_ceo",
  "email": "hr_ceo@example.com",
  "role": { "role_id": 7, "role_name": "HR CEO" },
  "is_active": true
}
```

- Application shortlist response (example):

```json
{
  "application_id": 456,
  "applicant": { "full_name": "Alice" },
  "position": { "title": "Backend Developer" },
  "status": "shortlisted",
  "ai_evaluation": { "ai_rank": 0.92, "summary": "Good match" }
}
```

If you want, I can also:
- Add example React components and a small role-guard HOC/helper.
- Implement the backend CEO endpoints (`confirm`, `invite_interview`, `hire`) if you'd like them created server-side.

---
Created for frontend integration on demand. Send this file to your frontend dev: `docs/frontend-roles.md`.
