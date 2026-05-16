"use client";

import { useEffect, useState } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, apiDownload } from "@/services/apiClient";
import {
  createBeneficiary,
  getAllBeneficiaries,
} from "@/services/beneficiaryService";
import type { Beneficiary } from "@/types/beneficiary";
import { Gift, Loader2, Search } from "lucide-react";

export default function HRBeneficiariesPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("MONEY");
  const [amount, setAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [note, setNote] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null,
  );
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = async () => {
    try {
      setIsLoadingPage(true);
      setError(null);
      const emps = await apiFetch<any>("employees", {
        method: "GET",
        requiresAuth: true,
      });
      const depts = await apiFetch<any>("departments", {
        method: "GET",
        requiresAuth: true,
      });
      setEmployees(
        Array.isArray(emps) ? emps : (emps.results ?? emps.data ?? []),
      );
      setDepartments(
        Array.isArray(depts) ? depts : (depts.results ?? depts.data ?? []),
      );
      const bens = await getAllBeneficiaries();
      setBeneficiaries(bens);
    } catch (err) {
      console.error("Failed to load lists", err);
      setError("Unable to load data. Please try again.");
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    void loadLists();
  }, []);

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        title,
        type,
      };
      if (type === "MONEY") payload.amount = amount ? Number(amount) : null;
      if (type === "ITEM") payload.item_description = itemDescription || null;
      if (note) payload.note = note;
      if (selectedEmployees.length) payload.employee_ids = selectedEmployees;
      if (selectedDepartment) payload.department_id = selectedDepartment;

      const created = await createBeneficiary(payload);
      setBeneficiaries((prev) => [created, ...prev]);
      // reset form
      setTitle("");
      setAmount("");
      setItemDescription("");
      setNote("");
      setSelectedEmployees([]);
      setSelectedDepartment(null);
    } catch (err) {
      console.error("Failed to create beneficiary", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: number) => {
    try {
      const url = `/api/beneficiaries/${id}/export/`;
      const blobUrl = await apiDownload(url);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `beneficiary_${id}_recipients.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <RoleGuard allowedRoles={["HR_STAFF", "ADMIN"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Beneficiaries
            </h1>
            <p className="text-muted-foreground">
              Create and manage beneficiary distributions to employees or
              departments.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={loadLists}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Create Beneficiary</CardTitle>
              <CardDescription>
                Distribute to employees or department.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Beneficiary title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="MONEY">Money</option>
                    <option value="ITEM">Item</option>
                  </select>
                </div>

                {type === "MONEY" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}

                {type === "ITEM" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Item Description
                    </label>
                    <Input
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Describe the item"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Note (optional)
                  </label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Department (optional)
                  </label>
                  <select
                    value={selectedDepartment ?? ""}
                    onChange={(e) =>
                      setSelectedDepartment(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">-- Select department --</option>
                    {departments.map((d: any) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Or pick employees
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background p-3 space-y-2">
                    {employees.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No employees available
                      </p>
                    ) : (
                      employees.map((emp: any) => (
                        <label
                          key={emp.employee_id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(
                              emp.employee_id,
                            )}
                            onChange={() => toggleEmployee(emp.employee_id)}
                            className="rounded"
                          />
                          <span className="text-foreground">
                            {emp.first_name} {emp.last_name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={loading || !title}>
                    {loading ? "Creating..." : "Create Beneficiary"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="size-5 text-primary" />
                Existing Beneficiaries
              </CardTitle>
              <CardDescription>
                Download recipient lists or review distributions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title or type"
                    className="pl-9"
                  />
                </div>
              </div>

              {isLoadingPage ? (
                <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" /> Loading
                  beneficiaries...
                </div>
              ) : error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : beneficiaries.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                  No beneficiaries created yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {beneficiaries
                    .filter((b) =>
                      b.title.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((b) => (
                      <div
                        key={b.beneficiary_id}
                        className="rounded-lg border bg-card/50 p-4 flex items-center justify-between hover:bg-card transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">
                            {b.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type: {b.type}{" "}
                            {b.amount ? `• Amount: ${b.amount}` : ""}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleExport(b.beneficiary_id)}
                          variant="outline"
                          size="sm"
                        >
                          Export CSV
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </RoleGuard>
  );
}
