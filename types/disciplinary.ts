export type DisciplinaryActionType = "WARNING" | "DEDUCTION" | "SUSPENSION" | "TERMINATION";

export type DisciplinarySeverity = "LOW" | "MEDIUM" | "HIGH";

export type DisciplinaryStatus = "pending" | "approved" | "rejected";

export interface DisciplinaryActionEmployee {
  id?: number;
  employee_id?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
}

export interface DisciplinaryAction {
  id: number;
  employee_id?: number;
  employee_name?: string;
  employeeName?: string;
  employee?: DisciplinaryActionEmployee;
  action_type?: DisciplinaryActionType;
  actionType?: DisciplinaryActionType;
  severity?: DisciplinarySeverity;
  status?: DisciplinaryStatus | string;
  status_label?: string;
  statusLabel?: string;
  description?: string;
  deduction_amount?: string | number | null;
  deductionAmount?: string | number | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateDisciplinaryActionPayload {
  employee_id: number;
  action_type: DisciplinaryActionType;
  severity: DisciplinarySeverity;
  description: string;
  deduction_amount?: string | number | null;
}