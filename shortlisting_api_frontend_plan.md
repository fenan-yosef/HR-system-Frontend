# Shortlisting APIs - Payloads, Responses & Frontend Implementation Plan

## Overview

The shortlisting functionality in the HR system uses AI-powered evaluation to automatically rank and shortlist candidates based on their CV matching against job requirements. The system provides APIs for individual evaluation, batch processing, metrics tracking, and candidate progression through the hiring pipeline.

## Core APIs

### 1. Individual Application Shortlisting

**Endpoint:** `POST /api/applicant-applications/{id}/shortlist/`

**Purpose:** Triggers AI evaluation for a single application, updating its status and ranking.

**Authentication:** HR Staff or Admin required

**Request Payload:**
```json
{
  // No request body required - evaluation is triggered for the application ID in the URL
}
```

**Response Payload:**
```json
{
  "evaluation_id": 123,
  "fit_label": "Strong fit",
  "application": {
    "application_id": 456,
    "status": "shortlisted",
    "submitted_at": "2026-03-29T10:30:00Z",
    "cv_version_path": "uploads/cv_456.pdf",
    "position": {
      "position_id": 789,
      "title": "Senior Backend Engineer",
      "department": 1,
      "description": "Job description...",
      "status": "open",
      "posted_date": "2026-03-01",
      "closed_date": null,
      "created_at": "2026-03-01T09:00:00Z"
    },
    "applicant": {
      "applicant_id": 101,
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "cv_path": "uploads/cv_456.pdf",
      "documents": [],
      "submitted_at": "2026-03-29T10:30:00Z",
      "tracking_code": "ABC123DEF4",
      "tracking_code_sent_at": "2026-03-29T10:31:00Z"
    }
  },
  "application_id": 456,
  "skill_score": 85.50,
  "experience_score": 78.25,
  "matching_percentage": 82.00,
  "semantic_score": 0.875,
  "keyword_ratio": 0.742,
  "embedding_model_name": "text-embedding-ada-002",
  "matched_keywords": ["Python", "Django", "REST API", "PostgreSQL"],
  "missing_keywords": ["Kubernetes", "Docker", "AWS"],
  "summary": "Strong technical background with relevant experience...",
  "skill_gaps": ["Cloud deployment experience", "Container orchestration"],
  "interview_questions": [
    "Can you describe your experience with Django REST framework?",
    "How have you handled database optimization in previous projects?"
  ],
  "cluster_id": 2,
  "ai_rank": 3,
  "notes": "AI evaluation completed. Matching percentage: 82.00%",
  "evaluated_at": "2026-03-29T10:32:00Z"
}
```

**Status Code:** 200 OK

**Error Responses:**
- 404 Not Found: Application does not exist
- 403 Forbidden: Insufficient permissions
- 500 Internal Server Error: AI evaluation failed

### 2. Batch Application Evaluation

**Endpoint:** `POST /api/applicant-applications/batch-evaluate/`

**Purpose:** Runs AI evaluations for multiple applications, useful for processing pending applications in bulk.

**Authentication:** HR Staff or Admin required

**Request Payload:**
```json
{
  "position_id": 789  // Optional: limit to applications for a specific position
}
```

**Response Payload:**
```json
{
  "evaluated": 25  // Number of applications that were evaluated
}
```

**Status Code:** 200 OK

**Notes:**
- If `position_id` is not provided, evaluates all applications with status "submitted" or "under_review"
- Automatically updates application statuses based on AI scores and configured thresholds

### 3. Recruitment Metrics

**Endpoint:** `GET /api/applicant-applications/metrics/`

**Purpose:** Provides overview statistics including shortlisting metrics.

**Authentication:** HR Staff or Admin required

**Request Payload:** None

**Response Payload:**
```json
{
  "total": 150,
  "applied_today": 5,
  "shortlisted": 23,
  "pending": 67
}
```

**Status Code:** 200 OK

### 4. Confirm Shortlisted Candidate

**Endpoint:** `POST /api/applicant-applications/{id}/confirm/`

**Purpose:** Moves a shortlisted candidate to interview stage (CEO-only action).

**Authentication:** CEO or Admin required

**Request Payload:**
```json
{
  // No request body required
}
```

**Response Payload:**
```json
{
  "status": "confirmed",
  "application_id": 456
}
```

**Status Code:** 200 OK

**Error Responses:**
- 400 Bad Request: Application is not in "shortlisted" status
- 403 Forbidden: Insufficient permissions (not CEO/Admin)

### 5. Send Interview Invitation

**Endpoint:** `POST /api/applicant-applications/{id}/invite_interview/`

**Purpose:** Sends interview invitation to a confirmed candidate (CEO-only action).

**Authentication:** CEO or Admin required

**Request Payload:**
```json
{
  // No request body required - uses default invitation template
}
```

**Response Payload:**
```json
{
  "status": "invited",
  "application_id": 456,
  "message": "Interview invitation sent successfully"
}
```

