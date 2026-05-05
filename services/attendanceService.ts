import { apiFetch } from "@/services/apiClient";
import type {
  AttendanceCreatePayload,
  AttendanceEntry,
  AttendanceListResponse,
  AttendanceLog,
  AttendanceUpdatePayload,
} from "@/types/attendance";

const ATTENDANCE_ENDPOINT = "/attendance-logs/";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(value: Date) {
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function differenceInMinutes(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

export function summarizeAttendanceLog(log: AttendanceLog, referenceNow = new Date()): AttendanceEntry {
  const checkIn = new Date(log.check_in);
  const checkOut = log.check_out ? new Date(log.check_out) : null;
  const hasClosedSession = Boolean(checkOut);
  const workHours = log.work_hours ? Number(log.work_hours) : null;
  const totalMinutes =
    workHours !== null && !Number.isNaN(workHours)
      ? Math.max(0, Math.round(workHours * 60))
      : checkOut
        ? differenceInMinutes(checkIn, checkOut)
        : differenceInMinutes(checkIn, referenceNow);

  return {
    attendanceId: log.attendance_id,
    dateKey: getDateKey(checkIn),
    checkIn: formatTime(checkIn),
    checkInAt: log.check_in,
    checkOut: checkOut ? formatTime(checkOut) : null,
    checkOutAt: log.check_out,
    totalMinutes,
    status: hasClosedSession ? "present" : "active",
    location: log.location,
  };
}

export async function fetchAttendanceLogPage(): Promise<AttendanceListResponse> {
  return apiFetch<AttendanceListResponse>(ATTENDANCE_ENDPOINT, {
    requiresAuth: true,
  });
}

export async function fetchAttendanceLogs(): Promise<AttendanceLog[]> {
  const response = await fetchAttendanceLogPage();
  return response.results ?? [];
}

export function createAttendanceLog(data: AttendanceCreatePayload): Promise<AttendanceLog> {
  return apiFetch<AttendanceLog>(ATTENDANCE_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function updateAttendanceLog(
  attendanceId: number,
  data: AttendanceUpdatePayload,
): Promise<AttendanceLog> {
  return apiFetch<AttendanceLog>(`${ATTENDANCE_ENDPOINT}${attendanceId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}
