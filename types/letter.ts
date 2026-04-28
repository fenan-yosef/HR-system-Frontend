export type LetterType = "verification" | "experience";

export type LetterStatus = "pending" | "approved" | "rejected";

export interface LetterRequest {
  id: number;
  letter_type?: LetterType;
  letterType?: LetterType;
  status?: LetterStatus;
  status_label?: string;
  statusLabel?: string;
  purpose?: string | null;
  target_company?: string | null;
  requested_at?: string;
  requestedAt?: string;
  created_at?: string;
  updated_at?: string;
  generated_file_url?: string | null;
  generatedFileUrl?: string | null;
  employee_name?: string;
  employeeName?: string;
  employee?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

export interface CreateLetterRequestPayload {
  letter_type: LetterType;
  purpose: string;
  target_company: string;
}
