notes to send to front end for a specific implementation

## Multiple File Uploading

### File Upload Endpoint
- **Endpoint**: `POST /api/uploads/`
- **Authentication**: AllowAny (public access for applicants)
- **Content-Type**: Supports `multipart/form-data` or `application/json`

#### Request Payload Options:

**Option 1: Multipart Form-Data**
```
POST /api/uploads/
Content-Type: multipart/form-data

file: <binary file data>
entity_type: "applicant" (optional)
entity_id: <applicant_id> (optional)
document_type: "cv" | "certificate" | "supporting_document" (optional)
```

**Option 2: JSON with Base64**
```
POST /api/uploads/
Content-Type: application/json

{
  "file_data": "data:application/pdf;base64,<base64_encoded_content>",
  "file_name": "resume.pdf",
  "entity_type": "applicant",
  "entity_id": <applicant_id>,
  "document_type": "cv"
}
```

#### Response:
```json
{
  "upload_id": 123,
  "entity_type": "applicant",
  "entity_id": 456,
  "document_type": "cv",
  "original_name": "resume.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 102400,
  "file_path": "uploads/resume.pdf",
  "file_url": "https://your-domain.com/api/media/uploads/resume.pdf",
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

### Application Submission with Multiple Files
- **Endpoint**: `POST /api/recruitment/public/apply/<uuid:public_id>/`
- **Authentication**: AllowAny

#### Request Payload:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "upload_id": 123,  // Main CV upload_id (alternative to cv_path)
  "certificate_upload_ids": [124, 125],  // Array of certificate upload_ids
  "other_upload_ids": [126, 127],  // Array of other document upload_ids
  "additional_upload_ids": [128]  // Generic additional documents
}
```

#### Response:
```json
{
  "application_id": 789,
  "applicant": {
    "applicant_id": 456,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "cv_path": "document:123",
    "documents": [
      {
        "document_id": 123,
        "document_type": "cv",
        "original_name": "resume.pdf",
        "file_url": "https://your-domain.com/api/media/uploads/resume.pdf"
      },
      {
        "document_id": 124,
        "document_type": "certificate",
        "original_name": "certificate1.pdf",
        "file_url": "https://your-domain.com/api/media/uploads/certificate1.pdf"
      }
    ],
    "submitted_at": "2024-01-15T10:30:00Z",
    "tracking_code": "ABC123DEF456"
  },
  "evaluation": null,  // Will be populated after AI evaluation
  "position": {
    "position_id": 101,
    "title": "Software Engineer",
    "department": "IT",
    "description": "Job description...",
    "status": "open"
  },
  "status": "submitted",
  "submitted_at": "2024-01-15T10:30:00Z",
  "cv_version_path": "document:123",
  "tracking_code": "ABC123DEF456",
  "tracking_email_sent": true
}
```

### Frontend Implementation Notes:
- Upload files one by one to `/api/uploads/` and collect the `upload_id` values
- Use arrays for multiple files of the same type (`certificate_upload_ids`, `other_upload_ids`)
- Handle both single file uploads and batch uploads
- Show upload progress and handle errors gracefully
- Validate file types and sizes on frontend before upload

## Applicant AI Evaluation Fields

### AI Evaluation Data Structure
When fetching applicant applications, the `evaluation` field contains AI analysis results:

```json
{
  "evaluation": {
    "evaluation_id": 234,
    "fit_label": "Strong fit",  // "Strong fit" | "Good fit (gaps)" | "Review manually"
    "skill_score": 85.50,
    "experience_score": 78.25,
    "matching_percentage": 82.00,
    "semantic_score": 0.875,
    "keyword_ratio": 0.723,
    "embedding_model_name": "text-embedding-ada-002",
    "matched_keywords": ["Python", "Django", "React", "API"],
    "missing_keywords": ["AWS", "Docker"],
    "ai_rank": 3,
    "notes": "Fit label: Strong fit | Matched keywords: Python, Django, React, API | Missing keywords: AWS, Docker",
    "evaluated_at": "2024-01-15T10:35:00Z"
  }
}
```

### Displaying AI Fields in UI:
- **Matching Percentage**: Show as a progress bar or percentage with color coding (green >80%, yellow 60-80%, red <60%)
- **Fit Label**: Display prominently as a badge or status indicator
- **Skill & Experience Scores**: Show as separate metrics or combined
- **Matched/Missing Keywords**: Display as tag clouds or lists
- **AI Rank**: Show relative ranking among applicants
- **Notes**: Display as expandable text for detailed feedback

## Shortlisting Endpoints

### Manual Shortlisting
- **Endpoint**: `POST /api/applicant-applications/{application_id}/shortlist/`
- **Authentication**: HR Staff or Admin
- **Purpose**: Triggers AI evaluation for a specific application

#### Response:
Returns the complete `AiEvaluation` object (same structure as above).

### Batch Evaluation
- **Endpoint**: `POST /api/applicant-applications/batch-evaluate/`
- **Authentication**: HR Staff or Admin
- **Purpose**: Run AI evaluation for multiple applications at once

#### Request Payload:
```json
{
  "position_id": 101  // Optional: limit to specific job position
}
```

#### Response:
```json
{
  "message": "Evaluated 5 applications"
}
```

### Application Status Updates
After evaluation, applications can be updated to different statuses:
- `submitted` → `under_review` → `shortlisted` → `interview` → `hired`
- Or `rejected`, `withdrawn`

### Frontend Implementation for Shortlisting:
- Add "Evaluate with AI" button for each application
- Show loading state during evaluation
- Update UI with new AI scores and fit labels
- Allow filtering/sorting by AI rank, matching percentage
- Display evaluation results in expandable panels
- Show progress indicators for batch operations