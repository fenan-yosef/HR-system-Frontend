"use client";

import { useState, useEffect } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import { useToast } from "@/components/ui/toast";
import { fetchDepartmentsAll } from "@/services/departmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowRightLeft } from "lucide-react";
import type { Department } from "@/types/department";

export default function RequestTransferPage() {
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  const [formData, setFormData] = useState({
    to_department: "",
    reason: "",
    effective_date: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const departmentsRes = await fetchDepartmentsAll();
        setDepartments(departmentsRes.results);
      } catch (err) {
        console.error("Failed to load departments", err);
        toast("Failed to load departments.", "error");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [toast]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formData.to_department) {
      setError("Target department is required.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Reason for transfer is required.");
      return;
    }

    if (!formData.effective_date) {
      setError("Effective date is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: call your API here
      // await createTransferRequest(formData);

      toast("Transfer request submitted successfully.", "success");

      setFormData({
        to_department: "",
        reason: "",
        effective_date: "",
      });
    } catch (err) {
      console.error("Failed to submit transfer request", err);
      toast("Failed to submit transfer request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDepartments) {
    return (
      <RoleGuard allowedRoles={["EMPLOYEE"]}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["EMPLOYEE"]}>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Request Transfer
          </h1>
          <p className="text-muted-foreground">
            Submit a transfer request to move to a different department.
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-primary" />
              New Transfer Request
            </CardTitle>
            <CardDescription>
              HR will review your request and process the transfer once
              approved.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="to_department">To Department</Label>
                <select
                  id="to_department"
                  value={formData.to_department}
                  onChange={(e) =>
                    handleChange("to_department", e.target.value)
                  }
                  className="h-9 w-full rounded-md border px-3 py-1 text-sm"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option
                      key={dept.department_id}
                      value={dept.department_id.toString()}
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    handleChange("effective_date", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer</Label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className="min-h-[120px] w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Submitting
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}
