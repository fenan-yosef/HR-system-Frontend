# Custom Application Fields API

This document describes dynamic applicant form fields configured by HR per job post.

## Overview

HR can define custom form fields per job (for example: Degree Image, Expected Salary, Portfolio URL).
The public application endpoint validates these fields and stores applicant answers.
AI screening automatically receives custom field answers for fields where `include_in_ai` is `true`.

## Supported Field Types

- `short_text`
- `long_text`
- `number`
- `integer`
- `boolean`
- `select`
- `multi_select`
- `date`
- `file`
- `file_list`
- `email`
- `url`
- `phone`

## 1) HR Manage Field Schema

### GET /api/job-positions/{position_id}/application-fields/

Returns current schema for one job post.

Response:

```json
{
  "position_id": 12,
  "position_title": "Senior Backend Engineer",
  "custom_application_fields": [
    {
      "key": "degree_image",
      "label": "Degree Image",
      "type": "file",
      "required": true,
      "include_in_ai": true,
      "order": 1
    },
    {
      "key": "expected_salary",
      "label": "Expected Salary",
      "type": "number",
      "required": false,
      "include_in_ai": true,
      "min_value": 0,
      "order": 2
    }
  ],
  "count": 2
}
```

### PUT/PATCH /api/job-positions/{position_id}/application-fields/

Creates or replaces the full schema.

Request:

```json
{
  "custom_application_fields": [
    {
      "label": "Degree Image",
      "type": "file",
      "required": true,
      "include_in_ai": true
    },
    {
      "label": "Expected Salary",
      "type": "number",
      "required": false,
      "min_value": 0,
      "include_in_ai": true
    },
    {
      "label": "Extra Notes",
      "type": "long_text",
      "required": false,
      "max_length": 2000,
      "include_in_ai": false
    }
  ]
}
```

Notes:

- If `key` is not provided, backend auto-generates one from `label`.
- `include_in_ai=false` excludes the field from AI screening payload.
- For `select` and `multi_select`, provide `options`.

## 2) Public Job Metadata for Frontend Rendering

### GET /api/recruitment/public/job/{public_id}/

Response includes `custom_application_fields` so frontend can render dynamic inputs.

## 3) Public Application Submission

### POST /api/recruitment/public/apply/{public_id}/

Submit default fields plus `custom_field_values`.

Request:

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+251911223344",
  "upload_id": 1201,
  "certificate_upload_ids": [1301],
  "other_upload_ids": [1401],
  "applicant_note": "Available in 2 weeks",
  "custom_field_values": {
    "expected_salary": 150000,
    "degree_image": 2201,
    "portfolio_url": "https://example.com/jane"
  }
}
```

File field notes:

- Upload file(s) first using `POST /api/uploads/`.
- Pass returned `upload_id` in `custom_field_values` for `file` type.
- Pass array of upload IDs for `file_list` type.

Success response (example excerpt):

```json
{
  "application_id": 77,
  "status": "submitted",
  "custom_field_values": {
    "expected_salary": 150000,
    "degree_image": {
      "upload_id": 2201,
      "reference": "document:2201",
      "file_name": "degree.jpg",
      "mime_type": "image/jpeg",
      "size_bytes": 502331,
      "file_url": "http://localhost:8000/api/media/degree.jpg"
    },
    "portfolio_url": "https://example.com/jane"
  },
  "tracking_code": "AB12CD34",
  "tracking_email_sent": true
}
```

Validation error response (example):

```json
{
  "detail": "Invalid custom field values.",
  "errors": {
    "expected_salary": "could not convert string to float: 'abc'"
  }
}
```

## 4) AI Screening Integration

During screening:

- Job-level schema is read from `custom_application_fields`.
- Application-level answers are read from `custom_field_values`.
- Only fields with `include_in_ai=true` are sent to LLM.
- Payload keys used by AI prompt:
  - `application_custom_fields`
  - `application_custom_field_values`

This allows HR-defined custom questions to influence AI scoring and recommendation.
