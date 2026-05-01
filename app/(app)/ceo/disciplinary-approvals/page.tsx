"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { RoleGuard } from "@/context/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { approveDisciplinaryAction, getAllDisciplinaryActions, rejectDisciplinaryAction } from "@/services/disciplinaryService";
import { fetchAllEmployees } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import type { DisciplinaryAction } from "@/types/disciplinary";
import {
  formatDate,
  formatLabel,
  getActionType,
  getDescription,
  getEmployeeName,
  getSeverity,
  getStatus,
  getStatusStyles,
} from "@/components/disciplinary/disciplinary-utils";
import { cn } from "@/lib/utils";

type PendingAction = {
  kind: "approve" | "reject";
  record: DisciplinaryAction;
} | null;

function buildEmployeeNameMap(employees: Employee[]) {
  return employees.reduce<Record<number, string>>((acc, employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.trim();
    acc[employee.employee_id] = fullName || employee.email;
    return acc;
  }, {});
}

export default function DisciplinaryApprovalsPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<DisciplinaryAction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const [disciplinaryRecords, employeeList] = await Promise.all([
        getAllDisciplinaryActions(),
        fetchAllEmployees(),
      ]);

      setRecords(disciplinaryRecords.filter((record) => getStatus(record) === "pending"));
      setEmployees(employeeList);
    } catch (err) {
      console.error("Failed to load approval records", err);
      setError("Unable to load pending disciplinary approvals right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const employeeNames = useMemo(() => buildEmployeeNameMap(employees), [employees]);

  const handleAction = async () => {
    if (!pendingAction) return;

    const recordId = Number(pendingAction.record.id);
    if (!Number.isFinite(recordId)) {
      toast("Disciplinary record id is missing.", "error");
      return;
    }

    setActionLoadingId(recordId);
    try {
      if (pendingAction.kind === "approve") {
        await approveDisciplinaryAction(recordId);
        toast("Disciplinary action approved.", "success");
      } else {
        await rejectDisciplinaryAction(recordId);
        toast("Disciplinary action rejected.", "success");
      }

      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      setPendingAction(null);
    } catch (err) {
      console.error("Failed to update disciplinary approval", err);
      toast("Unable to process the disciplinary approval.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["HR_CEO"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Disciplinary Approvals</h1>
          <p className="text-muted-foreground">
            Review pending disciplinary actions and approve or reject them with a confirmation step.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Pending Approvals
            </CardTitle>
            <CardDescription>
              Only records awaiting CEO approval are shown here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading approvals...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                There are no pending disciplinary approvals at the moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="border-b px-4 py-3 font-semibold">Employee Name</th>
                      <th className="border-b px-4 py-3 font-semibold">Action Type</th>
                      <th className="border-b px-4 py-3 font-semibold">Severity</th>
                      <th className="border-b px-4 py-3 font-semibold">Description</th>
                      <th className="border-b px-4 py-3 font-semibold">Date</th>
                      <th className="border-b px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => {
                      const recordId = Number(record.id);
                      const employeeId = Number((record as any).employee_id ?? record.employee?.employee_id ?? record.employee?.id);
                      const employeeName =
                        (Number.isFinite(employeeId) && employeeNames[employeeId]) || getEmployeeName(record);

                      return (
                        <tr key={record.id ?? index} className="border-b last:border-b-0">
                          <td className="px-4 py-4 text-sm font-medium text-foreground">{employeeName}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatLabel(getActionType(record))}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatLabel(getSeverity(record))}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            <p className="max-w-xl break-words">{getDescription(record) || "-"}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(record.created_at ?? record.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                disabled={actionLoadingId === recordId}
                                onClick={() => setPendingAction({ kind: "approve", record })}
                              >
                                <ShieldCheck className="size-4" /> Approve
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={actionLoadingId === recordId}
                                onClick={() => setPendingAction({ kind: "reject", record })}
                              >
                                <ShieldX className="size-4" /> Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingAction?.kind === "approve" ? "Approve disciplinary action?" : "Reject disciplinary action?"}
              </DialogTitle>
              <DialogDescription>
                {pendingAction
                  ? `${formatLabel(getActionType(pendingAction.record))} for ${
                      employeeNames[
                        Number(
                          (pendingAction.record as any).employee_id ?? pendingAction.record.employee?.employee_id ?? pendingAction.record.employee?.id,
                        )
                      ] ?? getEmployeeName(pendingAction.record)
                    } will be ${pendingAction.kind === "approve" ? "approved" : "rejected"}.`
                  : "Confirm your decision to continue."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPendingAction(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAction} disabled={actionLoadingId === pendingAction?.record.id}>
                {actionLoadingId === pendingAction?.record.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Processing
                  </span>
                ) : pendingAction?.kind === "approve" ? (
                  "Approve"
                ) : (
                  "Reject"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </RoleGuard>
  );
}