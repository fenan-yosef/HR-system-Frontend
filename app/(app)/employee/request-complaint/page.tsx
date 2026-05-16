"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquareText, Clock3 } from "lucide-react";
import { createComplaint, getMyComplaints } from "@/services/complaintService";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from "@/types/complaint";

const COMPLAINT_CATEGORIES: Array<{ value: ComplaintCategory; label: string }> =
  [
    { value: "WORKPLACE", label: "Workplace" },
    { value: "PAYROLL", label: "Payroll" },
    { value: "HARASSMENT", label: "Harassment" },
    { value: "ATTENDANCE", label: "Attendance" },
    { value: "OTHER", label: "Other" },
  ];

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

function formatLabel(value?: string | null) {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getStatusBadgeClass(status: ComplaintStatus) {
  if (status === "RESOLVED")
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  if (status === "REJECTED")
    return "border-red-500/20 bg-red-500/10 text-red-700";
  if (status === "IN_REVIEW")
    return "border-blue-500/20 bg-blue-500/10 text-blue-700";
  return "border-amber-500/20 bg-amber-500/10 text-amber-700";
}

export default function RequestComplaintPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "WORKPLACE" as ComplaintCategory,
    details: "",
    desired_resolution: "",
  });

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setIsLoadingComplaints(true);
        setError(null);
        const data = await getMyComplaints();
        setComplaints(data || []);
      } catch (err) {
        console.error("Failed to load complaints", err);
        setComplaints([]);
        // Don't show toast on initial load failure - user can still submit
      } finally {
        setIsLoadingComplaints(false);
      }
    };

    loadComplaints();
  }, []);

  const sortedComplaints = useMemo(
    () =>
      [...complaints].sort((a, b) =>
        (b.requested_at ?? "").localeCompare(a.requested_at ?? ""),
      ),
    [complaints],
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formData.subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!formData.details.trim()) {
      setError("Complaint details are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createComplaint({
        subject: formData.subject.trim(),
        category: formData.category,
        details: formData.details.trim(),
        desired_resolution: formData.desired_resolution.trim() || null,
      });
      setError(null);
      setFormData({
        subject: "",
        category: "WORKPLACE",
        details: "",
        desired_resolution: "",
      });
      const refreshed = await getMyComplaints();
      setComplaints(refreshed || []);
    } catch (err) {
      console.error("Failed to submit complaint", err);
      setError("Failed to submit complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["EMPLOYEE"]}>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Submit Complaint
          </h1>
          <p className="text-muted-foreground">
            Send a complaint to HR with the details they need to review it
            properly.
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-primary" />
              New Complaint
            </CardTitle>
            <CardDescription>
              HR staff will receive this complaint and can review it from the HR
              dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value)
                  }
                  className="h-9 w-full rounded-md border px-3 py-1 text-sm"
                >
                  {COMPLAINT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(event) =>
                    handleChange("subject", event.target.value)
                  }
                  placeholder="Short summary of the issue"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <textarea
                  id="details"
                  value={formData.details}
                  onChange={(event) =>
                    handleChange("details", event.target.value)
                  }
                  placeholder="Explain what happened, when it happened, and who was involved"
                  className="min-h-40 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired_resolution">
                  Desired Resolution{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="desired_resolution"
                  value={formData.desired_resolution}
                  onChange={(event) =>
                    handleChange("desired_resolution", event.target.value)
                  }
                  placeholder="What outcome would help resolve this complaint?"
                  className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
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
                    "Submit Complaint"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="size-5 text-primary" />
              My Complaints
            </CardTitle>
            <CardDescription>
              Check the status of the complaints you have sent to HR.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoadingComplaints ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading your complaints...
              </div>
            ) : sortedComplaints.length > 0 ? (
              <div className="space-y-4">
                {sortedComplaints.map((complaint) => (
                  <div
                    key={complaint.complaint_id}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {complaint.subject}
                          </h3>
                          <Badge
                            className={getStatusBadgeClass(complaint.status)}
                          >
                            {formatLabel(
                              complaint.status_label ?? complaint.status,
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Category:{" "}
                          {formatLabel(
                            complaint.category_label ?? complaint.category,
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {formatDate(complaint.requested_at)}
                        </p>
                      </div>
                      <div className="max-w-xl rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Details</p>
                        <p className="mt-1 whitespace-pre-wrap">
                          {complaint.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No complaints submitted yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}
