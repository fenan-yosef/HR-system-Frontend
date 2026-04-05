"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPublicJobPositions } from "@/services/recruitmentService";
import { JobPosition } from "@/types/recruitment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { getJobApplyPath } from "@/lib/utils";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicJobPositions()
      .then((response) => {
        const results = Array.isArray(response) ? response : response.results;
        if (!results) {
          throw new Error("Public jobs response did not include results.");
        }
        // Filter for open jobs only
        const openJobs = results.filter((job) =>
          job.status === "open" || job.status === "opend"
        );
        setJobs(openJobs);
      })
      .catch((err) => {
        console.error("Failed to load jobs", err);
        setError("Unable to load job openings. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleShare = (job: JobPosition) => {
    const applyPath = getJobApplyPath(job);
    const url = `${window.location.origin}${applyPath}`;
    if (navigator.share) {
      navigator.share({
        title: `Apply for ${job.title}`,
        text: `Check out this job opening at our company: ${job.title}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Join Our Team
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore exciting opportunities and help us build the future. We are always looking for talented individuals.
        </p>
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No open positions at the moment. Please check back later.
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.position_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-blue-600">
                      <Link href={`/jobs/${job.position_id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Posted on {new Date(job.posted_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {job.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">
                  {job.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between gap-3">
                <div className="flex gap-2 flex-1 sm:flex-initial">
                  <Link href={`/jobs/${job.position_id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Link href={getJobApplyPath(job)}>
                    <Button>Apply Now</Button>
                  </Link>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare(job)}
                  className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                  title="Share job"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
