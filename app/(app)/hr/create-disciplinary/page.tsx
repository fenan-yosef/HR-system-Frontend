"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
import { RoleGuard } from "@/context/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { fetchAllEmployees } from "@/services/employeeService";
import { createDisciplinaryAction } from "@/services/disciplinaryService";
import type { Employee } from "@/types/employee";
import type {
  CreateDisciplinaryActionPayload,
  DisciplinaryActionType,
  DisciplinarySeverity,
} from "@/types/disciplinary";
import { formatLabel } from "@/components/disciplinary/disciplinary-utils";

const ACTION_TYPES: DisciplinaryActionType[] = ["WARNING", "DEDUCTION", "SUSPENSION", "TERMINATION"];
const SEVERITIES: DisciplinarySeverity[] = ["LOW", "MEDIUM", "HIGH"];

export default function CreateDisciplinaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    action_type: "WARNING" as DisciplinaryActionType,
    severity: "LOW" as DisciplinarySeverity,
    description: "",
    deduction_amount: "",
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to load employees", err);
        setError("Unable to load employees for the dropdown.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((left, right) => {
        const leftName = `${left.first_name} ${left.last_name}`.trim().toLowerCase();
        const rightName = `${right.first_name} ${right.last_name}`.trim().toLowerCase();
        return leftName.localeCompare(rightName);
      }),
    [employees],
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const employeeId = Number(formData.employee_id);
    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      setError("Please select an employee.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (formData.action_type === "DEDUCTION") {
      const deduction = Number(formData.deduction_amount);
      if (!formData.deduction_amount || !Number.isFinite(deduction) || deduction <= 0) {
        setError("Deduction amount is required for deduction actions.");
        return;
      }
    }

    const payload: CreateDisciplinaryActionPayload = {
      employee_id: employeeId,
      action_type: formData.action_type,
      severity: formData.severity,
      description: formData.description.trim(),
      deduction_amount:
        formData.action_type === "DEDUCTION" ? formData.deduction_amount.trim() : null,
    };

    try {
      setIsSubmitting(true);
      await createDisciplinaryAction(payload);
      toast("Disciplinary action created successfully.", "success");
      router.push(ROUTES.HR_DISCIPLINARY);
    } catch (err) {
      console.error("Failed to create disciplinary action", err);
      toast("Failed to create disciplinary action.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["HR_STAFF"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Create Disciplinary Action</h1>
          <p className="text-muted-foreground">
            Record a new warning, deduction, suspension, or termination for an employee.
          </p>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-5 text-primary" /> New Action
            </CardTitle>
            <CardDescription>
              Complete the form below to submit a disciplinary record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEmployees ? (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading employees...
              </div>
            ) : error && sortedEmployees.length === 0 ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Select Employee</Label>
                    <select
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(event) => handleChange("employee_id", event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      <option value="">Select employee</option>
                      {sortedEmployees.map((employee) => (
                        <option key={employee.employee_id} value={employee.employee_id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action_type">Action Type</Label>
                    <select
                      id="action_type"
                      value={formData.action_type}
                      onChange={(event) => handleChange("action_type", event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {ACTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <select
                      id="severity"
                      value={formData.severity}
                      onChange={(event) => handleChange("severity", event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {SEVERITIES.map((severity) => (
                        <option key={severity} value={severity}>
                          {formatLabel(severity)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.action_type === "DEDUCTION" && (
                    <div className="space-y-2">
                      <Label htmlFor="deduction_amount">Deduction Amount</Label>
                      <Input
                        id="deduction_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.deduction_amount}
                        onChange={(event) => handleChange("deduction_amount", event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    placeholder="Describe the incident or reason for the disciplinary action"
                    className="min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Use the records dashboard to review submitted actions after creation.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" asChild>
                      <Link href={ROUTES.HR_DISCIPLINARY}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" /> Saving
                        </span>
                      ) : (
                        "Create Action"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}