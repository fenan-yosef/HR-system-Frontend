export type AttendanceStatus = "present" | "active";

export interface AttendanceGeoLog {
  geo_id: number;
  attendance: number;
  latitude: string;
  longitude: string;
  accuracy_m: string | null;
  captured_at: string;
}

export interface AttendanceLog {
  attendance_id: number;
  employee: number;
  check_in: string;
  check_out: string | null;
  work_hours: string | null;
  location: string | null;
  created_at: string;
  geo_logs: AttendanceGeoLog[];
}

export interface AttendanceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AttendanceLog[];
}

export interface AttendanceCreatePayload {
  employee?: number;
  check_in: string;
  check_out?: string | null;
  location?: string | null;
}

export interface AttendanceUpdatePayload {
  check_in?: string;
  check_out?: string | null;
  location?: string | null;
}

export interface AttendanceEntry {
  attendanceId: number;
  dateKey: string;
  checkIn: string;
  checkInAt: string;
  checkOut: string | null;
  checkOutAt: string | null;
  totalMinutes: number;
  status: AttendanceStatus;
  location: string | null;
}
