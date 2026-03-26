"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Sparkles, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

type PairingStatus = "awaiting_match" | "assigned";

interface PairingItem {
  hire: string;
  team: string;
  mentor: string;
  status: PairingStatus;
}

export default function OnboardingPage() {
  const [pairingStarted, setPairingStarted] = useState(false);
  const [pairings, setPairings] = useState<PairingItem[]>([
    { hire: "Abebe Bikila", team: "Frontend", mentor: "", status: "awaiting_match" },
    { hire: "Meron Tadesse", team: "People Ops", mentor: "", status: "awaiting_match" },
    { hire: "Kaleb Girma", team: "Platform", mentor: "", status: "awaiting_match" },
  ]);

  const tasks = [
    { title: "Complete Personal Info", status: "Completed", type: "Docs" },
    { title: "Upload Identification", status: "Pending", type: "Upload" },
    { title: "Review Handbook", status: "In Progress", type: "Reading" },
    { title: "Sign Contract", status: "Pending", type: "Sign" },
  ];

  const mentorOptions = [
    "Sara Kassa",
    "Daniel Bekele",
    "Helen Tesfaye",
    "Rahel Ayele",
    "Samuel Lemma",
  ];

  const assignedCount = pairings.filter((item) => item.status === "assigned").length;

  const updateMentorSelection = (hire: string, mentor: string) => {
    setPairings((prev) =>
      prev.map((item) => (item.hire === hire ? { ...item, mentor } : item)),
    );
  };

  const assignMentor = (hire: string) => {
    setPairings((prev) =>
      prev.map((item) => {
        if (item.hire !== hire || !item.mentor) return item;
        return { ...item, status: "assigned" };
      }),
    );
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">Welcome new talent with a structured journey.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "New Hires", value: "12", color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Docs", value: "8", color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Completed", value: "24", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg. Time", value: "3 Days", color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
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
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    AB
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Abebe Bikila</h4>
                    <p className="text-xs text-muted-foreground">Software Engineer • Joined 2 days ago</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-xs font-bold text-primary">60% Complete</span>
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
              <p className="text-sm text-primary-foreground/80 mb-6">Pair new hires with experienced team members to boost retention.</p>
              <button
                type="button"
                onClick={() => setPairingStarted(true)}
                disabled={pairingStarted}
                className="w-full bg-background text-foreground py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {pairingStarted ? "Pairing Started" : "Start Pairing"}
              </button>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10" />
        </Card>
      </div>

      {pairingStarted && (
        <Card className="p-6 border-none shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Mentor Pairing Queue</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <CheckCircle className="size-3.5" /> {assignedCount}/{pairings.length} Assigned
            </span>
          </div>

          <div className="grid gap-3">
            {pairings.map((pair) => (
              <div key={pair.hire} className="flex flex-col gap-3 rounded-xl border border-border/50 p-4 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{pair.hire}</p>
                    <p className="text-xs text-muted-foreground">Team: {pair.team}</p>
                  </div>
                  {pair.status === "assigned" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle className="size-3.5" /> Mentor Assigned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Clock className="size-3.5" /> Awaiting Match
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <select
                    value={pair.mentor}
                    onChange={(e) => updateMentorSelection(pair.hire, e.target.value)}
                    disabled={pair.status === "assigned"}
                    className="h-10 w-full sm:max-w-xs rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                  >
                    <option value="">Select Mentor</option>
                    {mentorOptions.map((mentor) => (
                      <option key={mentor} value={mentor}>
                        {mentor}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => assignMentor(pair.hire)}
                    disabled={!pair.mentor || pair.status === "assigned"}
                    className="h-10 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pair.status === "assigned" ? "Assigned" : "Assign Mentor"}
                  </button>
                </div>

                {pair.mentor && (
                  <p className="text-xs text-muted-foreground">
                    Selected mentor: <span className="font-semibold text-foreground">{pair.mentor}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
