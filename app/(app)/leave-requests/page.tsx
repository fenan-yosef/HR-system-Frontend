"use client";

import { motion } from "framer-motion";
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LeaveRequestsPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Time Off</h1>
          <p className="text-muted-foreground">
            Manage your leave requests and check your balances.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Plus className="size-4" /> Request Time Off
        </button>
      </div>

      {/* Leave Balances */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Annual Leave", used: 5, total: 20, color: "bg-blue-500" },
          { label: "Sick Leave", used: 1, total: 10, color: "bg-emerald-500" },
          { label: "Unpaid Leave", used: 0, total: 5, color: "bg-amber-500" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-none shadow-sm relative overflow-hidden group">
              <div
                className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}
              >
                <CalendarDays
                  className={`size-24 ${item.color.replace("bg-", "text-")}`}
                />
              </div>

              <div className="relative z-10">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {item.label}
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">
                    {item.total - item.used}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / {item.total} days available
                  </span>
                </div>

                <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.used / item.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-2">
                  {item.used} days used
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Requests List */}
      <div>
        <h3 className="text-xl font-bold mb-4 tracking-tight">
          Recent Requests
        </h3>
        <div className="grid gap-4">
          {[
            {
              type: "Annual Leave",
              from: "Feb 12",
              to: "Feb 15",
              days: 3,
              status: "Approved",
              statusColor: "text-emerald-500 bg-emerald-500/10",
              icon: CheckCircle2,
            },
            {
              type: "Sick Leave",
              from: "Jan 10",
              to: "Jan 10",
              days: 1,
              status: "Approved",
              statusColor: "text-emerald-500 bg-emerald-500/10",
              icon: CheckCircle2,
            },
            {
              type: "Unpaid Leave",
              from: "Dec 24",
              to: "Dec 26",
              days: 2,
              status: "Rejected",
              statusColor: "text-red-500 bg-red-500/10",
              icon: XCircle,
            },
            {
              type: "Annual Leave",
              from: "Mar 01",
              to: "Mar 05",
              days: 5,
              status: "Pending",
              statusColor: "text-amber-500 bg-amber-500/10",
              icon: Clock,
            },
          ].map((req, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 flex items-center justify-between border-l-4 border-l-primary/0 hover:border-l-primary transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <CalendarDays className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{req.type}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>
                        {req.from} - {req.to}
                      </span>
                      <span className="size-1 rounded-full bg-muted-foreground/30" />
                      <span>{req.days} days</span>
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${req.statusColor}`}
                >
                  <req.icon className="size-3.5" /> {req.status}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
