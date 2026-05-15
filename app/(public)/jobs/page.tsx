"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPublicJobPositions,
  fetchDepartmentsAll
} from "@/services/recruitmentService";
import { JobPosition } from "@/types/recruitment";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<number | "all">("all");

  useEffect(() => {
    fetchPublicJobPositions()
      .then((response) => {
        // Filter for open jobs only
        const openJobs = response.results.filter(
          (job) => job.status === "open",
        );
        setJobs(openJobs);
        setDepartments(deptRes.results || []);
      })
      .catch((err) => {
        console.error("Failed to load data", err);
        setError("Unable to load job openings. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDeptName = (id?: number | null) => {
    if (!id) return "General";
    return departments.find(d => d.department_id === id)?.name || "Department";
  };

  const handleShare = (job: JobPosition) => {
    const applyPath = getJobApplyPath(job);
    const url = `${window.location.origin}${applyPath}`;
    if (navigator.share) {
      navigator.share({
        title: `Apply for ${job.title}`,
        text: `Check out this opening: ${job.title}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "all" || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

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
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
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
          Explore exciting opportunities and help us build the future. We are
          always looking for talented individuals.
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
            <Card
              key={job.position_id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-blue-600">
                      <Link
                        href={`/jobs/${job.position_id}`}
                        className="hover:underline"
                      >
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
              <CardFooter>
                <Link
                  href={`/jobs/${job.position_id}`}
                  className="w-full sm:w-auto"
                >
                  <Button>View Details & Apply</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