**Status Code:** 200 OK

### 6. Hire Candidate

**Endpoint:** `POST /api/applicant-applications/{id}/hire/`

**Purpose:** Marks a candidate as hired, completing the recruitment process (CEO-only action).

**Authentication:** CEO or Admin required

**Request Payload:**
```json
{
  // No request body required
}
```

**Response Payload:**
```json
{
  "status": "hired",
  "application_id": 456,
  "message": "Candidate marked as hired"
}
```

**Status Code:** 200 OK

## Frontend Implementation Plan

### 1. Application List/Dashboard Component

**Purpose:** Display applications with shortlisting status and AI evaluation results.

**Key Features:**
- List applications with filtering by status (submitted, under_review, shortlisted, interview, rejected, hired)
- Display AI evaluation scores and rankings
- Show fit labels (Strong fit, Good fit, Review manually)
- Bulk actions for batch evaluation

**UI Components Needed:**
```typescript
interface ApplicationListProps {
  applications: ApplicantApplication[];
  onShortlist: (applicationId: number) => void;
  onBatchEvaluate: (positionId?: number) => void;
  onConfirm: (applicationId: number) => void;
  onInviteInterview: (applicationId: number) => void;
  onHire: (applicationId: number) => void;
}

interface ApplicationCardProps {
  application: ApplicantApplication;
  evaluation?: AiEvaluation;
  onAction: (action: string, applicationId: number) => void;
}
```

**API Integration:**
```typescript
// Fetch applications with evaluations
const fetchApplications = async (filters: ApplicationFilters) => {
  const response = await api.get('/api/applicant-applications/', { params: filters });
  return response.data;
};

// Trigger individual shortlisting
const shortlistApplication = async (applicationId: number) => {
  const response = await api.post(`/api/applicant-applications/${applicationId}/shortlist/`);
  return response.data;
};

// Batch evaluate applications
const batchEvaluateApplications = async (positionId?: number) => {
  const response = await api.post('/api/applicant-applications/batch-evaluate/', {
    position_id: positionId
  });
  return response.data;
};
```

### 2. AI Evaluation Details Modal/Component

**Purpose:** Display detailed AI evaluation results for a candidate.

**Features:**
- Matching percentage and scores breakdown
- Matched and missing keywords
- Skill gaps and recommendations
- Generated interview questions
- Summary and notes

**UI Structure:**
```typescript
interface EvaluationModalProps {
  evaluation: AiEvaluation;
  isOpen: boolean;
  onClose: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ evaluation, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="evaluation-details">
        <h3>AI Evaluation Results</h3>
        <div className="score-overview">
          <div className="matching-percentage">
            <span className="score">{evaluation.matching_percentage}%</span>
            <span className="label">{evaluation.fit_label}</span>
          </div>
          <div className="score-breakdown">
            <div>Skill Score: {evaluation.skill_score}</div>
            <div>Experience Score: {evaluation.experience_score}</div>
            <div>AI Rank: #{evaluation.ai_rank}</div>
          </div>
        </div>
        
        <div className="keywords-section">
          <h4>Matched Keywords</h4>
          <div className="keyword-tags">
            {evaluation.matched_keywords?.map(keyword => (
              <span key={keyword} className="keyword matched">{keyword}</span>
            ))}
          </div>
          
          <h4>Missing Keywords</h4>
          <div className="keyword-tags">
            {evaluation.missing_keywords?.map(keyword => (
              <span key={keyword} className="keyword missing">{keyword}</span>
            ))}
          </div>
        </div>
        
        <div className="skill-gaps">
          <h4>Skill Gaps</h4>
          <ul>
            {evaluation.skill_gaps?.map(gap => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
        
        <div className="interview-questions">
          <h4>Suggested Interview Questions</h4>
          <ol>
            {evaluation.interview_questions?.map(question => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </div>
        
        <div className="summary">
          <h4>AI Summary</h4>
          <p>{evaluation.summary}</p>
        </div>
      </div>
    </Modal>
  );
};
```

### 3. Metrics Dashboard Widget

**Purpose:** Display recruitment pipeline metrics.

**Features:**
- Total applications count
- Today's applications
- Shortlisted candidates count
- Pending applications count
- Visual progress indicators

**Implementation:**
```typescript
const RecruitmentMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<RecruitmentMetrics | null>(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/api/applicant-applications/metrics/');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (!metrics) return <div>Loading...</div>;
  
  return (
    <div className="metrics-dashboard">
      <div className="metric-card">
        <h4>Total Applications</h4>
        <span className="metric-value">{metrics.total}</span>
      </div>
      
      <div className="metric-card">
        <h4>Applied Today</h4>
        <span className="metric-value">{metrics.applied_today}</span>
      </div>
      
      <div className="metric-card highlight">
        <h4>Shortlisted</h4>
        <span className="metric-value">{metrics.shortlisted}</span>
      </div>
      
      <div className="metric-card">
        <h4>Pending Review</h4>
        <span className="metric-value">{metrics.pending}</span>
      </div>
    </div>
  );
};
```

