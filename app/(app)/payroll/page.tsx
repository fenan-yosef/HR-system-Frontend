"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PayrollPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          View your payslips, earnings history, and tax documents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-none shadow-sm h-full bg-linear-to-br from-primary/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="size-32 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  YTD Earnings
                </span>
                <h2 className="text-4xl font-black mt-2 text-foreground">
                  $42,500.00
                </h2>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                <TrendingUp className="size-4" /> +12% from last year
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Next Payout Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-none shadow-sm h-full flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Next Payout
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="size-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Feb 28, 2026
                </h2>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Salary</span>
                <span className="font-bold tabular-nums">$3,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonuses</span>
                <span className="font-bold tabular-nums">$500.00</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base font-black">
                <span>Estimated Net</span>
                <span className="text-primary tabular-nums">$3,150.00</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Method Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-none shadow-sm h-full flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Payment Method
              </span>
              <div className="flex items-center gap-3 mt-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CreditCard className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Chase Bank</p>
                  <p className="text-xs text-muted-foreground">**** 4242</p>
                </div>
              </div>
            </div>
            <button className="text-xs font-bold text-primary hover:underline mt-4 self-start">
              Update Details
            </button>
          </Card>
        </motion.div>
      </div>

      {/* Payslips List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Recent Payslips</h3>
        <div className="space-y-3">
          {[
            {
              month: "January",
              year: 2026,
              date: "Jan 31, 2026",
              amount: "$3,150.00",
              status: "Paid",
            },
            {
              month: "December",
              year: 2025,
              date: "Dec 31, 2025",
              amount: "$3,150.00",
              status: "Paid",
            },
            {
              month: "November",
              year: 2025,
              date: "Nov 30, 2025",
              amount: "$3,150.00",
              status: "Paid",
            },
            {
              month: "October",
              year: 2025,
              date: "Oct 31, 2025",
              amount: "$3,150.00",
              status: "Paid",
            },
          ].map((slip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {slip.month.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {slip.month} {slip.year} Payslip
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paid on {slip.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <p className="font-bold text-foreground tabular-nums">
                      {slip.amount}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {slip.status}
                    </span>
                  </div>
                  <button className="size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Download className="size-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
