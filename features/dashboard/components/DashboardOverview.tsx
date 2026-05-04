"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  UserCircle,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";
import {
  fetchJobPositions,
  fetchApplications,
} from "@/services/recruitmentService";
import { fetchEmployees, fetchUsers } from "@/services/employeeService";
import { useEffect, useState } from "react";
import { JobPosition } from "@/types/recruitment";
import { Employee, User } from "@/types/employee";

export function DashboardOverview() {
  const { user } = useAuth();

  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =============================
     Animations
  ============================== */

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  /* =============================
     Fetch Data
  ============================== */

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [positionsRes, employeesRes, usersRes, shortlistRes] =
          await Promise.all([
            fetchJobPositions().catch(() => ({ results: [] })),
            fetchEmployees().catch(() => ({ results: [] })),
            fetchUsers().catch(() => ({ results: [] })),
            fetchApplications({ status: "shortlisted" }).catch(() => ({
              count: 0,
              results: [],
            })),
          ]);

        setPositions(positionsRes.results || []);
        setEmployees(
          Array.isArray(employeesRes)
            ? employeesRes
            : employeesRes.results || [],
        );
        setUsers(usersRes.results || []);
        setShortlistCount(shortlistRes.count || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  /* =============================
     Derived Stats (Auto-updates)
  ============================== */

  const totalusers = users.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active",
  ).length;
  const activeJobs = positions.length;

  const statCards = [
    {
      title: "Total Human Resource",
      value: loading ? "Loading..." : totalusers.toString(),
      desc: "All Employees in System",
      icon: UserCircle,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Active Jobs",
      value: loading ? "Loading..." : activeJobs.toString(),
      desc: "Open Job Positions",
      icon: ShieldCheck,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Active Employees",
      value: loading ? "Loading..." : activeEmployees.toString(),
      desc: "Employees Currently on work.",
      icon: Zap,
      color: "bg-amber-500/10 text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ===== Top Stat Cards ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="group relative overflow-hidden border-none bg-card p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${stat.color}`}>
                    <stat.icon className="size-6" />
                  </div>
                  <TrendingUp className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {stat.desc}
                  </p>
                </div>
              </div>

              <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Bottom Section ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Recent Activity */}
        <Card className="border-none bg-card p-6 sm:p-8 shadow-md lg:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Recent Activity
              </h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with team changes
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className="size-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <div className="flex-1 border-b border-border/50 pb-4">
                  <p className="text-sm font-bold">
                    New applicant for Senior Frontend Dev
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 hours ago • Recruitment Team
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hiring Roadmap */}
        <Card className="border-none bg-primary text-primary-foreground p-6 sm:p-8 shadow-lg lg:col-span-1 relative overflow-hidden">
          <div className="relative z-10">
            <Briefcase className="size-12 mb-6 text-white/20" />
            <h3 className="text-2xl font-bold mb-4 tracking-tight">
              Hiring Roadmap
            </h3>
            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
              Your recruitment pipeline is looking healthy. You have{" "}
              {loading ? "…" : activeJobs} active job postings and{" "}
              {loading ? "…" : shortlistCount} candidates in the shortlist.
            </p>
            <Link
              href="/recruitment/analytics"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:bg-opacity-90 active:scale-95"
            >
              View Analytics
            </Link>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </Card>
      </motion.div>
    </div>
  );
}
