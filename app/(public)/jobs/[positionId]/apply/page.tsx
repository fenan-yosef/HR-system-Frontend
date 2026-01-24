"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createApplicant } from "@/services/recruitmentService";
import { CreateApplicant, ApplicantResponse } from "@/types/recruitment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ApplicationPage() {
  const params = useParams();
  const positionId = Number(params.positionId);
  
  const [formData, setFormData] = useState<Omit<CreateApplicant, "position_id">>({
    full_name: "",
    email: "",
    phone: "",
    cv_path: "test/Profile.pdf", // Default as per requirements, or empty. I'll leave empty for user to input or keep it if they want to simulate. 
    // Wait, prompt says: request payload { ... "cv_path": "test/Profile.pdf" }
    // I'll default it to empty string but maybe use a placeholder?
    // As it is a string field "CV Path", I'll let user type it.
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<ApplicantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: CreateApplicant = {
      ...formData,
      position_id: positionId, // Include positionId if the backend supports it, otherwise it might be ignored or cause error if not expected. 
      // Given the RESTful nature, usually POST /applicants creates a profile. 
      // But we are applying for a job.
      // I'll send it.
    };

    try {
      const response = await createApplicant(payload);
      setSuccessData(response);
    } catch (err: any) {
      console.error("Application failed", err);
      // Try to extract useful error message
      const msg = err.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Application Submitted!</CardTitle>
            <CardDescription className="text-green-700">
              Thank you for applying for this position.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Your Tracking Code</p>
              <p className="text-3xl font-mono font-bold text-gray-800 tracking-wider select-all">
                {successData.tracking_code}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Save this code to track your application status.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              We have sent a confirmation email to <strong>{successData.email}</strong>.
            </p>
            <div className="pt-4">
              <Link href="/jobs">
                <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                  Back to Jobs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/jobs/${positionId}`} 
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Job Details
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Apply for Position</CardTitle>
          <CardDescription>
            Please fill in your details below to submit your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Ex. John Doe"
                required
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex. john@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ex. +1-555-0100"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv_path">CV / Resume Path (URL or File Path)</Label>
              <Input
                id="cv_path"
                name="cv_path"
                placeholder="Ex. test/Profile.pdf"
                required
                value={formData.cv_path}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                * Enter a file path or URL for your CV as per requirements.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
