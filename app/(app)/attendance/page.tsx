"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Clock, LogIn, LogOut, XCircle } from "lucide-react";
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
   const [now, setNow] = useState(new Date());
   const [activity, setActivity] = useState<AttendanceEntry[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [actionState, setActionState] = useState<"check-in" | "check-out" | null>(null);

   useEffect(() => {
      const timer = window.setInterval(() => {
         setNow(new Date());
      }, 1000);

      return () => window.clearInterval(timer);
   }, []);

   useEffect(() => {
      async function loadAttendance() {
         try {
            setLoading(true);
            setError(null);
            const logs = await fetchAttendanceLogs();
            setActivity(logs.map((log) => summarizeAttendanceLog(log, new Date())));
         } catch (loadError) {
            console.error("Failed to load attendance logs", loadError);
            setError("Unable to load attendance logs. Please try again.");
         } finally {
            setLoading(false);
         }
      }

      void loadAttendance();
   }, []);

   const todayKey = getDateKey(now);
   const activeEntry = activity.find((entry) => entry.status === "active") ?? null;
   const activeSessionStart = activeEntry ? new Date(activeEntry.checkInAt) : null;
   const activeMinutes = activeSessionStart ? differenceInMinutes(activeSessionStart, now) : 0;

   const refreshAttendance = async () => {
      const logs = await fetchAttendanceLogs();
      setActivity(logs.map((log) => summarizeAttendanceLog(log, new Date())));
   };

   const handleCheckIn = async () => {
      if (loading || actionState || activeEntry) return;

      setActionState("check-in");
      setError(null);

      try {
         const locationData = await resolveLocationData();
         await clockIn({
            check_in: new Date().toISOString(),
            location: locationData?.label ?? "Unknown",
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            accuracy: locationData?.accuracy,
         });
         await refreshAttendance();
         setNow(new Date());
      } catch (checkInError: any) {
         console.error("Failed to check in", checkInError);
         setError(checkInError?.detail ?? "Check-in failed. Please try again.");
      } finally {
         setActionState(null);
      }
   };

   const handleCheckOut = async () => {
      if (loading || actionState || !activeEntry) return;

      setActionState("check-out");
      setError(null);

      try {
         const locationData = await resolveLocationData();
         await clockOut({
            check_out: new Date().toISOString(),
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            accuracy: locationData?.accuracy,
         });
         await refreshAttendance();
         setNow(new Date());
      } catch (checkOutError: any) {
         console.error("Failed to check out", checkOutError);
         setError(checkOutError?.detail ?? "Check-out failed. Please try again.");
      } finally {
         setActionState(null);
      }
   };

   const weeklyData = useMemo(() => {
      const entriesByDate = new Map<string, AttendanceEntry[]>();

      for (const entry of activity) {
         const bucket = entriesByDate.get(entry.dateKey) ?? [];
         bucket.push(entry);
         entriesByDate.set(entry.dateKey, bucket);
      }

      return getWeekDates(now).map((date) => {
         const dateKey = getDateKey(date);
         const matchingEntries = entriesByDate.get(dateKey) ?? [];
         const totalMinutes = matchingEntries.reduce((sum, entry) => {
            if (entry.status === "active" && dateKey === todayKey) {
               return sum + activeMinutes;
            }

            return sum + entry.totalMinutes;
         }, 0);

         return {
            label: date.toLocaleDateString([], { weekday: "short" }),
            totalMinutes,
            barHeight: Math.min(100, Math.round((totalMinutes / 540) * 100)),
         };
      });
   }, [activity, activeMinutes, now, todayKey]);

   const recentActivity = useMemo(() => {
      return [...activity].sort((a, b) => b.checkInAt.localeCompare(a.checkInAt)).slice(0, 6);
   }, [activity]);

   const todayEntry = activity.find((entry) => entry.dateKey === todayKey) ?? null;

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
                  disabled={Boolean(activeEntry) || loading || Boolean(actionState)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <LogIn className="size-4" /> {actionState === "check-in" ? "Checking In..." : "Check In"}
               </button>
               <button
                  onClick={handleCheckOut}
                  disabled={!activeEntry || loading || Boolean(actionState)}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <LogOut className="size-4" /> {actionState === "check-out" ? "Checking Out..." : "Check Out"}
               </button>
            </div>
         </div>

         {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
               {error}
            </div>
         )}

         <div className="grid gap-6 md:grid-cols-4">
            <Card className="flex flex-col items-center justify-center border-none p-6 text-center shadow-sm">
               <span className="text-xs font-bold uppercase text-muted-foreground">Current Session</span>
               <div className="relative mb-4 flex size-32 items-center justify-center rounded-full border-4 border-primary/20">
                  <div className="text-center">
                     <p className="tabular-nums text-3xl font-black text-foreground">{formatMinutes(activeMinutes)}</p>
                     <span className={`text-xs font-bold ${activeEntry ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {activeEntry ? "Active" : "Offline"}
                     </span>
                  </div>
                  {activeEntry && (
                     <div className="absolute right-0 top-0 size-4 rounded-full border-2 border-background bg-emerald-500 animate-pulse" />
                  )}
               </div>
               <p className="text-sm font-medium text-muted-foreground">
                  {todayEntry?.checkIn ? `Checked in at ${todayEntry.checkIn}` : "No check-in recorded for today"}
               </p>
               {todayEntry?.location && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">Location: {todayEntry.location}</p>
               )}
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
                        <tr key={entry.attendanceId} className="transition-colors hover:bg-muted/30">
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
                     {!loading && recentActivity.length === 0 && (
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
