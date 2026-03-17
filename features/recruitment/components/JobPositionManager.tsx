"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  JobPosition,
  CreateJobPosition,
  Department
} from "@/types/recruitment";
import {
  fetchJobPositions,
  createJobPosition,
  fetchDepartments,
  updateJobPosition
} from "@/services/recruitmentService";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  X,
  Calendar,
  Building2,
  MoreVertical,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JobPositionManager() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<CreateJobPosition>({
    title: "",
    department: 0,
    description: "",
    status: "open",
    posted_date: getToday(),
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [posResponse, deptResponse] = await Promise.all([
        fetchJobPositions(),
        fetchDepartments()
      ]);
      setPositions(posResponse.results);
      setDepartments(deptResponse.results);

      // Set default department if none selected
      if (deptResponse.results.length > 0) {
        setFormData(prev => ({ ...prev, department: deptResponse.results[0].department_id }));
      }
    } catch (error) {
      console.error("Failed to fetch recruitment data", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPositions() {
    try {
      const response = await fetchJobPositions();
      setPositions(response.results);
    } catch (error) {
      console.error("Failed to fetch job positions", error);
    }
  }

  async function handleStatusChange(positionId: number, newStatus: JobPosition["status"]) {
    try {
      // Optimistic update
      setPositions(prev => prev.map(p => p.position_id === positionId ? { ...p, status: newStatus } : p));
      await updateJobPosition(positionId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert if error
      loadPositions();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedTitle = formData.title.trim();
    const normalizedDescription = (formData.description ?? "").trim();
    if (!normalizedTitle) {
      setCreateError("Position title is required.");
      return;
    }
    if (!formData.department || formData.department <= 0) {
      setCreateError("Please select a department.");
      return;
    }

    try {
      setCreateError(null);
      setIsSubmitting(true);

      // Ensure posted_date is always today's date when sending
      await createJobPosition({
        ...formData,
        title: normalizedTitle,
        description: normalizedDescription || undefined,
        posted_date: getToday()
      });

      setIsModalOpen(false);
      await loadPositions();
      setFormData({
        title: "",
        department: departments[0]?.department_id || 0,
        description: "",
        status: "open",
        posted_date: getToday(),
      });
    } catch (error) {
      console.error("Failed to create job position", error);
      const message = error instanceof Error
        ? error.message.replace(/^API request failed with status \d+\s*-?\s*/i, "")
        : "Unknown error";
      setCreateError(message || "Could not create position. Check fields and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleShare = (job: JobPosition) => {
    setSelectedJob(job);
    setIsShareModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvePublicId = (job: JobPosition) => {
    if (job.public_id) return job.public_id;
    if (job.application_url) {
      try {
        const u = new URL(job.application_url);
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1];
      } catch (e) {
        return String(job.position_id);
      }
    }
    return String(job.position_id);
  };

  const getShareUrl = (jobOrId: JobPosition | string) => {
    const base = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const publicId = typeof jobOrId === 'string' ? jobOrId : resolvePublicId(jobOrId);
    return `${base}/apply/${publicId}`;
  };

  const triggerNativeShare = (job: JobPosition) => {
    const shareUrl = getShareUrl(job);
    if (navigator.share) {
      navigator.share({
        title: `Apply for ${job.title}`,
        text: `Check out this job opening: ${job.title}`,
        url: shareUrl,
      }).catch(console.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'closed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'on_hold':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled':
        return 'bg-gray-200/60 text-red-700 border-red-200/40';
      default:
        return 'bg-muted/10 text-muted-foreground border-border/20';
    }
  };

  const filteredPositions = selectedDepartmentFilter === "all"
    ? positions
    : positions.filter((position) => position.department === selectedDepartmentFilter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Activity className="size-6 text-primary" />
          Live Roles
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Department
            </Label>
            <select
              value={selectedDepartmentFilter}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDepartmentFilter(value === "all" ? "all" : Number(value));
              }}
              className="h-10 rounded-xl border border-border/50 bg-background px-3 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setCreateError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="size-4" />
            Create New Position
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground font-medium italic">
          Fetching recruitment pipeline...
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPositions.length === 0 ? (
            <div className="text-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <p className="text-muted-foreground font-medium">
                {selectedDepartmentFilter === "all"
                  ? "No job positions found. Start by creating one."
                  : "No job positions found for this department."}
              </p>
            </div>
          ) : (
            filteredPositions.map((pos, i) => (
              <motion.div
                key={pos.position_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative overflow-hidden flex items-center justify-between p-6 border-none shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300">
                      <Briefcase className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">{pos.title}</h4>
                        <select
                          value={pos.status}
                          onChange={(e) => handleStatusChange(pos.position_id, e.target.value as JobPosition["status"])}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border appearance-none cursor-pointer outline-none hover:opacity-80 transition-opacity ${getStatusColor(pos.status)}`}
                        >
                          <option value="open">OPEN</option>
                          <option value="on_hold">ON HOLD</option>
                          <option value="closed">CLOSED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Building2 className="size-3.5" /> {departments.find(d => d.department_id === pos.department)?.name || `Dept #${pos.department}`}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="size-3.5" /> Posted {new Date(pos.posted_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => handleShare(pos)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="size-4" />
                      <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Share</span>
                    </button>
                    <Link
                      href={`/recruitment/job-postings/${pos.position_id}`}
                      className="hidden md:flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      View details <MoreVertical className="size-3" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card p-0 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl text-white">
                    <Plus className="size-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">New Job Position</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Position Title</Label>
                    <Input
                      required
                      placeholder="e.g. Lead Frontend Engineer"
                      className="rounded-xl border-border/50 focus:ring-primary/20 h-12 text-base font-medium"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department</Label>
                      <select
                        required
                        className="w-full rounded-xl border border-border/50 bg-background h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: parseInt(e.target.value) })}
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.department_id} value={dept.department_id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                      <select
                        required
                        className="w-full rounded-xl border border-border/50 bg-background h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as JobPosition["status"] })}
                      >
                        <option value="open">Open</option>
                        <option value="on_hold">On Hold</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                    <textarea
                      placeholder="Describe the role responsibilities..."
                      className="w-full rounded-xl border border-border/50 p-4 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[120px] text-base font-medium transition-all"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {createError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl bg-muted px-4 py-4 text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] rounded-xl bg-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Publishing..." : "Confirm & Publish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card p-0 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Share2 className="size-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Share Position</h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="rounded-full p-2 hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{selectedJob?.title}</h4>
                  <p className="text-sm text-muted-foreground">Share this public application link with candidates or on social media.</p>
                </div>

                <div className="relative group">
                  <Input
                    readOnly
                    value={getShareUrl(selectedJob)}
                    className="pr-24 font-mono text-xs bg-muted/30 border-dashed rounded-xl h-12"
                  />
                  <button
                    onClick={() => copyToClipboard(getShareUrl(selectedJob))}
                    className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/90 flex items-center gap-2 transition-all"
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => triggerNativeShare(selectedJob)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-all"
                  >
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
                      <Share2 className="size-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Send to Apps</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=Apply%20for%20${encodeURIComponent(selectedJob.title)}%20here:%20${encodeURIComponent(getShareUrl(selectedJob))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-all"
                  >
                    <div className="p-2 rounded-full bg-green-500/10 text-green-600">
                      <Activity className="size-5 rotate-45" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                  </a>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
