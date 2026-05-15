export type ComplaintCategory =
  | "WORKPLACE"
  | "PAYROLL"
  | "HARASSMENT"
  | "ATTENDANCE"
  | "OTHER";

export type ComplaintStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export interface Complaint {
  complaint_id: number;
  employee?: {
    id?: number;
    employee_id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  employee_name?: string;
  employee_email?: string;
  employee_department?: number | null;
  employee_department_name?: string | null;
  subject: string;
  category: ComplaintCategory;
  category_label?: string;
  details: string;
  desired_resolution?: string | null;
  status: ComplaintStatus;
  status_label?: string;
  requested_at?: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
  reviewed_by_name?: string | null;
  hr_comment?: string | null;
  [key: string]: unknown;
}

export interface CreateComplaintPayload {
  subject: string;
  category: ComplaintCategory;
  details: string;
  desired_resolution?: string | null;
}