### 4. Candidate Progression Workflow

**Purpose:** Handle the candidate journey from shortlisting to hiring.

**Features:**
- Status progression buttons (Confirm → Interview → Hire)
- Permission-based visibility (CEO-only actions)
- Confirmation dialogs for irreversible actions
- Email notification triggers

**Implementation:**
```typescript
interface CandidateActionsProps {
  application: ApplicantApplication;
  userRole: string;
  onStatusChange: (applicationId: number, newStatus: string) => void;
}

const CandidateActions: React.FC<CandidateActionsProps> = ({ 
  application, 
  userRole, 
  onStatusChange 
}) => {
  const handleConfirm = async () => {
    if (confirm('Are you sure you want to confirm this candidate for interview?')) {
      try {
        await api.post(`/api/applicant-applications/${application.application_id}/confirm/`);
        onStatusChange(application.application_id, 'interview');
      } catch (error) {
        alert('Failed to confirm candidate');
      }
    }
  };
  
  const handleInviteInterview = async () => {
    try {
      await api.post(`/api/applicant-applications/${application.application_id}/invite_interview/`);
      alert('Interview invitation sent successfully');
    } catch (error) {
      alert('Failed to send interview invitation');
    }
  };
  
  const handleHire = async () => {
    if (confirm('Are you sure you want to mark this candidate as hired?')) {
      try {
        await api.post(`/api/applicant-applications/${application.application_id}/hire/`);
        onStatusChange(application.application_id, 'hired');
      } catch (error) {
        alert('Failed to hire candidate');
      }
    }
  };
  
  return (
    <div className="candidate-actions">
      {application.status === 'shortlisted' && userRole === 'ceo' && (
        <button onClick={handleConfirm} className="btn-confirm">
          Confirm for Interview
        </button>
      )}
      
      {application.status === 'interview' && userRole === 'ceo' && (
        <>
          <button onClick={handleInviteInterview} className="btn-invite">
            Send Interview Invite
          </button>
          <button onClick={handleHire} className="btn-hire">
            Mark as Hired
          </button>
        </>
      )}
    </div>
  );
};
```

### 5. Bulk Operations Component

**Purpose:** Handle batch evaluation and other bulk operations.

**Features:**
- Select multiple applications
- Batch shortlisting evaluation
- Progress indicators for long-running operations
- Error handling and partial success reporting

**Implementation:**
```typescript
const BulkOperations: React.FC = () => {
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBatchEvaluate = async () => {
    if (selectedApplications.length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await api.post('/api/applicant-applications/batch-evaluate/', {
        // Optionally filter by position if all selected are for same position
      });
      
      alert(`Successfully evaluated ${response.data.evaluated} applications`);
      setSelectedApplications([]);
      // Refresh application list
      window.location.reload();
    } catch (error) {
      alert('Batch evaluation failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bulk-operations">
      <div className="selection-info">
        {selectedApplications.length} applications selected
      </div>
      
      <button 
        onClick={handleBatchEvaluate}
        disabled={isProcessing || selectedApplications.length === 0}
        className="btn-batch-evaluate"
      >
        {isProcessing ? 'Evaluating...' : 'Batch Evaluate Selected'}
      </button>
    </div>
  );
};
```

### 6. Error Handling and Loading States

**Common Error Scenarios:**
- AI evaluation service unavailable
- Insufficient permissions for CEO-only actions
- Network connectivity issues
- Invalid application states

**Implementation Pattern:**
```typescript
const useApiCall = <T,>(apiCall: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, execute };
};
```

### 7. State Management Considerations

**Recommended State Structure:**
```typescript
interface RecruitmentState {
  applications: {
    list: ApplicantApplication[];
    filters: ApplicationFilters;
    loading: boolean;
    error: string | null;
  };
  evaluations: {
    [applicationId: number]: AiEvaluation;
  };
  metrics: RecruitmentMetrics | null;
  bulkOperations: {
    selectedIds: number[];
    processing: boolean;
  };
}
```

### 8. Performance Optimizations

- Implement pagination for large application lists
- Cache AI evaluation results
- Use optimistic updates for status changes
- Debounce search/filter inputs
- Lazy load evaluation details

### 9. Accessibility Considerations

- Keyboard navigation for action buttons
- Screen reader support for status changes
- High contrast mode support for evaluation scores
- Clear loading indicators and error messages

### 10. Testing Strategy

**Unit Tests:**
- API response parsing
- State management logic
- Permission-based UI rendering

**Integration Tests:**
- Full shortlisting workflow
- Error handling scenarios
- Bulk operations

**E2E Tests:**
- Complete candidate journey from application to hire
- Cross-browser compatibility</content>
<parameter name="filePath">e:\Projects\HR-system-Backend\docs\shortlisting_api_frontend_plan.md