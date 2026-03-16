notes to send to front end for a specific implementation

## New AI Features for Frontend Display

The AI evaluation now includes additional features that the frontend should display to enhance user experience:

### 1. Resume Summary
- **Field**: `summary` (string)
- **Display**: Show a concise summary of the candidate's resume in the evaluation details.
- **UI Suggestion**: Collapsible section titled "Resume Summary" with the text.

### 2. Skill Gaps Analysis
- **Field**: `skill_gaps` (object with keys: matched_skills, missing_skills, gaps)
- **Display**: 
  - List of matched skills (green checkmarks).
  - List of missing skills (red warnings).
  - Suggestions for gaps (e.g., "Consider online courses for Kubernetes").
- **UI Suggestion**: Tabs or sections: "Matched Skills", "Missing Skills", "Improvement Suggestions".

### 3. Interview Questions
- **Field**: `interview_questions` (array of strings)
- **Display**: List of generated interview questions tailored to the candidate.
- **UI Suggestion**: Button to "Generate Interview Questions" or display them in the evaluation panel.

### 4. Clustering
- **Field**: `cluster_id` (integer)
- **Display**: Show the cluster group the candidate belongs to for batch processing.
- **UI Suggestion**: Badge or tag showing "Cluster X" for grouping similar candidates.

### 5. Enhanced Evaluation Details
- All existing fields remain, plus the new ones.
- Ensure the evaluation API returns these fields in the response.

### API Endpoints
- GET /api/recruitment/evaluations/ - Includes all new fields.
- POST /api/recruitment/evaluations/ - For creating evaluations with new data.

### Frontend Implementation Notes
- Update the evaluation display components to show the new fields.
- Add interactive elements for skill gaps (e.g., links to learning resources).
- Ensure mobile responsiveness for the new sections.
- Add loading states for AI-generated content.
