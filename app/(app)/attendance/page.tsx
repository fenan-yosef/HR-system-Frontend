"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, LogIn, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { clockIn, clockOut, fetchAttendanceLogs, summarizeAttendanceLog } from "@/services/attendanceService";
import type { AttendanceEntry } from "@/types/attendance";

import { 
   getDateKey, 
   getWeekDates, 
   formatDateLabel, 
   formatMinutes, 
   differenceInMinutes 
} from "@/lib/utils-date";

async function resolveLocationData() {
   if (typeof navigator === "undefined" || !navigator.geolocation) {
      return null;
   }

   return new Promise<{
      latitude: number;
      longitude: number;
      accuracy: number;
      label: string;
   } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            resolve({
               latitude,
               longitude,
               accuracy,
               label: `${latitude.toFixed(7)}, ${longitude.toFixed(7)}`,
            });
         },
         () => resolve(null),
         {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
         },
      );
   });
}

export default function AttendancePage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Time Logs</h1>
          <p className="text-muted-foreground">
            Track attendance, shifts, and working hours.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
            <LogIn className="size-4" /> Check In
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all opacity-50 cursor-not-allowed">
            <LogOut className="size-4" /> Check Out
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 border-none shadow-sm flex flex-col items-center justify-center text-center">
          <div className="size-32 rounded-full border-4 border-primary/20 flex items-center justify-center relative mb-4">
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Current Session
              </span>
              <p className="text-3xl font-black text-foreground tabular-nums">
                04:21
              </p>
              <span className="text-xs text-emerald-500 font-bold">Active</span>
            </div>
            <div className="absolute top-0 right-0 size-4 bg-emerald-500 rounded-full animate-pulse border-2 border-background" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Checked in at 09:00 AM
          </p>
        </Card>

        <Card className="md:col-span-3 p-6 border-none shadow-sm">
          <h3 className="text-lg font-bold mb-6">Weekly Overview</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const height = [60, 85, 45, 90, 80, 0, 0][i];
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full bg-muted rounded-t-lg relative overflow-hidden h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-primary/20 group-hover:bg-primary/40 transition-colors rounded-t-lg relative"
                    >
                      {height > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          8h 30m
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 tracking-tight">
          Recent Activity
        </h3>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Total Hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" /> Jan 2
                    {4 - i}, 2026
                  </td>
                  <td className="px-6 py-4">09:00 AM</td>
                  <td className="px-6 py-4">05:30 PM</td>
                  <td className="px-6 py-4 font-bold tabular-nums">08h 30m</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <CheckSquare className="size-3" /> Present
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
