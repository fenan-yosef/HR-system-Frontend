"use client";

import { useState } from "react";
import { trackApplicant } from "@/services/recruitmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

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
      const data = await trackApplicant(trackingCode, email);
      setResult(data);
    } catch (err: any) {
      console.error("Tracking failed", err);
      setError("Could not find an application with that tracking code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            Track Your Application
          </CardTitle>
          <CardDescription>
            Enter your tracking code to see the current status of your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking_code">Tracking Code</Label>
              <Input
                id="tracking_code"
                placeholder="Ex. J8K2Q4ZR"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex. alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Helping us verify your identity if needed.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching..." : "Track Application"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
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
                <p className="text-sm font-medium text-gray-500">Applicant Name</p>
                <p className="text-lg font-semibold">{result.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mt-1">
                  {result.status || "Received"}
                </span>
              </div>
              {result.position && (
                 <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p>{result.position.title || result.position}</p>
                 </div>
              )}
              <div className="col-span-2">
                 <p className="text-sm font-medium text-gray-500">Submitted On</p>
                 <p>{result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : "N/A"}</p>
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
