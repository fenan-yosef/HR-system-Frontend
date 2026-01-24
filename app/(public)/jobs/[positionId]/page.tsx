"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchPublicJobPosition } from "@/services/recruitmentService";
import { JobPosition } from "@/types/recruitment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = Number(params.positionId);
  const [job, setJob] = useState<JobPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) return;

    fetchPublicJobPosition(positionId)
      .then((data) => {
        setJob(data);
      })
      .catch((err) => {
        console.error("Failed to load job details", err);
        setError("Job not found or unable to load details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [positionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The job you are looking for does not exist or has been removed."}</p>
        <Link href="/jobs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/jobs" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Open Positions
      </Link>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">{job.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Posted on {new Date(job.posted_date).toLocaleDateString()}
              </p>
            </div>
            {job.status === "open" && (
              <Link href={`/jobs/${job.position_id}/apply`}>
                <Button size="lg" className="w-full md:w-auto">
                  Apply Now
                </Button>
              </Link>
            )}
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Department ID: {job.department}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status.replace("_", " ")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            {job.description || "No specific description provided."}
          </div>
          
          {/* If there were requirements, we would display them here. 
              The types interface has requirements?, checking recruitment.ts...
              Wait, JobPosition in recruitment.ts has:
              title, department, description, status, posted_date, closed_date, created_at.
              It does NOT have 'requirements'. JobPosting has it in types, but JobPosition does not?
              Let me check types/recruitment.ts content I read earlier.
              JobPosting has: description, requirements.
              JobPosition has: description | null. (No requirements field).
              So I will stick to description.
          */}
        </CardContent>
      </Card>

      {job.status === "open" && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Interested in this role?</h3>
          <p className="text-blue-700 mb-4">
            Submit your application today and join our growing team.
          </p>
          <Link href={`/jobs/${job.position_id}/apply`}>
            <Button size="lg">Apply for this Position</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
