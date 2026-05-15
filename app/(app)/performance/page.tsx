"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, MessageSquare, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PerformancePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Performance</h1>
        <p className="text-muted-foreground">
          Track your goals, reviews, and continuous improvement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Overall Rating Card */}
        <Card className="p-6 border-none shadow-sm flex flex-col items-center justify-center text-center bg-linear-to-b from-background to-muted/20">
          <div className="size-32 rounded-full border-8 border-muted flex items-center justify-center relative mb-4">
            <svg
              className="absolute inset-0 size-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-primary"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset="37.68" /* 85% filled */
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-4xl font-black text-foreground">4.8</span>
              <span className="text-xs text-muted-foreground block">/ 5.0</span>
            </div>
          </div>
          <h3 className="text-lg font-bold">Excellent</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Last review: Dec 2025
          </p>
        </Card>

        {/* Stats */}
        <div className="grid gap-6">
          <Card className="p-6 border-none shadow-sm flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Target className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Goals Completed
              </p>
              <p className="text-2xl font-black">12/15</p>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-full">
              <Award className="size-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Achievements
              </p>
              <p className="text-2xl font-black">8</p>
            </div>
          </Card>
        </div>

        {/* Next Review */}
        <Card className="p-6 border-none shadow-sm bg-primary text-primary-foreground flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="size-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold">Upcoming Review</h3>
            <p className="opacity-80 text-sm mt-1">Q1 Performance Review</p>
          </div>
          <div className="relative z-10 mt-6">
            <div className="text-4xl font-black">14</div>
            <div className="text-sm font-medium opacity-80">Days remaining</div>
            <button className="mt-4 w-full py-2 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
              Prepare Self-Assessment
            </button>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Active Goals */}
        <Card className="p-6 border-none shadow-sm flex flex-col bg-linear-to-b from-background to-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Active Goals</h3>
            <button className="text-sm font-bold text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                title: "Improve Frontend Performance by 20%",
                due: "Mar 30",
                progress: 75,
                status: "On Track",
                color: "bg-emerald-500",
              },
              {
                title: "Complete Advanced React Certification",
                due: "Apr 15",
                progress: 40,
                status: "At Risk",
                color: "bg-amber-500",
              },
              {
                title: "Mentor Junior Developers",
                due: "Ongoing",
                progress: 90,
                status: "On Track",
                color: "bg-blue-500",
              },
            ].map((goal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4 border-none shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-foreground">
                      {goal.title}
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${goal.status === "On Track" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Due: {goal.due}</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${goal.color}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Feedback */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Recent Feedback</h3>
          <div className="space-y-4">
            {[
              {
                from: "Sarah Connors",
                role: "Product Manager",
                text: "Great work on the dashboard animations! They really improve the UX.",
                date: "2 days ago",
              },
              {
                from: "Mike Ross",
                role: "Tech Lead",
                text: "Solid code quality on the auth module. Keep up the good documentation.",
                date: "1 week ago",
              },
            ].map((feedback, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className="p-4 border-none shadow-sm">
                  <div className="flex gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground italic">
                        &quot;{feedback.text}&quot;
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {feedback.from}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {feedback.role}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {feedback.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
