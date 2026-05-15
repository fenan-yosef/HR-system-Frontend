
import { apiFetch } from "@/services/apiClient";

export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department_name?: string;
  role_name?: string;
  national_id?: string;
  pension_id?: string;
  profile_photo_url?: string | null;
  onboarding_data?: {
    profile_photo_url?: string;
    [key: string]: unknown;
  };
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

const PROFILE_ENDPOINT = "/auth/profile/me/";
const PASSWORD_ENDPOINT = "/auth/profile/change-password/";

export function fetchProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>(PROFILE_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
  });
}

export function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  return apiFetch<ProfileData>(PROFILE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function changePassword(data: PasswordChangeData): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>(PASSWORD_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}
