"use client";

import { useState } from "react";
import { JobPosition } from "@/types/recruitment";
import { updateJobPosition } from "@/services/recruitmentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Play, Plus, X, GraduationCap, Award, BrainCircuit } from "lucide-react";

interface ScreeningSettingsProps {
    job: JobPosition;
    onStartScreening: () => void;
    onUpdate: (updatedJob: JobPosition) => void;
}

export function ScreeningSettings({ job, onStartScreening, onUpdate }: ScreeningSettingsProps) {
    const [minGpa, setMinGpa] = useState<number>(job.min_gpa || 0);
    const [skills, setSkills] = useState<string[]>(job.required_skills || []);
    const [certs, setCerts] = useState<string[]>(job.required_certificates || []);
    const [newSkill, setNewSkill] = useState("");
    const [newCert, setNewCert] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateJobPosition(job.position_id, {
                min_gpa: minGpa,
                required_skills: skills,
                required_certificates: certs,
            });
            onUpdate(updated);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
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

    return (
        <Card className="p-6 border-none shadow-xl rounded-3xl overflow-hidden relative group bg-gradient-to-br from-background to-muted/20">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
                <Settings className="size-32" />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <BrainCircuit className="size-5" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">AI Screening Config</h3>
                </div>

                <div className="space-y-4">
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
                            className="rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                            placeholder="e.g. 3.5"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <BrainCircuit className="size-3.5" /> Required Skills
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                className="rounded-xl border-border/50 bg-background/50"
                                placeholder="Add skill..."
                            />
                            <Button size="icon" variant="outline" onClick={addSkill} className="rounded-xl shrink-0">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {skills.map(skill => (
                                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
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
                                className="rounded-xl border-border/50 bg-background/50"
                                placeholder="Add certificate..."
                            />
                            <Button size="icon" variant="outline" onClick={addCert} className="rounded-xl shrink-0">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {certs.map(cert => (
                                <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                                    {cert}
                                    <X className="size-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeCert(cert)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full rounded-2xl h-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border-none"
                    >
                        {isSaving ? "Saving..." : "Save Requirements"}
                    </Button>
                    <Button
                        onClick={onStartScreening}
                        className="w-full rounded-2xl h-12 font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all border-none gap-2"
                    >
                        <Play className="size-4 fill-current" /> Run AI Screening
                    </Button>
                </div>
            </div>
        </Card>
    );
}
