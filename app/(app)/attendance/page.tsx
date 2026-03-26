"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Clock, LogIn, LogOut, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

type AttendanceStatus = "present" | "active";

interface AttendanceEntry {
   dateKey: string;
   checkIn: string;
   checkOut: string | null;
   totalMinutes: number;
   status: AttendanceStatus;
}

function pad(value: number) {
   return String(value).padStart(2, "0");
}

function getDateKey(date: Date) {
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(value: Date) {
   return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateKey: string) {
   const date = new Date(`${dateKey}T00:00:00`);
   return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatMinutes(totalMinutes: number) {
   const hours = Math.floor(totalMinutes / 60);
   const minutes = totalMinutes % 60;
   return `${pad(hours)}h ${pad(minutes)}m`;
}

function differenceInMinutes(start: Date, end: Date) {
   return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

function getWeekDates(referenceDate: Date) {
   const current = new Date(referenceDate);
   const day = current.getDay();
   const diffToMonday = day === 0 ? -6 : 1 - day;
   const monday = new Date(current);
   monday.setDate(current.getDate() + diffToMonday);

   return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
   });
}

export default function AttendancePage() {
   const [now, setNow] = useState(new Date());
   const [activeSessionStart, setActiveSessionStart] = useState<Date | null>(null);
   const [activity, setActivity] = useState<AttendanceEntry[]>([
      { dateKey: "2026-03-14", checkIn: "09:00 AM", checkOut: "05:30 PM", totalMinutes: 510, status: "present" },
      { dateKey: "2026-03-13", checkIn: "08:45 AM", checkOut: "05:10 PM", totalMinutes: 505, status: "present" },
      { dateKey: "2026-03-12", checkIn: "09:15 AM", checkOut: "05:40 PM", totalMinutes: 505, status: "present" },
      { dateKey: "2026-03-11", checkIn: "09:05 AM", checkOut: "05:20 PM", totalMinutes: 495, status: "present" },
      { dateKey: "2026-03-10", checkIn: "08:55 AM", checkOut: "05:25 PM", totalMinutes: 510, status: "present" },
   ]);

   useEffect(() => {
      const timer = window.setInterval(() => {
         setNow(new Date());
      }, 1000);

      return () => window.clearInterval(timer);
   }, []);

   const todayKey = getDateKey(now);
   const activeMinutes = activeSessionStart ? differenceInMinutes(activeSessionStart, now) : 0;

   const handleCheckIn = () => {
      if (activeSessionStart) return;

      const checkInTime = new Date();
      const nextDateKey = getDateKey(checkInTime);

      setActiveSessionStart(checkInTime);
      setActivity((previous) => {
         const existingIndex = previous.findIndex((entry) => entry.dateKey === nextDateKey);
         const nextEntry: AttendanceEntry = {
            dateKey: nextDateKey,
            checkIn: formatTime(checkInTime),
            checkOut: null,
            totalMinutes: 0,
            status: "active",
         };

         if (existingIndex === -1) {
            return [nextEntry, ...previous].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
         }

         return previous.map((entry, index) => (index === existingIndex ? nextEntry : entry));
      });
   };

   const handleCheckOut = () => {
      if (!activeSessionStart) return;

      const checkOutTime = new Date();
      const totalMinutes = differenceInMinutes(activeSessionStart, checkOutTime);
      const nextDateKey = getDateKey(checkOutTime);

      setActivity((previous) =>
         previous.map((entry) =>
            entry.dateKey === nextDateKey
               ? {
                     ...entry,
                     checkOut: formatTime(checkOutTime),
                     totalMinutes,
                     status: "present",
                  }
               : entry,
         ),
      );
      setActiveSessionStart(null);
      setNow(checkOutTime);
   };

   const weeklyData = useMemo(() => {
      const entriesByDate = new Map(activity.map((entry) => [entry.dateKey, entry]));

      return getWeekDates(now).map((date) => {
         const dateKey = getDateKey(date);
         const matchingEntry = entriesByDate.get(dateKey);
         const totalMinutes =
            matchingEntry?.status === "active" && dateKey === todayKey
               ? activeMinutes
               : (matchingEntry?.totalMinutes ?? 0);

         return {
            label: date.toLocaleDateString([], { weekday: "short" }),
            totalMinutes,
            barHeight: Math.min(100, Math.round((totalMinutes / 540) * 100)),
         };
      });
   }, [activity, activeMinutes, now, todayKey]);

   const recentActivity = useMemo(() => {
      return [...activity]
         .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
         .slice(0, 6);
   }, [activity]);

   const todayEntry = activity.find((entry) => entry.dateKey === todayKey);

   return (
      <section className="space-y-8">
         <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
               <h1 className="text-4xl font-extrabold tracking-tight">Time Logs</h1>
               <p className="text-muted-foreground">Track attendance, shifts, and working hours.</p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={handleCheckIn}
                  disabled={Boolean(activeSessionStart)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <LogIn className="size-4" /> Check In
               </button>
               <button
                  onClick={handleCheckOut}
                  disabled={!activeSessionStart}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <LogOut className="size-4" /> Check Out
               </button>
            </div>
         </div>

         <div className="grid gap-6 md:grid-cols-4">
            <Card className="flex flex-col items-center justify-center border-none p-6 text-center shadow-sm">
               <div className="relative mb-4 flex size-32 items-center justify-center rounded-full border-4 border-primary/20">
                  <div className="text-center">
                     <span className="text-xs font-bold uppercase text-muted-foreground">Current Session</span>
                     <p className="tabular-nums text-3xl font-black text-foreground">{formatMinutes(activeMinutes)}</p>
                     <span className={`text-xs font-bold ${activeSessionStart ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {activeSessionStart ? "Active" : "Offline"}
                     </span>
                  </div>
                  {activeSessionStart && (
                     <div className="absolute right-0 top-0 size-4 rounded-full border-2 border-background bg-emerald-500 animate-pulse" />
                  )}
               </div>
               <p className="text-sm font-medium text-muted-foreground">
                  {todayEntry?.checkIn ? `Checked in at ${todayEntry.checkIn}` : "No check-in recorded for today"}
               </p>
            </Card>

            <Card className="border-none p-6 shadow-sm md:col-span-3">
               <h3 className="mb-6 text-lg font-bold">Weekly Overview</h3>
               <div className="flex h-48 items-end justify-between gap-2">
                  {weeklyData.map((day, index) => (
                     <div key={day.label} className="group flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-full w-full items-end overflow-hidden rounded-t-lg bg-muted">
                           <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${day.barHeight}%` }}
                              transition={{ duration: 0.8, delay: index * 0.08 }}
                              className="relative w-full rounded-t-lg bg-primary/20 transition-colors group-hover:bg-primary/40"
                           >
                              {day.totalMinutes > 0 && (
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[10px] font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                                    {formatMinutes(day.totalMinutes)}
                                 </div>
                              )}
                           </motion.div>
                        </div>
                        <span className="text-xs font-bold uppercase text-muted-foreground">{day.label}</span>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <div>
            <h3 className="mb-4 text-xl font-bold tracking-tight">Recent Activity</h3>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
               <table className="w-full text-left text-sm">
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
                     {recentActivity.map((entry) => (
                        <tr key={entry.dateKey} className="transition-colors hover:bg-muted/30">
                           <td className="flex items-center gap-2 px-6 py-4 font-medium">
                              <Calendar className="size-4 text-muted-foreground" /> {formatDateLabel(entry.dateKey)}
                           </td>
                           <td className="px-6 py-4">{entry.checkIn}</td>
                           <td className="px-6 py-4">{entry.checkOut ?? "Still active"}</td>
                           <td className="px-6 py-4 font-bold tabular-nums">
                              {entry.status === "active" && entry.dateKey === todayKey ? formatMinutes(activeMinutes) : formatMinutes(entry.totalMinutes)}
                           </td>
                           <td className="px-6 py-4">
                              {entry.status === "active" ? (
                                 <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                    <Clock className="size-3" /> Active
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    <CheckSquare className="size-3" /> Present
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))}
                     {recentActivity.length === 0 && (
                        <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-2">
                                 <XCircle className="size-4" /> No attendance activity recorded yet.
                              </span>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </section>
   );
}
