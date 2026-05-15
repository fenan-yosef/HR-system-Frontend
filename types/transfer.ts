import { Department } from "./department";

export interface TransferRequest {
  transfer_request_id: number;
  employee: any;
  current_department: Department | null;
  target_department: Department | null;
  current_position: string | null;
  requested_position: string | null;
  reason: string;
  status: string;
  requested_at: string;
  hr_reviewed_at?: string | null;
  ceo_reviewed_at?: string | null;
  reviewed_by_hr?: any;
  approved_by_ceo?: any;
  hr_comment?: string | null;
  ceo_comment?: string | null;
}
