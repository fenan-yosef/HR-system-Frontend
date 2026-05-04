"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  JobPosition,
  CreateJobPosition,
  Department
} from "@/types/recruitment";
import {
  fetchJobPositions,
  createJobPosition,
  fetchDepartments,
  updateJobPosition,
  suggestSkills,
  updateCustomApplicationFields,
  fetchInstructionTemplates,
  createInstructionTemplate,
  deleteInstructionTemplate
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
  Check,
  BrainCircuit,
  Loader2,
  Trash2,
  Settings2,
  GripVertical,
  Wand2,
  Save,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomApplicationField, CustomFieldType, RecruiterInstructionTemplate } from "@/types/recruitment";

const FIELD_TYPES: { label: string; value: CustomFieldType }[] = [
  { label: "Short Text", value: "short_text" },
  { label: "Long Text", value: "long_text" },
  { label: "Number", value: "number" },
  { label: "Integer", value: "integer" },
  { label: "Boolean", value: "boolean" },
  { label: "Select (Dropdown)", value: "select" },
  { label: "Multi Select", value: "multi_select" },
  { label: "Date", value: "date" },
  { label: "File", value: "file" },
  { label: "File List", value: "file_list" },
  { label: "Email", value: "email" },
  { label: "URL", value: "url" },
  { label: "Phone", value: "phone" },
];

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
  const [templates, setTemplates] = useState<RecruiterInstructionTemplate[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const suggestionTimerRef = useRef<number | null>(null);

  const [formData, setFormData] = useState<CreateJobPosition>({
    title: "",
    department: 0,
    description: "",
    status: "open",
    posted_date: getToday(),
    recruiter_instructions: "",
    min_gpa: 0,
    min_years_experience: 0,
    required_skills: [],
    required_certificates: [],
    allowed_universities: [],
    shortlist_size: 10,
    scoring_weights: {
      skills: 40,
      experience: 30,
      education: 20,
      certifications: 10
    },
    ai_config: {
      min_pass_score: 50,
      skip_ai_on_hard_fail: true,
      final_score_blend: {
        rule: 0.3,
        ai: 0.7
      }
    }
  });

  const [customFields, setCustomFields] = useState<CustomApplicationField[]>([]);

  const addCustomField = () => {
    const newField: CustomApplicationField = {
      label: "",
      type: "short_text",
      required: false,
      include_in_ai: true,
      order: customFields.length + 1,
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (index: number) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  const updateCustomField = (index: number, updates: Partial<CustomApplicationField>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    setCustomFields(newFields);
  };

  const handleSuggestSkills = async () => {
    if (!formData.description || formData.description.length < 20) return;
    try {
      setSuggestingSkills(true);
      // Manual fresh pass (do not use cache)
      const res = await suggestSkills(formData.description || "", 12, undefined, false);

      if (res.skills && res.skills.length > 0) {
        // Merge with existing skills
        const combined = Array.from(new Set([...(formData.required_skills || []), ...res.skills]));
        setFormData(prev => ({ ...prev, required_skills: combined }));
      }
    } catch (err) {
      console.error("Skill suggestion failed", err);
    } finally {
      setSuggestingSkills(false);
    }
  };

  // Debounced live suggestions while typing (use cache by default)
  useEffect(() => {
    if (!formData.description || formData.description.length < 20) {
      setLiveSuggestions([]);
      return;
    }

    // Clear previous timer
    if (suggestionTimerRef.current) {
      window.clearTimeout(suggestionTimerRef.current as number);
    }

    suggestionTimerRef.current = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const res = await suggestSkills(formData.description || "", 12, undefined, true);

        setLiveSuggestions(res.skills || []);
      } catch (e) {
        console.error("Live suggestion failed", e);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 500);

    return () => {
      if (suggestionTimerRef.current) {
        window.clearTimeout(suggestionTimerRef.current as number);
      }
    };
  }, [formData.description]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [posResponse, deptResponse, templateResponse] = await Promise.all([
        fetchJobPositions(),
        fetchDepartments(),
        fetchInstructionTemplates()
      ]);
      const posList = Array.isArray(posResponse) ? posResponse : posResponse?.results ?? [];
      const deptList = deptResponse?.results ?? [];
      const templateList = templateResponse?.results ?? [];
      setPositions(posList);
      setDepartments(deptList);
      setTemplates(templateList);

      // Set default department if none selected
      if (deptList.length > 0) {
        setFormData(prev => ({ ...prev, department: deptList[0].department_id }));
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
      const list = Array.isArray(response) ? response : response?.results ?? [];
      setPositions(list);
    } catch (error) {
      console.error("Failed to fetch job positions", error);
    }
  }

  async function reloadDepartments() {
    try {
      const response = await fetchDepartments();
      const list = response.results || [];
      setDepartments(list);

      if (list.length > 0 && (!formData.department || formData.department <= 0)) {
        setFormData((prev) => ({ ...prev, department: list[0].department_id }));
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  }

  async function reloadTemplates() {
    try {
      const response = await fetchInstructionTemplates();
      setTemplates(response.results || []);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    }
  }

  async function handleSaveTemplate() {
    if (!newTemplateName.trim()) return;
    if (!formData.recruiter_instructions?.trim()) return;

    try {
      setIsSavingTemplate(true);
      await createInstructionTemplate({
        name: newTemplateName.trim(),
        content: formData.recruiter_instructions.trim()
      });
      setNewTemplateName("");
      setIsCreatingTemplate(false);
      await reloadTemplates();
    } catch (error) {
      console.error("Failed to save template", error);
    } finally {
      setIsSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate(id: number) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteInstructionTemplate(id);
      await reloadTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
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
      const createdJob = await createJobPosition({
        ...formData,
        title: normalizedTitle,
        description: normalizedDescription || undefined,
        posted_date: getToday()
      });

      // If we have custom fields, save them now
      if (customFields.length > 0 && createdJob.position_id) {
        try {
          await updateCustomApplicationFields(createdJob.position_id, {
            custom_application_fields: customFields
          });
        } catch (err) {
          console.error("Failed to save custom fields for new job", err);
          // We don't block the whole flow, but maybe show a warning later
        }
      }

      setIsModalOpen(false);
      await loadPositions();
      setCustomFields([]);
      setFormData({
        title: "",
        department: departments[0]?.department_id || 0,
        description: "",
        status: "open",
        posted_date: getToday(),
        recruiter_instructions: "",
        min_gpa: 0,
        min_years_experience: 0,
        required_skills: [],
        required_certificates: [],
        allowed_universities: [],
        shortlist_size: 10,
        scoring_weights: {
          skills: 40,
          experience: 30,
          education: 20,
          certifications: 10
        },
        ai_config: {
          min_pass_score: 50,
          skip_ai_on_hard_fail: true,
          final_score_blend: {
            rule: 0.3,
            ai: 0.7
          }
        }
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

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !formData.required_skills?.includes(s)) {
      setFormData(prev => ({ ...prev, required_skills: [...(prev.required_skills || []), s] }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, required_skills: (prev.required_skills || []).filter(s => s !== skill) }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Activity className="size-6 text-primary" />
          Live Roles
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => {
              setCreateError(null);
              if (departments.length === 0) {
                reloadDepartments();
              }
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="size-4" />
            Create New Position
          </button>
        </div>
      </div>

      <Card className="border border-border/60 bg-card/60 p-4 rounded-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Filter By Department
          </Label>
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDepartmentFilter(value === "all" ? "all" : Number(value));
            }}
            className="h-11 w-full sm:max-w-xs rounded-xl border border-border bg-background px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground font-medium italic">
          Fetching recruitment pipeline...
        </div>
      ) : (
        <div className="grid gap-4">
          {(filteredPositions?.length ?? 0) === 0 ? (
            <div className="text-center p-8 sm:p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <p className="text-muted-foreground font-medium text-sm">
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
                <Card className="group relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between p-4 sm:p-6 border-none shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300 shrink-0">
                      <Briefcase className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-black text-lg sm:text-xl tracking-tight text-foreground transition-colors group-hover:text-primary truncate">
                          {pos.title}
                        </h4>
                        <select
                          value={pos.status}
                          onChange={(e) => handleStatusChange(pos.position_id, e.target.value as JobPosition["status"])}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border appearance-none cursor-pointer outline-none hover:opacity-80 transition-opacity ${getStatusColor(pos.status)}`}
                        >
                          <option value="open">OPEN</option>
                          <option value="on_hold">ON HOLD</option>
                          <option value="closed">CLOSED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Building2 className="size-3.5" /> {departments.find(d => d.department_id === pos.department)?.name || `Dept #${pos.department}`}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="size-3.5" /> Posted {new Date(pos.posted_date).toLocaleDateString()}
                        </span>
                      </div>
                      {pos.required_skills && pos.required_skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pos.required_skills.slice(0, 8).map((s) => (
                            <span key={s} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-primary/20">{s}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 text-[10px] sm:text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span>Shortlist: <strong className="text-foreground">{pos.shortlist_size ?? '—'}</strong></span>
                        {pos.min_years_experience ? <span>Min Exp: <strong className="text-foreground">{pos.min_years_experience} yrs</strong></span> : null}
                        {pos.ai_config?.min_pass_score ? <span>Pass: <strong className="text-foreground">{pos.ai_config.min_pass_score}%</strong></span> : null}
                        <span>V{pos.criteria_version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 w-full xl:w-auto border-t xl:border-none pt-4 xl:pt-0">
                    <button
                      onClick={() => handleShare(pos)}
                      className="flex-1 xl:flex-initial flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="size-4" />
                      <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">Share</span>
                    </button>
                    <Link
                      href={`/hr/recruitment/job-postings/${pos.position_id}`}
                      className="flex-1 xl:flex-initial flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest hover:underline px-4"
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
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-card p-0 shadow-2xl border border-border"
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

              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
                <div className="p-8 space-y-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Position Title</Label>
                      <Input
                        required
                        placeholder="e.g. Lead Frontend Engineer"
                        className="rounded-xl border-border/50 h-11 text-base font-medium"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department</Label>
                        <select
                          required
                          className="w-full rounded-xl border border-border/50 bg-background h-11 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: parseInt(e.target.value) })}
                        >
                          {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                        <select
                          required
                          className="w-full rounded-xl border border-border/50 bg-background h-11 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                          <option value="open">Open</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                      <button
                        type="button"
                        onClick={handleSuggestSkills}
                        disabled={suggestingSkills || !formData.description || formData.description.length < 20}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {suggestingSkills ? <Loader2 className="size-3 animate-spin" /> : <BrainCircuit className="size-3" />}
                        Suggest AI Skills
                      </button>
                    </div>
                    <textarea
                      placeholder="Describe the role responsibilities..."
                      className="w-full rounded-xl border border-border/50 p-4 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[100px] text-sm font-medium transition-all"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* AI Custom Guidance (Optional) */}
                  <div className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="size-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">AI Custom Guidance (Optional)</h4>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {templates.length > 0 && (
                          <div className="relative group/templates">
                            <button
                              type="button"
                              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                            >
                              Load Template <ChevronDown className="size-3" />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover/templates:opacity-100 group-hover/templates:visible transition-all z-20 overflow-hidden">
                              <div className="p-2 border-b border-border/50 bg-muted/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select a template</div>
                              <div className="max-h-48 overflow-y-auto">
                                {templates.map(t => (
                                  <div key={t.id} className="flex items-center justify-between group/titem hover:bg-muted/50 transition-colors">
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, recruiter_instructions: t.content })}
                                      className="flex-1 text-left px-4 py-2 text-[11px] font-bold truncate"
                                    >
                                      {t.name}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTemplate(t.id)}
                                      className="px-3 py-2 text-muted-foreground hover:text-destructive opacity-0 group-hover/titem:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!isCreatingTemplate ? (
                          <button
                            type="button"
                            onClick={() => setIsCreatingTemplate(true)}
                            disabled={!formData.recruiter_instructions?.trim()}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                          >
                            <Save className="size-3" /> Save current as template
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <Input
                              placeholder="Template name..."
                              className="h-7 w-32 text-[10px] rounded-lg"
                              value={newTemplateName}
                              onChange={e => setNewTemplateName(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleSaveTemplate}
                              disabled={isSavingTemplate || !newTemplateName.trim()}
                              className="p-1 px-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase"
                            >
                              {isSavingTemplate ? <Loader2 className="size-2 animate-spin" /> : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreatingTemplate(false)}
                                className="p-1 px-2 bg-muted text-muted-foreground rounded-lg text-[10px] font-black uppercase"
                              >
                                Cancel
                              </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Influence the AI&apos;s qualitative scoring. Give it specific rules or priorities for this role.
                      <br/>
                      <em className="text-primary/70 italic">Example: &quot;Prioritize candidates with experience in large-scale cloud migrations over general DevOps.&quot;</em>
                    </p>
                    
                    <textarea
                      placeholder="Enter custom instructions for the AI recruiter..."
                      className="w-full rounded-2xl border border-primary/20 bg-background p-4 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[80px] text-sm font-medium transition-all"
                      value={formData.recruiter_instructions}
                      onChange={e => setFormData({ ...formData, recruiter_instructions: e.target.value })}
                    />
                  </div>

                  {/* Live Suggestion Chips */}
                  {formData.description && formData.description.length >= 20 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Suggested Skills</div>
                        <div className="text-[10px] text-muted-foreground">Debounced live suggestions</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestionsLoading ? (
                          <div className="text-sm text-muted-foreground">Loading suggestions...</div>
                        ) : liveSuggestions.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No suggestions yet. Type more to get AI suggestions.</div>
                        ) : (
                          liveSuggestions.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => addSkill(s)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${formData.required_skills?.includes(s) ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted/20 text-muted-foreground border border-border/30'} text-[10px] font-black uppercase tracking-wider`}
                            >
                              {s}
                              {!formData.required_skills?.includes(s) && <Plus className="size-3" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screening Criteria Header */}
                  <div className="flex items-center gap-2 py-2 border-b border-border/50">
                    <Layers className="size-4 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Screening Requirements</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Min GPA</Label>
                      <Input
                        type="number"
                        step="0.1"
                        className="rounded-xl border-border/50 h-10"
                        value={formData.min_gpa}
                        onChange={e => setFormData({ ...formData, min_gpa: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Min Exp (Years)</Label>
                      <Input
                        type="number"
                        className="rounded-xl border-border/50 h-10"
                        value={formData.min_years_experience}
                        onChange={e => setFormData({ ...formData, min_years_experience: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shortlist Target</Label>
                      <Input
                        type="number"
                        className="rounded-xl border-border/50 h-10"
                        value={formData.shortlist_size}
                        onChange={e => setFormData({ ...formData, shortlist_size: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Skills Tagging */}
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keywords / Skills</Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-2xl bg-muted/20 border border-dashed border-border/50">
                      {formData.required_skills?.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                          {skill}
                          <X className="size-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
                        </span>
                      ))}
                      <input
                        placeholder="+ Add skill (Press Enter)"
                        className="bg-transparent border-none outline-none text-xs font-medium min-w-[120px]"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Advanced Scoring Weights */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <Activity className="size-3" /> AI Scoring Weightage (%)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['skills', 'experience', 'education', 'certifications'].map((key) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{key}</Label>
                          <Input
                            type="number"
                            className="h-9 rounded-lg"
                            value={(formData.scoring_weights as any)[key]}
                            onChange={e => setFormData({
                              ...formData,
                              scoring_weights: {
                                ...formData.scoring_weights!,
                                [key]: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Application Fields Section */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="size-4 text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Custom Application Fields</h4>
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="size-3" /> Add Field
                      </button>
                    </div>

                    <div className="space-y-3">
                      {customFields.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic text-center py-4 border border-dashed rounded-xl">
                          No custom fields added. Default fields (Name, Email, Phone, CV) are always included.
                        </p>
                      ) : (
                        customFields.map((field, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-4 relative group/field">
                            <button
                              type="button"
                              onClick={() => removeCustomField(idx)}
                              className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/field:opacity-100 transition-opacity"
                            >
                              <Trash2 className="size-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={e => updateCustomField(idx, { label: e.target.value })}
                                  placeholder="e.g. Expected Salary"
                                  className="h-9 rounded-xl text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                                <select
                                  value={field.type}
                                  onChange={(e) => updateCustomField(idx, { type: e.target.value as CustomFieldType })}
                                  className="flex h-9 w-full rounded-xl border border-border/50 bg-background px-3 py-1 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                  {FIELD_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`req-new-${idx}`}
                                  checked={field.required}
                                  onChange={e => updateCustomField(idx, { required: e.target.checked })}
                                  className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20"
                                />
                                <Label htmlFor={`req-new-${idx}`} className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Required</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`ai-new-${idx}`}
                                  checked={field.include_in_ai}
                                  onChange={e => updateCustomField(idx, { include_in_ai: e.target.checked })}
                                  className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20"
                                />
                                <Label htmlFor={`ai-new-${idx}`} className="flex items-center text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                  AI Screening <BrainCircuit className="size-3 ml-1 text-primary" />
                                </Label>
                              </div>
                            </div>

                            {(field.type === "select" || field.type === "multi_select") && (
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Options (comma separated)</Label>
                                <Input
                                  value={field.options?.join(", ") || ""}
                                  onChange={e => updateCustomField(idx, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                  placeholder="Red, Blue, Green"
                                  className="h-9 rounded-xl text-xs"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-muted/20 border-t border-border/50 space-y-6">
                  {createError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {createError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 rounded-xl bg-background border border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] rounded-xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? "Creating..." : "Publish"}
                    </button>
                  </div>
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
