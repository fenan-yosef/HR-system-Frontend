"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, UserPlus, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { fetchApplicationMetrics } from "@/services/recruitmentService";

export function ApplicationMetrics() {
  const [metrics, setMetrics] = useState({
    total: 0,
    applied_today: 0,
    shortlisted: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchApplicationMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch application metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const stats = [
    {
      label: "Total Applications",
      value: metrics.total,
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Applied Today",
      value: metrics.applied_today,
      icon: UserPlus,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      label: "Shortlisted",
      value: metrics.shortlisted,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Pending Review",
      value: metrics.pending,
      icon: Clock,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border-none shadow-sm animate-pulse flex flex-col gap-2">
            <div className="size-8 rounded-lg bg-muted" />
            <div className="h-4 w-20 bg-muted" />
            <div className="h-6 w-12 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="p-4 border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-3">
              <div className={`size-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1.5">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
