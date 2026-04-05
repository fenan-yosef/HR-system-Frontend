export interface Department {
  department_id: number;
  name: string;
  code?: string;
  manager?: number | null;
  manager_name?: string | null;
  manager_detail?: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
  } | null;
  created_at: string;
}

export interface ManagerDropdownItem {
  employee_id: number;
  full_name: string;
  email: string;
  department_id: number | null;
  position: string;
  status: string;
}

export interface CreateDepartment {
  name: string;
  code?: string;
  manager?: number | null;
}

export type UpdateDepartment = Partial<CreateDepartment>;
