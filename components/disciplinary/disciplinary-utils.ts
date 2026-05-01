import type { DisciplinaryAction, DisciplinaryStatus } from "@/types/disciplinary";

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export function formatLabel(value?: string | null) {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getActionId(action: DisciplinaryAction): number | null {
  const id = (action as any).id ?? (action as any).disciplinary_action_id ?? (action as any).action_id;
  if (id === undefined || id === null) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getActionType(action: DisciplinaryAction) {
  return action.action_type ?? action.actionType ?? (action as any).type ?? (action as any).action;
}

export function getSeverity(action: DisciplinaryAction) {
  return action.severity ?? (action as any).severity_level ?? (action as any).level;
}

export function getStatus(action: DisciplinaryAction): DisciplinaryStatus | undefined {
  const raw = action.status ?? action.status_label ?? action.statusLabel;
  if (!raw) return undefined;
  const normalized = String(raw).toLowerCase();
  if (normalized === "pending" || normalized === "approved" || normalized === "rejected") {
    return normalized;
  }
  return undefined;
}

export function getDescription(action: DisciplinaryAction) {
  return action.description ?? (action as any).details ?? (action as any).notes ?? "";
}

export function getDeductionAmount(action: DisciplinaryAction) {
  return action.deduction_amount ?? action.deductionAmount ?? null;
}

export function getEmployeeName(action: DisciplinaryAction) {
  if (action.employee_name) return action.employee_name;
  if (action.employeeName) return action.employeeName;

  const employee = action.employee;
  if (!employee) return "Unknown";

  if (employee.full_name) return employee.full_name;

  const first = employee.first_name ?? "";
  const last = employee.last_name ?? "";
  const fullName = `${first} ${last}`.trim();
  return fullName || employee.email || "Unknown";
}

export function getStatusStyles(status?: DisciplinaryStatus) {
  if (status === "approved") {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }

  if (status === "rejected") {
    return "bg-red-500/10 text-red-600 border-red-500/20";
  }

  return "bg-amber-500/10 text-amber-600 border-amber-500/20";
}
