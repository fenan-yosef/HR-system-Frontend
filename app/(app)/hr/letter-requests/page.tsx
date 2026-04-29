"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approveLetter,
  generateLetter,
  getAllLetterRequests,
  rejectLetter,
  resolveLetterFileUrl,
} from "@/services/letterService";
import { apiDownload } from "@/services/apiClient";
import type { LetterRequest, LetterStatus } from "@/types/letter";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const STATUS_FILTERS: Array<{ value: "all" | LetterStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type PendingAction = {
  type: "approve" | "reject" | "generate";
  request: LetterRequest;
} | null;

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

function formatLabel(value?: string) {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getRequestStatus(request: LetterRequest): LetterStatus | undefined {
  const raw = request.status ?? request.status_label ?? request.statusLabel;
  if (!raw) return undefined;
  const normalized = String(raw).toLowerCase();
  if (normalized === "pending" || normalized === "approved" || normalized === "rejected") {
    return normalized as LetterStatus;
  }
  return undefined;
}

function getRequestLetterType(request: LetterRequest): string | undefined {
  return request.letter_type ?? request.letterType;
}

function getRequestFileUrl(request: LetterRequest): string | null {
  return request.generated_file_url ?? request.generatedFileUrl ?? null;
}

function getRequestedDate(request: LetterRequest): string | undefined {
  return request.requested_at ?? request.requestedAt ?? request.created_at;
}

function getStatusStyles(status?: LetterStatus) {
  if (status === "approved") {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (status === "rejected") {
    return "bg-red-500/10 text-red-600 border-red-500/20";
  }
  return "bg-amber-500/10 text-amber-600 border-amber-500/20";
}

function getEmployeeName(request: LetterRequest) {
  if (request.employee_name) return request.employee_name;
  if (request.employeeName) return request.employeeName;
  if (request.employee?.full_name) return request.employee.full_name;
  const first = request.employee?.first_name ?? "";
  const last = request.employee?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Unknown";
}

export default function LetterRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<LetterRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | LetterStatus>(
    "all",
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<PendingAction>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllLetterRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load letter requests", err);
      setError("Unable to load letter requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return requests.filter((request) => {
      const status = getRequestStatus(request);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;
      const employeeName = getEmployeeName(request).toLowerCase();
      const type = getRequestLetterType(request)?.toLowerCase() ?? "";
      return (
        employeeName.includes(normalizedSearch) ||
        type.includes(normalizedSearch)
      );
    });
  }, [requests, statusFilter, search]);

  const handleAction = async (
    request: LetterRequest,
    action: "approve" | "reject" | "generate",
  ) => {
    setActionLoadingId(request.id);
    try {
      if (action === "approve") {
        await approveLetter(request.id);
        toast("Request approved.", "success");
      }
      if (action === "reject") {
        await rejectLetter(request.id);
        toast("Request rejected.", "success");
      }
      if (action === "generate") {
        await generateLetter(request.id);
        toast("PDF generated successfully.", "success");
      }
      await loadRequests();
    } catch (err) {
      console.error("Failed to update request", err);
      toast("Action failed. Please try again.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownload = async (request: LetterRequest) => {
    const url = getRequestFileUrl(request);
    if (!url) {
      toast("PDF is not available for this request.", "warning");
      return;
    }
    const resolved = resolveLetterFileUrl(url);
    if (!resolved) {
      toast("PDF is not available for this request.", "warning");
      return;
    }
    try {
      setDownloadingId(request.id);
      const blobUrl = await apiDownload(resolved);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to download letter", err);
      toast("Failed to download PDF.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const requestCountLabel = filteredRequests.length.toLocaleString();

  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_STAFF", "HR_CEO"]}>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Letter Requests
          </h1>
          <p className="text-muted-foreground">
            Review employee verification and experience letter requests.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    statusFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by employee or letter type"
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border border-border/70 p-6">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadRequests}>
              Try Again
            </Button>
          </Card>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Letter Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Requested Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-6 text-muted-foreground"
                      colSpan={5}
                    >
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const status = getRequestStatus(request);
                    const fileUrl = getRequestFileUrl(request);
                    const isBusy = actionLoadingId === request.id;
                    const isDownloading = downloadingId === request.id;
                    const canGenerate = status === "approved" && !fileUrl;
                    const canApproveReject = status === "pending";
                    return (
                      <tr key={request.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {getEmployeeName(request)
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            {getEmployeeName(request)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-primary" />
                            {formatLabel(getRequestLetterType(request))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(status)}`}
                          >
                            {formatLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(getRequestedDate(request))}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isBusy ? (
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="size-3.5 animate-spin" />
                              Updating
                            </div>
                          ) : (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canApproveReject}
                                onClick={() =>
                                  setConfirmAction({
                                    type: "approve",
                                    request,
                                  })
                                }
                              >
                                <CheckCircle2 className="size-4" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canApproveReject}
                                onClick={() =>
                                  setConfirmAction({
                                    type: "reject",
                                    request,
                                  })
                                }
                              >
                                <XCircle className="size-4" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canGenerate}
                                onClick={() =>
                                  setConfirmAction({
                                    type: "generate",
                                    request,
                                  })
                                }
                              >
                                <ShieldCheck className="size-4" /> Generate PDF
                              </Button>
                              {fileUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(request)}
                                  disabled={isDownloading}
                                >
                                  {isDownloading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Download className="size-4" />
                                  )}
                                  {isDownloading ? "Downloading" : "Download"}
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs font-medium text-muted-foreground">
          Showing {requestCountLabel} request{filteredRequests.length === 1 ? "" : "s"}
        </p>
      </section>

      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "approve" &&
                "Approve this letter request?"}
              {confirmAction?.type === "reject" &&
                "Reject this letter request?"}
              {confirmAction?.type === "generate" &&
                "Generate a PDF for this request?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!confirmAction) return;
                const { request, type } = confirmAction;
                setConfirmAction(null);
                handleAction(request, type);
              }}
              disabled={!confirmAction}
            >
              {confirmAction?.type === "approve" && "Approve"}
              {confirmAction?.type === "reject" && "Reject"}
              {confirmAction?.type === "generate" && "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
