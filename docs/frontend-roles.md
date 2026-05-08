# Frontend Integration Guide — AI Screening Dashboard

This guide explains the **intent and logic** behind the screening UI, and exactly how the frontend should implement these features.

---

## 🚀 1. The Async Screening Workflow
AI screening is an "Asynchronous Task" because LLMs take time. Your frontend must handle this without freezing the UI or assuming immediate results.

### Step-by-Step Logic:
1.  **Trigger (The "Start" Button):**
    -   Admin clicks "Screen All Applicants" in a Job View.
    -   Frontend calls `POST /api/recruitment/screening/start/{job_position_id}/`.
    -   **Front-end Note:** Store the returned `id` (Screening Job ID) in your local state (e.g., Redux, Vuex, or LocalState).
2.  **Polling (The Progress Bar):**
    -   Use a `setInterval` (or a React `useEffect` with Cleanup) to call `GET /api/recruitment/screening/progress/{job_id}/` every 2 seconds.
    -   **UI Logic:**
        -   Display a loading bar or circular progress using `progress_percent`.
        -   Show a "Live Status" label: "Analyzing: [current_applicant]..." to show work is active.
3.  **Completion:**
    -   When `status === "completed"`, clear your interval timer.
    -   Trigger a data refresh or navigate the user to the "Results" tab.

---

## 📊 2. Building the "Screening Report" UI
Don't just show a list of names. Use the rich AI data to provide "Decision Support."

### The Score Gauge
-   **Field:** `overall_score` (0-100).
-   **Note:** Use a **color-graded scale** for instant visual sorting:
    -   **80-100:** Dark Green (Strong Fit)
    -   **60-79:** Light Green/Blue (Qualified)
    -   **40-59:** Amber (Needs Review)
    -   **0-39:** Red (Low Match)

### The Pro/Con Insights Panel
-   **Fields:** `key_strengths` (array), `key_weaknesses` (array).
-   **Note:** Display these as two columns with bullet points. This is the #1 feature HR uses to decide who to call. Use a checkmark icon for strengths and a warning icon for weaknesses.

### The "AI Audit" Modal (Transparency)
-   **Field:** `raw_llm_response`.
-   **Note:** If HR questions a score, provide a "View AI Logic" button. This opens a modal showing the raw text response from the model. This builds trust by showing the AI's "thought process."

---

## 📂 3. Managing the Applications Page
This is the central hub. Instead of local sorting, use the API's powerful query params.

### Implementation Tips:
-   **Server-Side Sorting:** To show top-ranking candidates first, always include `ordering=-screening_result__overall_score` (or similar) in your list GET call.
-   **Filter Sidebar:** Implement a sidebar with sliders for `Min Score` (e.g., 0 to 100) that updates the `min_score` query param in real-time.
-   **Status Badges:** Map `hard_criteria_met` to a clear visual badge. If `false`, the candidate should be visually de-prioritized or marked as "Failed Requirements."

---

## 💡 Error Handling & UX
-   **Offline AI:** If the AI service is offline, the status will go to `error`. Show a "🤖 AI Service Offline" toast to the user.
-   **Retry Logic:** If a specific applicant fails screening (e.g., bad PDF), allow the HR user to click a "Re-try Extraction" button on that specific row.
-   **Empty States:** If no screening has been run yet, show a clear "Click to analyze applicants" hero button instead of an empty table.
