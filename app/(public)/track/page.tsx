"use client";

import { useState } from "react";
import { trackApplicant } from "@/services/recruitmentService";
import type { ApplicantTrackingResult } from "@/types/recruitment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getMediaUrl } from "@/services/apiClient";
import { formatScore } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

export default function TrackApplicationPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicantTrackingResult | null>(null);
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
    } catch (err: unknown) {
      console.error("Tracking failed", err);
      setError(
        "Could not find an application with that tracking code. Please check and try again.",
      );
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
            Enter your tracking code to see the current status of your
            application.
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
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Applicant Name
                </p>
                <p className="text-lg font-semibold">
                  {result.full_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Status
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mt-1">
                  {result.status || "Received"}
                </span>
              </div>
              {result.position && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p>
                    {typeof result.position === "string"
                      ? result.position
                      : (result.position.title ?? "N/A")}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Submitted On
                </p>
                <p>
                  {result.submitted_at
                    ? new Date(result.submitted_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Steps Visualizer Placeholder */}
            {/* If we knew the status steps, we could render a progress bar here */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
