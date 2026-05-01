"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, PlusCircle, Search, ShieldAlert, Eye } from "lucide-react";
import { RoleGuard } from "@/context/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { fetchAllEmployees } from "@/services/employeeService";
import { getAllDisciplinaryActions } from "@/services/disciplinaryService";
import type { Employee } from "@/types/employee";
import type { DisciplinaryAction } from "@/types/disciplinary";
import {
  formatDate,
  formatLabel,
  getActionType,
  getDescription,
  getDeductionAmount,
  getEmployeeName,
  getSeverity,
  getStatus,
  getStatusStyles,
} from "@/components/disciplinary/disciplinary-utils";
import { cn } from "@/lib/utils";

function buildEmployeeNameMap(employees: Employee[]) {
  return employees.reduce<Record<number, string>>((acc, employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.trim();
    acc[employee.employee_id] = fullName || employee.email;
    return acc;
  }, {});
}

export default function DisciplinaryDashboardPage() {
  const [records, setRecords] = useState<DisciplinaryAction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryAction | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const [disciplinaryRecords, employeeList] = await Promise.all([
        getAllDisciplinaryActions(),
        fetchAllEmployees(),
      ]);

      setRecords(disciplinaryRecords);
      setEmployees(employeeList);
    } catch (err) {
      console.error("Failed to load disciplinary records", err);
      setError("Unable to load disciplinary records right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const employeeNames = useMemo(() => buildEmployeeNameMap(employees), [employees]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;

    return records.filter((record) => {
      const employeeId = Number((record as any).employee_id ?? record.employee?.employee_id ?? record.employee?.id);
      const employeeName =
        (Number.isFinite(employeeId) && employeeNames[employeeId]) ||
        getEmployeeName(record);

      return (
        employeeName.toLowerCase().includes(term) ||
        formatLabel(getActionType(record)).toLowerCase().includes(term) ||
        formatLabel(getSeverity(record)).toLowerCase().includes(term) ||
        getDescription(record).toLowerCase().includes(term)
      );
    });
  }, [records, search, employeeNames]);

  return (
    <RoleGuard allowedRoles={["HR_STAFF"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Disciplinary Records</h1>
            <p className="text-muted-foreground">
              Review all disciplinary actions and inspect the full record details.
            </p>
          </div>

          <Button asChild>
            <Link href={ROUTES.HR_CREATE_DISCIPLINARY}>
              <PlusCircle className="size-4" /> Create Action
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" /> Records Dashboard
            </CardTitle>
            <CardDescription>
              Search, view, and audit disciplinary actions across the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search employee, action, severity, or description"
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" onClick={loadRecords}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading records...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                No disciplinary records matched your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="border-b px-4 py-3 font-semibold">Employee Name</th>
                      <th className="border-b px-4 py-3 font-semibold">Action Type</th>
                      <th className="border-b px-4 py-3 font-semibold">Severity</th>
                      <th className="border-b px-4 py-3 font-semibold">Status</th>
                      <th className="border-b px-4 py-3 font-semibold">Created Date</th>
                      <th className="border-b px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const status = getStatus(record);
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
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                                getStatusStyles(status),
                              )}
                            >
                              {formatLabel(status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(record.created_at ?? record.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                              <Eye className="size-4" /> View details
                            </Button>
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

        <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Disciplinary Details</DialogTitle>
              <DialogDescription>
                Review the full action record before follow-up or escalation.
              </DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Employee</p>
                  <p className="font-medium">{employeeNames[Number((selectedRecord as any).employee_id ?? selectedRecord.employee?.employee_id ?? selectedRecord.employee?.id)] ?? getEmployeeName(selectedRecord)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Action Type</p>
                  <p className="font-medium">{formatLabel(getActionType(selectedRecord))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Severity</p>
                  <p className="font-medium">{formatLabel(getSeverity(selectedRecord))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <p className="font-medium">{formatLabel(getStatus(selectedRecord))}</p>
                </div>
                {getDeductionAmount(selectedRecord) !== null && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Deduction Amount</p>
                    <p className="font-medium">{String(getDeductionAmount(selectedRecord))}</p>
                  </div>
                )}
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">{getDescription(selectedRecord) || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Created Date</p>
                  <p className="font-medium">{formatDate(selectedRecord.created_at ?? selectedRecord.createdAt)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </RoleGuard>
  );
}