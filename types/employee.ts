export type EmploymentType = "full_time" | "contract" | "intern" | "part_time";
export type EmployeeStatus = "active" | "on_leave" | "suspended" | "terminated";

export interface Employee {
  employee_id: number;
  user?: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: number | null;
  position?: string;
  employment_type: EmploymentType;
  hire_date: string;
  status: EmployeeStatus;
  national_id?: string | null;
  onboarding_completion: number;
  onboarding_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface User {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: number;
  is_active?: boolean;
  date_joined?: string;
}


export interface CreateEmployee {
  user?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: number;
  employment_type?: EmploymentType;
  hire_date: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployee {
  user?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: number;
  employment_type?: EmploymentType;
  hire_date?: string;
  status?: EmployeeStatus;
  national_id?: string;
  onboarding_data?: Record<string, any>;
}
