"use client";

import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">
          Welcome new talent with a structured journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "New Hires",
            value: "12",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Pending Docs",
            value: "8",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Completed",
            value: "24",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Avg. Time",
            value: "3 Days",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <UserPlus className="size-5" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-none shadow-sm">
          <h3 className="text-lg font-bold mb-6">Active Workflows</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  AB
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Abebe Bikila</h4>
                  <p className="text-xs text-muted-foreground">
                    Software Engineer • Joined 2 days ago
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-primary">
                    60% Complete
                  </span>
                  <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-none bg-primary text-primary-foreground shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <Sparkles className="size-8 mb-4 text-white/40" />
            <h3 className="text-xl font-bold mb-2">Assign Mentors</h3>
            <p className="text-sm text-primary-foreground/80 mb-6">
              Pair new hires with experienced team members to boost retention.
            </p>
            <button className="w-full bg-background text-foreground py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors">
              Start Pairing
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10" />
        </Card>
      </div>
    </section>
  );
}
