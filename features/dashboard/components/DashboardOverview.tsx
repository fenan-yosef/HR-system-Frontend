"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardMetrics } from "../services/dashboardService";
import { AdminDashboard } from "./roles/AdminDashboard";
import { CEODashboard } from "./roles/CEODashboard";
import { HRStaffDashboard } from "./roles/HRStaffDashboard";
import { EmployeeDashboard } from "./roles/EmployeeDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverview() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
        setError("Unable to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadMetrics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/4 bg-muted rounded-lg" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-rose-50 p-6 rounded-full mb-4">
          <span className="text-3xl text-rose-500">⚠️</span>
        </div>
        <h3 className="text-xl font-bold">{error}</h3>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const role = metrics.role || user?.role;

  switch (role) {
    case "ADMIN":
      return <AdminDashboard metrics={metrics} />;
    case "HR_CEO":
      return <CEODashboard metrics={metrics} />;
    case "HR_STAFF":
      return <HRStaffDashboard metrics={metrics} />;
    case "EMPLOYEE":
      return <EmployeeDashboard metrics={metrics} />;
    default:
      return (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold">Dashboard not available for your role ({role}).</h3>
        </div>
      );
  }
}
