"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, FileText, CheckCircle2, Clock, Filter, ArrowUpRight, Loader2 } from "lucide-react";
import { fetchApplications, triggerShortlist } from "@/services/recruitmentService";
import { Application } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { isHRStaff } from "@/lib/permissions";

export function ApplicationsList() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const canShortlist = isHRStaff(user);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetchApplications();
      setApps(response.results);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      window.alert("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async (appId: number) => {
    try {
      await triggerShortlist(appId);
      window.alert("Application shortlisted successfully");
      loadApplications(); // Refresh list
    } catch (error) {
      window.alert("Failed to shortlist application");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{apps.length} applications found</p>
        <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg bg-muted/50">
          <Filter className="size-4" />
          Filter
        </button>
      </div>

      <div className="grid gap-4">
        {apps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No applications found.</div>
        ) : (
          apps.map((app, i) => (
            <motion.div
              key={app.application_id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group flex items-center justify-between p-4 border-none shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base leading-none mb-1">{app.full_name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{app.position?.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === "shortlisted" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                    }`}>
                      {app.status === "shortlisted" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                      {app.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {canShortlist && app.status !== "shortlisted" && (
                      <button
                        onClick={() => handleShortlist(app.application_id)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        Shortlist
                      </button>
                    )}
                    <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/10 transition-colors cursor-pointer">
                      <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
