"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, FileText } from "lucide-react";
import {
  getMyLetterRequests,
  resolveLetterFileUrl,
} from "@/services/letterService";
import { apiDownload } from "@/services/apiClient";
import type { LetterRequest, LetterStatus } from "@/types/letter";

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

export default function MyLettersPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<LetterRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyLetterRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load letter requests", err);
      setError("Unable to load your requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const rows = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aDate = getRequestedDate(a) ?? "";
      const bDate = getRequestedDate(b) ?? "";
      return bDate.localeCompare(aDate);
    });
  }, [requests]);

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

  if (isLoading) {
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
          <h1 className="text-4xl font-extrabold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Track the status of your letter requests and download approved PDFs.
          </p>
        </div>

        {error && (
          <Card className="border border-border/70 p-6">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadRequests}>
              Try Again
            </Button>
          </Card>
        )}

        {!error && (
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Letter Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Requested Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-6 text-muted-foreground"
                      colSpan={4}
                    >
                      No letter requests yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          {formatLabel(getRequestLetterType(request))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const status = getRequestStatus(request);
                          return (
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(status)}`}
                            >
                              {formatLabel(status)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(getRequestedDate(request))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(() => {
                          const status = getRequestStatus(request);
                          const fileUrl = getRequestFileUrl(request);
                          const isDownloading = downloadingId === request.id;
                          const canDownload = status === "approved" && !!fileUrl;

                          if (!canDownload) {
                            return (
                              <span className="text-xs text-muted-foreground">
                                Awaiting approval
                              </span>
                            );
                          }

                          return (
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
                              {isDownloading ? "Downloading" : "Download PDF"}
                            </Button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
