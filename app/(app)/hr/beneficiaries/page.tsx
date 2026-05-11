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

  useEffect(() => {
    async function loadLists() {
      try {
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
      }
    }
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
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Beneficiaries
          </h1>
          <p className="text-muted-foreground">
            Create and manage beneficiary distributions to employees or
            departments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Beneficiary</CardTitle>
            <CardDescription>
              Choose employees or a whole department to receive the beneficiary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-9 w-full rounded-md border px-3 py-1"
                >
                  <option value="MONEY">Money</option>
                  <option value="ITEM">Item</option>
                </select>
              </div>

              {type === "MONEY" && (
                <div>
                  <label className="text-sm font-bold">Amount</label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              )}

              {type === "ITEM" && (
                <div>
                  <label className="text-sm font-bold">Item Description</label>
                  <Input
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-bold">Note (optional)</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Choose Department (optional)
                </label>
                <select
                  value={selectedDepartment ?? ""}
                  onChange={(e) =>
                    setSelectedDepartment(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="h-9 w-full rounded-md border px-3 py-1"
                >
                  <option value="">-- Select department --</option>
                  {departments.map((d: any) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Or pick employees</label>
                <div className="max-h-48 overflow-auto border rounded p-2">
                  {employees.map((emp: any) => (
                    <div
                      key={emp.employee_id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employee_id)}
                        onChange={() => toggleEmployee(emp.employee_id)}
                      />
                      <span>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Beneficiary"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Beneficiaries</CardTitle>
            <CardDescription>
              Download recipient lists or review distributions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {beneficiaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No beneficiaries created yet.
                </p>
              ) : (
                beneficiaries.map((b) => (
                  <div
                    key={b.beneficiary_id}
                    className="rounded border p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">{b.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {b.type} {b.amount ? `• ${b.amount}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleExport(b.beneficiary_id)}>
                        Export CSV
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}
