"use client";

import { useState } from "react";
import { trackApplicant } from "@/services/recruitmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getMediaUrl } from "@/services/apiClient";
import { formatScore } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Briefcase, 
  User, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Wand2,
  ExternalLink,
  ChevronRight,
  Download,
  Archive,
  History,
  Info,
  Quote
} from "lucide-react";

export default function TrackApplicationPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await trackApplicant(trackingCode, email, true);
      setResult(data);
    } catch (err: any) {
      console.error("Tracking failed", err);
      // Try to parse error if it's a JSON string from apiFetch
      let msg = "Could not find an application with that tracking code. Please check and try again.";
      if (err.message && err.message.includes("status 404")) {
         msg = "No application found for this tracking code.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "under_review": return "bg-amber-100 text-amber-700 border-amber-200";
      case "shortlisted": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "interview": 
      case "interview_invited": return "bg-purple-100 text-purple-700 border-purple-200";
      case "confirmed":
      case "hired": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getFitLabelColor = (label: string) => {
    const l = label?.toLowerCase() || "";
    if (l.includes("strong")) return "bg-emerald-500 text-white";
    if (l.includes("good")) return "bg-emerald-400 text-white";
    if (l.includes("review")) return "bg-amber-500 text-white";
    return "bg-slate-500 text-white";
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-screen">
      <div className="text-center mb-10">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Track Application</h1>
         <p className="text-slate-500 text-lg">Stay updated on your journey with us</p>
      </div>

      <Card className="mb-10 border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search Records
          </CardTitle>
          <CardDescription>
            Enter your unique tracking code to view live status updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="tracking_code" className="text-sm font-bold text-slate-700">Tracking Code</Label>
              <div className="relative">
                <Input
                  id="tracking_code"
                  placeholder="Ex. QD980GVW"
                  value={trackingCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackingCode(e.target.value.toUpperCase())}
                  required
                  className="pl-4 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-widest text-lg"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address (Verification)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex. john@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            <Button 
                type="submit" 
                className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-xl transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-slate-200"
                disabled={loading}
            >
              {loading ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <>
                   <Search className="h-5 w-5" />
                   <span>Track Now</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-100 flex items-start gap-3 mb-8 shadow-sm">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Entry Not Found</p>
              <p className="text-sm text-red-600/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both">
          {/* Applicant Identity Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <User size={120} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-widest uppercase">
                      <ShieldCheck size={16} />
                      <span>Verified Applicant</span>
                   </div>
                   <h2 className="text-3xl font-black tracking-tight">{result.applicant?.full_name || "Applicant Records"}</h2>
                   <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm">
                         <MapPin size={14} />
                         <span>Global Network</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm font-mono tracking-tighter">
                         <Clock size={14} />
                         <span>Code: {result.applicant?.tracking_code}</span>
                      </div>
                   </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Contact Registered</p>
                   <p className="text-xl font-medium">{result.applicant?.phone || result.applicant?.email || "No contact info"}</p>
                </div>
             </div>
          </div>

          {/* Active Applications */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                   <Briefcase className="text-blue-600" size={20} />
                   Live Applications ({result.applications?.length || 0})
                </h3>
             </div>

             {result.applications?.map((app: any) => (
                <Card key={app.application_id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
                   <div className="flex flex-col lg:flex-row">
                      {/* Status Sidebar */}
                      <div className={`w-full lg:w-48 p-6 flex lg:flex-col items-center justify-center gap-3 border-b lg:border-b-0 lg:border-r border-slate-100 ${getStatusColor(app.status)?.split(' ')[0]}`}>
                         <div className={`p-4 rounded-full bg-white shadow-sm mb-2 group-hover:scale-110 transition-transform duration-500`}>
                            {app.status === 'under_review' ? <Clock className="text-amber-600" /> : <ShieldCheck className="text-indigo-600" />}
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">Current Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight border ${getStatusColor(app.status)}`}>
                               {app.status?.replace('_', ' ')}
                            </span>
                         </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-8">
                         <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div>
                               <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{app.position?.title}</h4>
                               <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                  {app.position?.department_name || "Recruitment Dept"} 
                                  <ChevronRight size={14} className="text-slate-300" />
                                  <Calendar size={14} className="ml-1" />
                                  <span>Applied {new Date(app.submitted_at).toLocaleDateString()}</span>
                               </p>
                            </div>
                            {app.evaluation && (
                               <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl md:text-right">
                                  <div className="flex items-center md:justify-end gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                                     <Wand2 size={12} className="text-indigo-500" />
                                     <span>AI Evaluation Match</span>
                                  </div>
                                  <div className="flex items-end md:justify-end gap-3">
                                     <div className="text-right">
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                           {parseFloat(app.evaluation.matching_percentage).toFixed(0)}<span className="text-lg text-slate-400">%</span>
                                        </div>
                                     </div>
                                     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${getFitLabelColor(app.evaluation.fit_label)}`}>
                                        {app.evaluation.fit_label}
                                     </div>
                                  </div>
                               </div>
                            )}
                         </div>

                         {/* AI Summary */}
                         {app.evaluation && app.evaluation.summary && (
                            <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                               <Quote className="absolute top-4 right-4 text-slate-200" size={20} />
                               <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">AI Profile Summary</p>
                               <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                  {app.evaluation.summary}
                               </p>
                            </div>
                         )}

                         {/* AI Insights Bar */}
                         {app.evaluation && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                               <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-1">
                                     <CheckCircle2 size={12} /> Matched Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                     {(app.evaluation.skill_gaps?.matched_skills || app.evaluation.matched_keywords)?.map((kw: string) => (
                                        <span key={kw} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg shadow-sm">
                                           {kw}
                                        </span>
                                     ))}
                                  </div>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                  <p className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1">
                                     <AlertCircle size={12} /> Optimization Gaps
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                     {(app.evaluation.skill_gaps?.missing_skills || app.evaluation.missing_keywords)?.map((kw: string) => (
                                        <span key={kw} className="px-2 py-0.5 bg-slate-200/50 text-slate-600 text-[10px] font-bold rounded-lg">
                                           {kw}
                                        </span>
                                     ))}
                                  </div>
                               </div>
                               {app.evaluation.skill_gaps?.gaps && app.evaluation.skill_gaps.gaps.length > 0 && (
                                 <div className="md:col-span-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                    <p className="text-[10px] font-black uppercase text-amber-600 mb-2">Improvement Roadmap</p>
                                    <ul className="space-y-1">
                                       {app.evaluation.skill_gaps.gaps.map((gap: string, i: number) => (
                                          <li key={i} className="text-xs text-amber-700 flex items-center gap-2">
                                             <ChevronRight size={12} /> {gap}
                                          </li>
                                       ))}
                                    </ul>
                                 </div>
                               )}
                            </div>
                         )}

                         <div className="flex items-center gap-4 text-slate-400 text-sm border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-1.5">
                               <Clock size={16} />
                               <span>Last updated: {new Date(app.evaluation?.evaluated_at || app.submitted_at).toLocaleDateString()}</span>
                            </div>
                         </div>

                         {/* AI Evaluation History (Public View) */}
                         {(app.screening_history?.length > 0 || app.screening_result?.history?.length > 0) && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                               <div className="flex items-center gap-2 mb-4">
                                  <History className="text-slate-400" size={16} />
                                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-widest">Previous Evaluations</h5>
                               </div>
                               <div className="space-y-2">
                                  {(app.screening_history || app.screening_result?.history).map((entry: any, idx: number) => (
                                     <div key={entry.id || idx} className="bg-slate-50/50 rounded-xl p-3 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                           <div className={`size-8 rounded-full flex items-center justify-center ${entry.status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                              {entry.status === 'passed' ? <CheckCircle2 size={14} /> : <Archive size={14} />}
                                           </div>
                                           <div>
                                              <p className="text-xs font-bold text-slate-700">Matched {formatScore(entry.final_score, 0)}% <span className="text-[10px] text-slate-400 font-medium font-mono uppercase ml-1">v{entry.evaluation_version}</span></p>
                                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                 <Calendar size={10} /> {new Date(entry.screened_at).toLocaleDateString()}
                                              </p>
                                           </div>
                                        </div>
                                        <div className="text-[10px] font-black uppercase bg-white px-2 py-1 rounded-md border border-slate-100 text-slate-400">
                                           {entry.archive_reason?.replace('_', ' ') || 'Archived'}
                                        </div>
                                     </div>
                                  ))}
                                  <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                     <Info size={12} className="text-blue-500 shrink-0" />
                                     <p className="text-[10px] text-blue-700/70 font-medium italic">
                                        Our AI evaluations are versioned to ensure your profile is always compared against the most up-to-date requirements.
                                     </p>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>
                </Card>
             ))}
          </div>

          {/* Document Repository */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                   <FileText className="text-blue-600" size={20} />
                   Submitted Documents
                </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.applicant?.documents?.map((doc: any) => (
                   <div key={doc.upload_id} className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <FileText size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{doc.original_name}</p>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                               {doc.document_type?.replace('_', ' ')} • {(doc.size_bytes / 1024).toFixed(1)} KB
                            </span>
                         </div>
                      </div>
                      <a 
                        href={getMediaUrl(doc.file_path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all text-slate-400"
                        title="View Document"
                      >
                         <ExternalLink size={14} />
                      </a>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Footer Support */}
      {!result && !loading && (
        <div className="mt-20 text-center text-slate-400 space-y-4">
           <p className="text-sm font-medium">Lost your tracking code? Contact support at recruitment@ourcompany.com</p>
           <div className="flex justify-center gap-4">
              <div className="h-1 w-12 bg-slate-200 rounded-full" />
              <div className="h-1 w-4 bg-slate-200 rounded-full" />
              <div className="h-1 w-12 bg-slate-200 rounded-full" />
           </div>
        </div>
      )}
    </div>
  );
}
