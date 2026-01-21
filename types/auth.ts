export type UserRole =
  | "ADMIN"
  | "HR_MANAGER"
  | "EMPLOYEE"
  | "APPLICANT"
  | "UNKNOWN";

export interface BackendRole {
  role_id: number;
  role_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BackendUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: BackendRole;
  is_active: boolean;
  date_joined: string;
}

export interface DecodedTokenPayload {
  user_id?: number;
  role_id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  role_name?: string;
  roleId?: number;
  [key: string]: unknown;
}

export interface AuthUser {
  id: number | null;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: UserRole;
  roleName?: string;
  roleId?: number | null;
}

export interface AuthContextState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
