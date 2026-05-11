export type BeneficiaryType = "MONEY" | "ITEM";

export interface Beneficiary {
  beneficiary_id: number;
  title: string;
  type: BeneficiaryType;
  amount?: number | null;
  item_description?: string | null;
  note?: string | null;
  recipients?: Array<{ employee_id: number; first_name: string; last_name: string; email: string; department_name?: string }>;
  department?: number | null;
  department_name?: string | null;
  created_by?: number | null;
  created_at?: string | null;
}
