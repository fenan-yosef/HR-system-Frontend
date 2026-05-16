"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, FileSearch, FileText, RefreshCcw, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchApplication, fetchApplications, fetchJobPosition, retryExtraction } from "@/services/recruitmentService";
import { apiDownload, getMediaUrl } from "@/services/apiClient";
import type { Application, JobPosition } from "@/types/recruitment";
import { getExtractionRawText, parseExtractedResume } from "@/lib/recruitment/extraction";

type ApplicationSummary = Application & {
  applicant?: {
    full_name?: string;
    email?: string;
    phone?: string;
    cv_path?: string;
  };
};

function JsonPrettyView({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) return <div className="text-sm text-muted-foreground">—</div>;
  if (typeof data !== "object") {
    return <div className="text-sm font-medium">{String(data)}</div>;
  }
  if (Array.isArray(data)) {
    return (
      <div className="space-y-2" style={{ marginLeft: depth * 8 }}>
        {data.map((item, index) => (
          <div key={index} className="rounded-xl border border-border/40 bg-background p-3">
            <JsonPrettyView data={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-border/40 bg-muted/10 p-3">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key}</div>
          <JsonPrettyView data={value} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

export default function ExtractionWorkspacePage() {
  const params = useParams();
  const positionId = Number(params.positionId);

  const [job, setJob] = useState<JobPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!positionId) return;

    const load = async () => {
      try {
        setLoading(true);
        const [jobData, applicationsData] = await Promise.all([
          fetchJobPosition(positionId),
          fetchApplications({ position_id: positionId }),
        ]);

        setJob(jobData);
        setApplications((applicationsData.results || []) as ApplicationSummary[]);

        const firstWithExtraction = (applicationsData.results || []).find((app: ApplicationSummary) => app.extracted_resume);
        const initialApplicationId = firstWithExtraction?.application_id || (applicationsData.results || [])[0]?.application_id || null;

        if (initialApplicationId) {
          setSelectedApplicationId(initialApplicationId);
        }
      } finally {
        setLoading(false);
      }
    };

    load().catch((error) => {
      console.error("Failed to load extraction workspace:", error);
      setLoading(false);
    });
  }, [positionId]);

  useEffect(() => {
    if (!selectedApplicationId) return;

    const loadApplication = async () => {
      setLoadingApplication(true);
      try {
        const application = await fetchApplication(selectedApplicationId);
        setSelectedApplication(application);
      } finally {
        setLoadingApplication(false);
      }
    };

    loadApplication().catch((error) => {
      console.error("Failed to load application extraction:", error);
      setLoadingApplication(false);
      setSelectedApplication(null);
    });
  }, [selectedApplicationId]);

  const parsedExtractedResume = useMemo(() => {
    return parseExtractedResume(selectedApplication?.extracted_resume ?? null);
  }, [selectedApplication]);

  const rawExtractionText = useMemo(() => {
    return getExtractionRawText(selectedApplication?.extracted_resume ?? null);
  }, [selectedApplication]);

  const handleRetryExtraction = async () => {
    if (!selectedApplicationId) return;
    try {
      setRetrying(true);
      await retryExtraction(selectedApplicationId);
      const application = await fetchApplication(selectedApplicationId);
      setSelectedApplication(application);
    } finally {
      setRetrying(false);
    }
  };

  const handleOpenCv = async () => {
    const cvPath = selectedApplication?.applicant?.cv_path || selectedApplication?.cv_path;
    if (!cvPath) return;
    const blobUrl = await apiDownload(getMediaUrl(cvPath));
    window.open(blobUrl, "_blank");
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center p-8 text-muted-foreground">Loading extraction workspace...</div>;
  }

  if (!job) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-black">Position Not Found</h2>
        <Link href="/recruitment/job-postings">
          <Button>Back to Positions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href={`/recruitment/job-postings/${positionId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Job Details
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Brain className="size-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">AI Resume Extraction</h1>
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Workspace for {job.title} <span className="text-primary/60">#ID-{job.position_id}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Card className="flex flex-col items-center justify-center rounded-2xl border-none bg-muted/30 px-6 py-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Applicants</span>
            <span className="text-2xl font-black">{applications.length}</span>
          </Card>
          <Link href={`/recruitment/job-postings/${positionId}/screening`}>
            <Button variant="outline" className="h-full rounded-2xl px-5 font-black uppercase tracking-widest text-xs">
              <Sparkles className="mr-2 size-4" /> Screening
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="rounded-[2rem] border-none p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between px-2 pt-2">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Applications</h2>
              <p className="text-sm text-muted-foreground">Select a candidate to inspect parsed CV output</p>
            </div>
            <Search className="size-4 text-muted-foreground" />
          </div>
          <div className="max-h-[72vh] space-y-3 overflow-auto pr-1">
            {applications.map((application) => {
              const active = application.application_id === selectedApplicationId;
              const name = application.applicant?.full_name || application.full_name || "Unknown Applicant";
              return (
                <button
                  key={application.application_id}
                  onClick={() => setSelectedApplicationId(application.application_id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5 shadow-lg" : "border-border/50 bg-background hover:border-primary/30 hover:bg-muted/30"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black uppercase tracking-wide">{name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{application.applicant?.email || application.email}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${application.extracted_resume ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {application.extracted_resume ? "Parsed" : "Pending"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[2rem] border-none shadow-xl">
          <div className="border-b border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  AI Resume Extraction
                </div>
                <h2 className="text-3xl font-black tracking-tight">{selectedApplication ? selectedApplication.full_name || selectedApplication.applicant?.full_name || "Selected Applicant" : "Select an applicant"}</h2>
                <p className="text-sm text-muted-foreground">Structured extraction data, raw model output, and CV file access in one workspace.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-2xl px-5 font-black uppercase tracking-widest text-xs" onClick={handleOpenCv} disabled={!selectedApplication}>
                  <FileText className="mr-2 size-4" /> Open CV
                </Button>
                <Button className="rounded-2xl px-5 font-black uppercase tracking-widest text-xs" onClick={handleRetryExtraction} disabled={!selectedApplicationId || retrying}>
                  <RefreshCcw className={`mr-2 size-4 ${retrying ? "animate-spin" : ""}`} /> {retrying ? "Re-extracting" : "Retry Extraction"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6">
            {!selectedApplication || loadingApplication ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                <FileSearch className="size-12" />
                <div>
                  <p className="text-lg font-black uppercase tracking-widest">Loading extraction data</p>
                  <p className="text-sm">Pick a candidate or wait for the selected record to finish loading.</p>
                </div>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/40 bg-background p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Parser Status</div>
                    <div className="mt-2 text-lg font-black text-emerald-600">{selectedApplication.extracted_resume?.extracted_json ? "Successfully Structured" : "No structured JSON found"}</div>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Model</div>
                    <div className="mt-2 text-lg font-black">{selectedApplication.extracted_resume?.extraction_model || "Unknown"}</div>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extracted At</div>
                    <div className="mt-2 text-lg font-black">{selectedApplication.extracted_resume?.extracted_at ? new Date(selectedApplication.extracted_resume.extracted_at).toLocaleString() : "—"}</div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                  <Card className="rounded-3xl border border-border/50 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <FileSearch className="size-4" /> Extracted JSON Data
                    </div>
                    <div className="max-h-[520px] overflow-auto rounded-2xl bg-muted/5 p-4 font-mono text-xs leading-relaxed">
                      {parsedExtractedResume ? <JsonPrettyView data={parsedExtractedResume} /> : <pre className="whitespace-pre-wrap">{JSON.stringify(selectedApplication.extracted_resume?.extracted_json ?? "No structured JSON available", null, 2)}</pre>}
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <Card className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Parser Status</div>
                      <div className="mt-1 text-lg font-black">{selectedApplication.extracted_resume?.extracted_json ? "Successfully Structured" : "Needs review"}</div>
                    </Card>
                    <Card className="rounded-3xl border border-border/50 p-5 shadow-sm">
                      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Raw LLM Response</div>
                      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300">
                        {rawExtractionText || (selectedApplication.extracted_resume?.raw_llm_response || "No raw response available")}
                      </pre>
                    </Card>
                  </div>
                </section>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}