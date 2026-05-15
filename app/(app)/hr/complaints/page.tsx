"use client";

import { useMemo, useState, useEffect } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquareText, Search } from "lucide-react";
import { getAllComplaints } from "@/services/complaintService";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

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

function getEmployeeName(complaint: Complaint) {
  if (complaint.employee_name) return complaint.employee_name;
  const first = complaint.employee?.first_name ?? "";
  const last = complaint.employee?.last_name ?? "";
  return `${first} ${last}`.trim() || "Unknown employee";
}

export default function HRComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (err) {
      console.error("Failed to load complaints", err);
      setError("Unable to load complaints right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return complaints;
    return complaints.filter((complaint) => {
      const employeeName = getEmployeeName(complaint).toLowerCase();
      const subject = (complaint.subject ?? "").toLowerCase();
      const details = (complaint.details ?? "").toLowerCase();
      const category = formatLabel(
        complaint.category_label ?? complaint.category,
      ).toLowerCase();
      const status = formatLabel(
        complaint.status_label ?? complaint.status,
      ).toLowerCase();
      return (
        employeeName.includes(term) ||
        subject.includes(term) ||
        details.includes(term) ||
        category.includes(term) ||
        status.includes(term)
      );
    });
  }, [complaints, search]);

  return (
    <RoleGuard allowedRoles={["HR_STAFF", "ADMIN"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Complaints
            </h1>
            <p className="text-muted-foreground">
              Review complaints submitted by employees and follow up with the
              next action.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={loadComplaints}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-primary" />
              Complaints Dashboard
            </CardTitle>
            <CardDescription>
              Search employee complaints and inspect the submitted details.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by employee, subject, category, or status"
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading
                complaints...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                No complaints matched your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full border-separate border-spacing-0"
                  style={{ minWidth: "1100px" }}
                >
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="border-b px-4 py-3 font-semibold">
                        Employee
                      </th>
                      <th className="border-b px-4 py-3 font-semibold">
                        Department
                      </th>
                      <th className="border-b px-4 py-3 font-semibold">
                        Category
                      </th>
                      <th className="border-b px-4 py-3 font-semibold">
                        Subject
                      </th>
                      <th className="border-b px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th className="border-b px-4 py-3 font-semibold">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((complaint) => {
                      const status = complaint.status;
                      return (
                        <tr
                          key={complaint.complaint_id}
                          className="border-b last:border-b-0 align-top"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-foreground">
                            {getEmployeeName(complaint)}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {complaint.employee_department_name ?? "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatLabel(
                              complaint.category_label ?? complaint.category,
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            <div className="max-w-xl space-y-1">
                              <p className="font-medium text-foreground">
                                {complaint.subject}
                              </p>
                              <p className="line-clamp-3 whitespace-pre-wrap">
                                {complaint.details}
                              </p>
                              {complaint.desired_resolution && (
                                <p className="text-xs text-muted-foreground">
                                  Desired resolution:{" "}
                                  {complaint.desired_resolution}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(status)}`}
                            >
                              {formatLabel(
                                complaint.status_label ?? complaint.status,
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(complaint.requested_at)}
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
      </section>
    </RoleGuard>
  );
}
