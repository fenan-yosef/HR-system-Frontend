"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPublicJobPositions,
  fetchDepartments
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
    Promise.all([
      fetchPublicJobPositions(),
      fetchDepartments()
    ])
      .then(([jobsRes, deptsRes]) => {
        // jobsRes is PaginatedResponse, deptsRes for dropdown is usually array or PaginatedResponse
        // Based on our service change, it calls /departments/dropdown/ which returns Array in DepartmentViewSet.dropdown
        const jobList = Array.isArray(jobsRes) ? jobsRes : (jobsRes.results || []);
        const openJobs = jobList.filter((job) => job.status === "open");
        setJobs(openJobs);

        const deptList = Array.isArray(deptsRes) ? deptsRes : (deptsRes.results || []);
        setDepartments(deptList);
      })
      .catch((err) => {
        console.error("Failed to load data", err);
        setError("Unable to load job openings. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDeptName = (job: JobPosition) => {
    if (job.department_name) return job.department_name;
    if (!job.department) return "General";
    return departments.find(d => d.department_id === job.department)?.name || "Department";
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "all" || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 text-red-500">
        <p className="text-xl">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-6"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 px-4 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Guest Home PLC
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Open Jobs, Find you perfect match and apply please.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search roles or keywords..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Filter by:</span>
          <select
            className="w-full md:w-64 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No positions found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.position_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          <Link href={`/jobs/${job.position_id}`}>
                            {job.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                            {getDeptName(job)}
                          </span>
                          <span>•</span>
                          <span>Posted {new Date(job.posted_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed line-clamp-2">
                      {job.description || "Join our team to help us build amazing products and scale our operations globally."}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link
                      href={`/jobs/${job.position_id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl h-11 transition-all shadow-md hover:shadow-blue-200">
                        View & Apply
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
