"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiError, getApiErrorStatus } from "@/services/apiClient";
import {
  createEmployee,
  deleteEmployee,
  fetchAllEmployees,
  updateEmployee,
} from "@/services/employeeService";
import type {
  CreateEmployee,
  Employee,
  EmployeeStatus,
  EmploymentType,
  UpdateEmployee,
} from "@/types/employee";

const PAGE_SIZE = 10;

const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = [
  "full_time",
  "contract",
  "intern",
  "part_time",
];
const STATUS_OPTIONS: EmployeeStatus[] = [
  "active",
  "on_leave",
  "suspended",
  "terminated",
];

type FormMode = "create" | "edit";

interface EmployeeFormState {
  user: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employment_type: EmploymentType;
  hire_date: string;
  status: EmployeeStatus;
}

const defaultFormState: EmployeeFormState = {
  user: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  employment_type: "full_time",
  hire_date: "",
  status: "active",
};

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}`.trim() || "?";
}

function toFormState(employee: Employee): EmployeeFormState {
  return {
    user: employee.user ? String(employee.user) : "",
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone ?? "",
    department: employee.department ? String(employee.department) : "",
    position: employee.position ?? "",
    employment_type: employee.employment_type,
    hire_date: employee.hire_date,
    status: employee.status,
  };
}

function toCreatePayload(form: EmployeeFormState): CreateEmployee {
  const parsedUser = Number(form.user);
  const parsedDepartment = Number(form.department);

  return {
    user:
      form.user.trim() && Number.isInteger(parsedUser) && parsedUser > 0
        ? parsedUser
        : undefined,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    department:
      form.department.trim() &&
      Number.isInteger(parsedDepartment) &&
      parsedDepartment > 0
        ? parsedDepartment
        : undefined,
    position: form.position.trim() || undefined,
    employment_type: form.employment_type,
    hire_date: form.hire_date,
    status: form.status,
  };
}

function toUpdatePayload(form: EmployeeFormState): UpdateEmployee {
  const parsedUser = Number(form.user);
  const parsedDepartment = Number(form.department);

  return {
    user:
      form.user.trim() && Number.isInteger(parsedUser) && parsedUser > 0
        ? parsedUser
        : undefined,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    department:
      form.department.trim() &&
      Number.isInteger(parsedDepartment) &&
      parsedDepartment > 0
        ? parsedDepartment
        : undefined,
    position: form.position.trim() || undefined,
    employment_type: form.employment_type,
    hire_date: form.hire_date,
    status: form.status,
  };
}

function validateForm(form: EmployeeFormState) {
  const errors: Partial<Record<keyof EmployeeFormState, string>> = {};

  if (!form.first_name.trim()) errors.first_name = "First name is required.";
  if (!form.last_name.trim()) errors.last_name = "Last name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.hire_date.trim()) errors.hire_date = "Hire date is required.";

  return errors;
}

function mapApiValidationErrors(error: unknown) {
  const mapped: Partial<Record<keyof EmployeeFormState, string>> = {};

  if (!(error instanceof ApiError) || !error.detail) {
    return mapped;
  }

  try {
    const payload = JSON.parse(error.detail) as Record<
      string,
      string[] | string | undefined
    >;

    const fieldMap: Record<string, keyof EmployeeFormState> = {
      user: "user",
      first_name: "first_name",
      last_name: "last_name",
      email: "email",
      phone: "phone",
      department: "department",
      position: "position",
      employment_type: "employment_type",
      hire_date: "hire_date",
      status: "status",
    };

    for (const [apiKey, formKey] of Object.entries(fieldMap)) {
      const value = payload[apiKey];
      if (!value) continue;
      mapped[formKey] = Array.isArray(value) ? value[0] : value;
    }
  } catch {
    return mapped;
  }

  return mapped;
}

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formState, setFormState] =
    useState<EmployeeFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof EmployeeFormState, string>>
  >({});
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(
    null,
  );

  const totalCount = employees.length;

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return employees.slice(start, start + PAGE_SIZE);
  }, [employees, page]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalCount / PAGE_SIZE);
    return pages > 0 ? pages : 1;
  }, [totalCount]);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const allEmployees = await fetchAllEmployees();
      setEmployees(allEmployees);

      const maxPages = Math.max(1, Math.ceil(allEmployees.length / PAGE_SIZE));
      if (page > maxPages) {
        setPage(maxPages);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);

      const status = getApiErrorStatus(error);
      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status === 403) {
        toast("You do not have permission to view employees.", "error");
        return;
      }

      toast("Unable to load employees.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees, refreshKey]);

  const openCreate = () => {
    setFormMode("create");
    setEditingEmployeeId(null);
    setFormState(defaultFormState);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setFormMode("edit");
    setEditingEmployeeId(employee.employee_id);
    setFormState(toFormState(employee));
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
  };

  const onChangeForm = <K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(formState);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      if (formMode === "create") {
        await createEmployee(toCreatePayload(formState));
        toast("Employee created successfully.", "success");
      } else if (editingEmployeeId !== null) {
        await updateEmployee(editingEmployeeId, toUpdatePayload(formState));
        toast("Employee updated successfully.", "success");
      }

      setFormOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Employee save failed", error);

      const status = getApiErrorStatus(error);
      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status === 403) {
        toast("You do not have permission to perform this action.", "error");
        return;
      }

      const backendFieldErrors = mapApiValidationErrors(error);
      if (status === 400 && Object.keys(backendFieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...backendFieldErrors }));
        toast("Please correct the highlighted fields.", "warning");
        return;
      }

      toast("Failed to save employee.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingEmployeeId(employee.employee_id);
      await deleteEmployee(employee.employee_id);
      toast("Employee deleted successfully.", "success");

      setEmployees((prev) =>
        prev.filter((item) => item.employee_id !== employee.employee_id),
      );

      if (paginatedEmployees.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Employee delete failed", error);

      const status = getApiErrorStatus(error);
      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status === 403) {
        toast("You do not have permission to delete employees.", "error");
        return;
      }

      toast("Failed to delete employee.", "error");
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Employee Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Create, update, and manage employee records.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Employees</CardTitle>
          <CardDescription>Total records: {totalCount}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Employee</th>
                  <th className="px-4 py-3 text-left font-medium">Position</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Hire Date</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Loading employees...
                      </span>
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.employee_id} className="border-t">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(
                              employee.first_name,
                              employee.last_name,
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {employee.email}
                            </p>
                            {employee.phone ? (
                              <p className="text-muted-foreground text-xs">
                                {employee.phone}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {employee.position || "-"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {humanize(employee.employment_type)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="rounded-full border px-2 py-1 text-xs">
                          {humanize(employee.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {employee.hire_date || "-"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(employee)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(employee)}
                            disabled={
                              deletingEmployeeId === employee.employee_id
                            }
                          >
                            {deletingEmployeeId === employee.employee_id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <Card className="max-h-[92vh] w-full max-w-2xl overflow-auto py-0">
            <CardHeader className="sticky top-0 z-10 border-b bg-card py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>
                    {formMode === "create" ? "Add Employee" : "Edit Employee"}
                  </CardTitle>
                  <CardDescription>
                    {formMode === "create"
                      ? "Create a new employee record."
                      : "Update the employee information."}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeForm}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={onSubmitForm}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="first_name">
                      First Name *
                    </label>
                    <Input
                      id="first_name"
                      value={formState.first_name}
                      onChange={(event) =>
                        onChangeForm("first_name", event.target.value)
                      }
                    />
                    {formErrors.first_name ? (
                      <p className="text-destructive text-xs">
                        {formErrors.first_name}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="last_name">
                      Last Name *
                    </label>
                    <Input
                      id="last_name"
                      value={formState.last_name}
                      onChange={(event) =>
                        onChangeForm("last_name", event.target.value)
                      }
                    />
                    {formErrors.last_name ? (
                      <p className="text-destructive text-xs">
                        {formErrors.last_name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="email">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(event) =>
                        onChangeForm("email", event.target.value)
                      }
                    />
                    {formErrors.email ? (
                      <p className="text-destructive text-xs">
                        {formErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="phone">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      value={formState.phone}
                      onChange={(event) =>
                        onChangeForm("phone", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="position">
                      Position
                    </label>
                    <Input
                      id="position"
                      value={formState.position}
                      onChange={(event) =>
                        onChangeForm("position", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="department">
                      Department ID
                    </label>
                    <Input
                      id="department"
                      type="number"
                      value={formState.department}
                      onChange={(event) =>
                        onChangeForm("department", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium"
                      htmlFor="employment_type"
                    >
                      Employment Type
                    </label>
                    <select
                      id="employment_type"
                      value={formState.employment_type}
                      onChange={(event) =>
                        onChangeForm(
                          "employment_type",
                          event.target.value as EmploymentType,
                        )
                      }
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    >
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {humanize(option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formState.status}
                      onChange={(event) =>
                        onChangeForm(
                          "status",
                          event.target.value as EmployeeStatus,
                        )
                      }
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {humanize(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="hire_date">
                      Hire Date *
                    </label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formState.hire_date}
                      onChange={(event) =>
                        onChangeForm("hire_date", event.target.value)
                      }
                    />
                    {formErrors.hire_date ? (
                      <p className="text-destructive text-xs">
                        {formErrors.hire_date}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="user">
                      User ID
                    </label>
                    <Input
                      id="user"
                      type="number"
                      value={formState.user}
                      onChange={(event) =>
                        onChangeForm("user", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {formMode === "create" ? "Create Employee" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
