"use client";

import { motion } from "framer-motion";
import { Clock, Calendar, FileText, User, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";

interface EmployeeDashboardProps {
  metrics: any;
}

export function EmployeeDashboard({ metrics }: EmployeeDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-orange-600">Welcome Back!</h2>
          <p className="text-muted-foreground">Here's an overview of your work status.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Widget */}
        <Card className="p-6 border-none bg-white shadow-xl flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Clock className="size-6 text-orange-500" />
              </div>
              <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${
                metrics.personal_stats.attendance === 'Clocked In' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {metrics.personal_stats.attendance}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Punch Card</h3>
            <p className="text-muted-foreground text-sm mb-8">Remember to clock out when you finish.</p>
          </div>
          <button className="relative z-10 w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20">
            Clock Out Now
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-orange-500/10 transition-colors" />
        </Card>

        {/* Self Service */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl lg:col-span-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Zap className="size-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Quick Services</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Request Leave", icon: Calendar, color: "text-blue-500" },
              { label: "Request Letter", icon: FileText, color: "text-indigo-500" },
              { label: "Update Profile", icon: User, color: "text-emerald-500" },
            ].map((service, i) => (
              <button 
                key={i}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/50 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-4">
                  <service.icon className={`size-5 ${service.color}`} />
                  <span className="text-sm font-bold">{service.label}</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </Card>

        {/* Profile Completion */}
        <Card className="p-6 border-none bg-indigo-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-lg font-bold mb-4">Onboarding Progress</h3>
            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="size-24 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                <span className="text-2xl font-black">{metrics.personal_stats.profile_completion}%</span>
                <svg className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none" stroke="white" strokeWidth="4"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * metrics.personal_stats.profile_completion) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
            <p className="text-indigo-200 text-xs text-center">
              {metrics.personal_stats.profile_completion === 100 
                ? "Perfect! All steps completed." 
                : "Almost there! Complete your profile to unlock all features."}
            </p>
          </div>
          <div className="absolute top-0 left-0 size-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        </Card>
      </div>
    </div>
  );
}
