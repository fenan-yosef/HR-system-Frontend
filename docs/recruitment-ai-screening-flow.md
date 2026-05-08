# Recruitment AI Screening Flow (Frontend Integration Guide)

This guide describes the end-to-end frontend workflow for the recruitment AI pipeline, from creating a job post to running AI screening and handling re-evaluation when job criteria change.

## 1. Core Concepts

- **Job criteria versioning**: Every job has a `criteria_version`.
- **Screening result versioning**: Every screening result has `evaluation_version`.
- **Stale results**: A result is stale if `evaluation_version < criteria_version`.
- **Re-evaluation**: Only stale or missing results are re-screened when HR triggers re-evaluation.
- **Applicant note safety**: `applicant_note` is stored for HR context only and must not be treated as AI instructions.

## 2. Primary Endpoints

### Job Post + AI setup

- `POST /api/job-positions/`
- `PATCH /api/job-positions/{position_id}/`
- `POST /api/job-positions/suggest-skills/`

### Public application flow

- `GET /api/recruitment/public/job/{public_id}/`
- `POST /api/uploads/`
- `POST /api/recruitment/public/apply/{public_id}/`

### Screening flow

- `POST /api/recruitment/screening/start/{job_position_id}/`
- `GET /api/recruitment/screening/progress/{job_id}/`
- `GET /api/recruitment/screening/{job_position_id}/results/`

### Re-evaluation flow

- `GET /api/recruitment/screening/version-stats/{job_position_id}/`
- `POST /api/recruitment/screening/re-evaluate/{job_position_id}/`

## 3. Job Post Creation UX (HR)

### 3.1 Build the form with these fields

Required practical fields:
- `title`
- `department`
- `description`
- `posted_date`

Screening criteria fields:
- `required_skills` (array)
- `required_certificates` (array)
- `min_years_experience`
- `min_gpa`
- `allowed_universities` (array)
- `shortlist_size`

AI scoring config fields:
- `scoring_weights` object with keys:
  - `skills`
  - `experience`
  - `education`
  - `certifications`
- `ai_config` object (optional), including optional controls like:
  - `min_pass_score`
  - `skip_ai_on_hard_fail`
  - `final_score_blend` with `rule` and `ai`

### 3.2 Skill chip generation flow

1. HR types job description.
2. Frontend calls `POST /api/job-positions/suggest-skills/`:

```json
{
  "description": "We need a Django backend engineer with PostgreSQL and Docker experience...",
  "limit": 10
}
```

3. Response:

```json
{
  "skills": ["Django", "PostgreSQL", "Docker", "REST API"],
  "count": 4
}
```

4. HR edits chips manually.
5. Send final chips in `required_skills` when saving job post.

## 4. Public Application UX

### 4.1 Fetch job metadata

`GET /api/recruitment/public/job/{public_id}/`

Use this for the public apply page title/description.

### 4.2 Upload files first

Upload each document with `POST /api/uploads/` and collect returned `upload_id` values.

Recommended upload grouping on frontend:
- One CV upload ID
- Certificate upload IDs array
- Other supporting upload IDs array

### 4.3 Submit application

`POST /api/recruitment/public/apply/{public_id}/`

Example payload:

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+2519...",
  "upload_id": 1201,
  "certificate_upload_ids": [1301, 1302],
  "other_upload_ids": [1401],
  "applicant_note": "I can start in two weeks."
}
```

Notes:
- `applicant_note` is optional.
- CV data URLs are rejected; upload CV first and send `upload_id`.

## 5. Start Screening Flow (HR)

### 5.1 Trigger full screening

`POST /api/recruitment/screening/start/{job_position_id}/`

Optional request body:

```json
{
  "custom_params": {
    "preferred_skills": ["Celery", "Redis"]
  }
}
```

### 5.2 Poll progress

`GET /api/recruitment/screening/progress/{job_id}/`

Example response:

```json
{
  "job_id": 55,
  "progress_percent": 42,
  "current": 210,
  "total": 500,
  "status": "running",
  "current_applicant": "Candidate Name",
  "mode": "full"
}
```

### 5.3 Load ranked results

`GET /api/recruitment/screening/{job_position_id}/results/`

Each result now includes:
- `rule_score`
- `ai_score`
- `final_score`
- `evaluation_version`
- `scoring_breakdown`

Frontend should sort/display by `final_score`.

## 6. Re-evaluation Flow (When Criteria Change)

Use this whenever HR updates criteria after screening has already been run.

### 6.1 Check stale status first

`GET /api/recruitment/screening/version-stats/{job_position_id}/`

Example response shape:

```json
{
  "position_id": 9,
  "position_title": "Backend Engineer",
  "criteria_version": 3,
  "stats": {
    "position_id": 9,
    "criteria_version": 3,
    "total_applications": 1200,
    "up_to_date_count": 750,
    "stale_count": 300,
    "missing_result_count": 150,
    "rescreen_required_count": 450,
    "is_fully_up_to_date": false,
    "stale_application_ids": [11, 13, 14],
    "missing_result_application_ids": [88, 89]
  }
}
```

### 6.2 Trigger stale-only re-evaluation

`POST /api/recruitment/screening/re-evaluate/{job_position_id}/`

Optional body:

```json
{
  "custom_params": {
    "preferred_skills": ["Kubernetes"]
  }
}
```

Behavior:
- Only stale or missing-result applications are re-screened.
- If none are stale, API returns a no-op response with stats and no job creation.

Possible response (job started):

```json
{
  "id": 77,
  "position": 9,
  "status": "pending",
  "total_applicants": 0,
  "processed_applicants": 0,
  "started_at": "...",
  "completed_at": null,
  "error_message": null,
  "mode": "stale_only",
  "criteria_version": 3,
  "stats_snapshot": {
    "rescreen_required_count": 450
  }
}
```

Possible response (no-op):

```json
{
  "position_id": 9,
  "position_title": "Backend Engineer",
  "mode": "stale_only",
  "criteria_version": 3,
  "detail": "No stale applications detected for the current criteria version.",
  "stats": {
    "rescreen_required_count": 0
  }
}
```

### 6.3 Poll progress and refresh results

After re-evaluation starts:
1. Poll `/screening/progress/{job_id}/` until `status=completed`.
2. Refetch `/screening/{job_position_id}/results/`.
3. Optionally refetch `/screening/version-stats/{job_position_id}/` to confirm stale count drops to 0.

## 7. Frontend State Machine Recommendation

Use this state machine for HR screening pages:

1. `idle`
2. `checking-version-stats`
3. `ready-to-screen` or `ready-to-reevaluate`
4. `screening-running`
5. `screening-completed`
6. `error`

Transition examples:
- If `rescreen_required_count > 0`, show **Re-evaluate stale results** CTA.
- If `rescreen_required_count == 0`, disable re-evaluate CTA and show "Up to date" badge.

## 8. Security and Data Handling Rules

- Never treat `applicant_note` as executable or trusted instruction content.
- Do not send raw untrusted UI text into prompt templates without backend sanitation and schema constraints.
- Display score breakdown to HR for transparency.
- Keep manual HR override actions separate from AI scoring output.

## 9. Minimum Frontend Checklist

1. Implement skill-chip suggestion with manual edit support.
2. Implement multi-upload apply flow with CV + certificates + supporting docs.
3. Add screening dashboard with progress polling and ranked results.
4. Add version-mismatch widget using `/version-stats/`.
5. Add stale-only re-evaluation CTA and no-op handling.
6. Display `final_score` as the primary ranking metric.
7. Display `rule_score` and `ai_score` as explainability details.
8. Show screening run mode (`full` vs `stale_only`) when available.
