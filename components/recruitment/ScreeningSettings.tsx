import { useEffect, useState } from "react";
import { JobPosition, VersionStats } from "@/types/recruitment";
import {
    updateJobPosition,
    getVersionStats,
    reEvaluate,
    suggestSkills,
    fetchInstructionTemplates,
    createInstructionTemplate,
    deleteInstructionTemplate
} from "@/services/recruitmentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Play,
    Plus,
    X,
    GraduationCap,
    Award,
    BrainCircuit,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Users,
    Loader2,
    Wand2,
    Save,
    Trash2,
    ChevronDown
} from "lucide-react";

import { RecruiterInstructionTemplate } from "@/types/recruitment";

interface ScreeningSettingsProps {
    job: JobPosition;
    onStartScreening: (mode?: "full" | "stale_only") => void;
    onUpdate: (updatedJob: JobPosition) => void;
}

export function ScreeningSettings({ job, onStartScreening, onUpdate }: ScreeningSettingsProps) {
    const [minGpa, setMinGpa] = useState<number>(job.min_gpa || 0);
    const [minYearsExp, setMinYearsExp] = useState<number>(job.min_years_experience || 0);
    const [shortlistSize, setShortlistSize] = useState<number>(job.shortlist_size || 10);
    const [skills, setSkills] = useState<string[]>(job.required_skills || []);
    const [certs, setCerts] = useState<string[]>(job.required_certificates || []);
    const [newSkill, setNewSkill] = useState("");
    const [newCert, setNewCert] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [versionStats, setVersionStats] = useState<VersionStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [recruiterInstructions, setRecruiterInstructions] = useState(job.recruiter_instructions || "");
    const [templates, setTemplates] = useState<RecruiterInstructionTemplate[]>([]);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        loadVersionStats();
        loadTemplates();
    }, [job.position_id]);

    const loadTemplates = async () => {
        try {
            const res = await fetchInstructionTemplates();
            setTemplates(res.results || []);
        } catch (e) {
            console.error("Failed to load templates", e);
        }
    };

    const loadVersionStats = async () => {
        try {
            setIsLoadingStats(true);
            const stats = await getVersionStats(job.position_id);
            setVersionStats(stats);
        } catch (error) {
            console.error("Failed to load version stats:", error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim() || !recruiterInstructions.trim()) return;
        try {
            setIsSavingTemplate(true);
            await createInstructionTemplate({
                name: newTemplateName.trim(),
                content: recruiterInstructions.trim()
            });
            setNewTemplateName("");
            setIsCreatingTemplate(false);
            loadTemplates();
        } catch (e) {
            console.error("Failed to save template", e);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        if (!confirm("Delete template?")) return;
        try {
            await deleteInstructionTemplate(id);
            loadTemplates();
        } catch (e) {
            console.error("Failed to delete template", e);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateJobPosition(job.position_id, {
                min_gpa: minGpa,
                min_years_experience: minYearsExp,
                shortlist_size: shortlistSize,
                required_skills: skills,
                required_certificates: certs,
                recruiter_instructions: recruiterInstructions,
            });
            onUpdate(updated);
            loadVersionStats(); // Reload stats after criteria change
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReEvaluate = async () => {
        try {
            setIsSaving(true);
            await reEvaluate(job.position_id);
            onStartScreening("stale_only");
        } catch (error) {
            console.error("Failed to trigger re-evaluation:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSuggest = async () => {
        if (!job.description) return;
        try {
            setSuggesting(true);
            const res = await suggestSkills(job.description);
            const combined = Array.from(new Set([...skills, ...res.skills]));
            setSkills(combined);
        } catch (err) {
            console.error("Suggestion failed", err);
        } finally {
            setSuggesting(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const addCert = () => {
        if (newCert.trim() && !certs.includes(newCert.trim())) {
            setCerts([...certs, newCert.trim()]);
            setNewCert("");
        }
    };

    const removeCert = (cert: string) => {
        setCerts(certs.filter(c => c !== cert));
    };

    const isStale = versionStats?.stats.rescreen_required_count ? versionStats.stats.rescreen_required_count > 0 : false;

    return (
        <Card className="p-6 border-none shadow-xl rounded-3xl overflow-hidden relative group bg-gradient-to-br from-background to-muted/20">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
                <Settings className="size-32" />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <BrainCircuit className="size-5" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Screening Config</h3>
                    </div>

                    {versionStats && (
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isStale ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {isStale ? <AlertCircle className="size-3" /> : <CheckCircle2 className="size-3" />}
                            V{job.criteria_version} &bull; {isStale ? `${versionStats.stats.rescreen_required_count} STALE` : 'UP TO DATE'}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="min_gpa" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <GraduationCap className="size-3.5" /> Minimum GPA
                        </Label>
                        <Input
                            id="min_gpa"
                            type="number"
                            step="0.1"
                            value={minGpa}
                            onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                            className="rounded-xl border-border/50 bg-background/50 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="min_exp" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Calendar className="size-3.5" /> Min Experience
                        </Label>
                        <Input
                            id="min_exp"
                            type="number"
                            value={minYearsExp}
                            onChange={(e) => setMinYearsExp(parseInt(e.target.value))}
                            className="rounded-xl border-border/50 bg-background/50 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortlist" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Users className="size-3.5" /> Shortlist Size
                        </Label>
                        <Input
                            id="shortlist"
                            type="number"
                            value={shortlistSize}
                            onChange={(e) => setShortlistSize(parseInt(e.target.value))}
                            className="rounded-xl border-border/50 bg-background/50 h-11"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <BrainCircuit className="size-3.5" /> Required Skills
                            </Label>
                            <button
                                onClick={handleSuggest}
                                disabled={suggesting}
                                className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                                {suggesting ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />} AI Suggest
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                placeholder="Add skill..."
                            />
                            <Button size="icon" variant="outline" onClick={addSkill} className="rounded-xl shrink-0 h-11 w-11">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
                            {skills.map(skill => (
                                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {skill}
                                    <X className="size-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeSkill(skill)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Award className="size-3.5" /> Required Certificates
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={newCert}
                                onChange={(e) => setNewCert(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCert()}
                                className="rounded-xl border-border/50 bg-background/50 h-11"
                                placeholder="Add certificate..."
                            />
                            <Button size="icon" variant="outline" onClick={addCert} className="rounded-xl shrink-0 h-11 w-11">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
                            {certs.map(cert => (
                                <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                    {cert}
                                    <X className="size-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeCert(cert)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Custom Guidance */}
                <div className="space-y-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wand2 className="size-4 text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary">AI Guidance (Optional)</h4>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {templates.length > 0 && (
                                <div className="relative group/templates">
                                    <button
                                        type="button"
                                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                    >
                                        Templates <ChevronDown className="size-3" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover/templates:opacity-100 group-hover/templates:visible transition-all z-20 overflow-hidden">
                                        <div className="max-h-48 overflow-y-auto">
                                            {templates.map(t => (
                                                <div key={t.id} className="flex items-center justify-between group/titem hover:bg-muted/50 transition-colors">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecruiterInstructions(t.content)}
                                                        className="flex-1 text-left px-4 py-2 text-[10px] font-bold truncate"
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
                                    disabled={!recruiterInstructions.trim()}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Save className="size-3" /> Save Template
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                    <Input
                                        placeholder="Name..."
                                        className="h-7 w-24 text-[10px] rounded-lg"
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
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <textarea
                        placeholder="Influence the AI's qualitative scoring with custom prioritized rules..."
                        className="w-full rounded-2xl border border-primary/10 bg-background/50 p-4 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[90px] text-sm font-medium transition-all"
                        value={recruiterInstructions}
                        onChange={e => setRecruiterInstructions(e.target.value)}
                    />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full rounded-2xl h-11 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all border-none"
                    >
                        {isSaving ? "Saving..." : "Save Settings (V" + (job.criteria_version + 1) + ")"}
                    </Button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            onClick={() => onStartScreening("full")}
                            disabled={isSaving}
                            variant="outline"
                            className="rounded-2xl h-11 font-black uppercase tracking-widest transition-all border-dashed border-primary/40 gap-2"
                        >
                            Full Re-scan
                        </Button>
                        <Button
                            onClick={handleReEvaluate}
                            disabled={isSaving || !isStale}
                            className={`rounded-2xl h-11 font-black uppercase tracking-widest shadow-lg transition-all border-none gap-2 ${isStale ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-muted text-muted-foreground opacity-50'}`}
                        >
                            <RefreshCw className={`size-4 ${isSaving ? 'animate-spin' : ''}`} /> {isStale ? `Screen Stale (${versionStats?.stats.rescreen_required_count})` : 'Up To Date'}
                        </Button>
                    </div>

                    <Button
                        onClick={() => onStartScreening("full")}
                        className="w-full rounded-2xl h-12 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all border-none gap-2 mt-2"
                    >
                        <Play className="size-4 fill-current" /> Run Full AI Screening
                    </Button>
                </div>
            </div>
        </Card>
    );
}
