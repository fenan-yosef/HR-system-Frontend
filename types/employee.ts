export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: number;
  is_active: boolean;
  date_joined: string;
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
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: number;
}

export interface UpdateEmployee {
  first_name?: string;
  last_name?: string;
  phone?: string;
  position?: string;
  department?: number;
  is_active?: boolean;
}
