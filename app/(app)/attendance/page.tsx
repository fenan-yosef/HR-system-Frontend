"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, LogIn, LogOut, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  clockIn,
  clockOut,
  fetchAttendanceLogs,
  summarizeAttendanceLog,
} from "@/services/attendanceService";
import { useToast } from "@/components/ui/toast";
import type { AttendanceEntry, AttendanceLog } from "@/types/attendance";

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getDateFromCheckIn(checkIn: string): string {
  const date = new Date(checkIn);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getTimeFromCheckIn(checkIn: string): string {
  const date = new Date(checkIn);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

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
  const { toast } = useToast();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceEntry | null>(
    null,
  );
  const [sessionElapsed, setSessionElapsed] = useState(0);

  // Load attendance logs on mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAttendanceLogs();
        setLogs(data);

        // Find active session
        const activeLogs = data.filter((log) => !log.check_out);
        if (activeLogs.length > 0) {
          const active = summarizeAttendanceLog(activeLogs[0]);
          setActiveSession(active);
        }
      } catch (error) {
        console.error("Failed to load attendance logs", error);
        toast("Failed to load attendance logs", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [toast]);

  // Update elapsed time for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setSessionElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleClockIn = async () => {
    try {
      setIsClocking(true);
      const location = await resolveLocationData();

      const payload: any = {};
      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
        payload.location = location.label;
      }

      const newLog = await clockIn(payload);
      const entry = summarizeAttendanceLog(newLog);

      setLogs((prev) => [newLog, ...prev]);
      setActiveSession(entry);
      setSessionElapsed(0);
      toast("Checked in successfully", "success");
    } catch (error) {
      console.error("Clock in failed", error);
      toast(
        "Failed to check in. You may already have an active session.",
        "error",
      );
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsClocking(true);
      const location = await resolveLocationData();

      const payload: any = {};
      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
        payload.location = location.label;
      }

      const updatedLog = await clockOut(payload);
      const entry = summarizeAttendanceLog(updatedLog);

      setLogs((prev) =>
        prev.map((log) =>
          log.attendance_id === updatedLog.attendance_id ? updatedLog : log,
        ),
      );
      setActiveSession(null);
      setSessionElapsed(0);
      toast("Checked out successfully", "success");
    } catch (error) {
      console.error("Clock out failed", error);
      toast(
        "Failed to check out. You may not have an active session.",
        "error",
      );
    } finally {
      setIsClocking(false);
    }
  };

  const currentSessionMinutes = activeSession
    ? activeSession.totalMinutes + sessionElapsed
    : 0;
  const currentSessionDisplay = formatMinutes(
    Math.floor(currentSessionMinutes / 60) * 60 + (currentSessionMinutes % 60),
  );

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
          <button
            onClick={handleClockIn}
            disabled={isClocking || !!activeSession}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClocking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Check In
          </button>
          <button
            onClick={handleClockOut}
            disabled={isClocking || !activeSession}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClocking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Check Out
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {activeSession ? (
          <Card className="p-6 border-none shadow-sm flex flex-col items-center justify-center text-center bg-emerald-500/5">
            <div className="size-32 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative mb-4">
              <div className="text-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Current Session
                </span>
                <p className="text-3xl font-black text-foreground tabular-nums">
                  {String(Math.floor(currentSessionMinutes / 60)).padStart(
                    2,
                    "0",
                  )}
                  :{String(currentSessionMinutes % 60).padStart(2, "0")}
                </p>
                <span className="text-xs text-emerald-500 font-bold">
                  Active
                </span>
              </div>
              <div className="absolute top-0 right-0 size-4 bg-emerald-500 rounded-full animate-pulse border-2 border-background" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Checked in at {activeSession.checkIn}
            </p>
          </Card>
        ) : (
          <Card className="p-6 border-none shadow-sm flex flex-col items-center justify-center text-center">
            <div className="size-32 rounded-full border-4 border-muted flex items-center justify-center relative mb-4">
              <div className="text-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  No Active Session
                </span>
                <p className="text-3xl font-black text-foreground">--:--</p>
                <span className="text-xs text-muted-foreground font-bold">
                  Offline
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Click "Check In" to start tracking
            </p>
          </Card>
        )}

        <Card className="md:col-span-3 p-6 border-none shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Activity Overview</h3>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No attendance logs yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.slice(0, 5).map((log) => {
                  const checkInDate = new Date(log.check_in);
                  const hasCheckOut = !!log.check_out;
                  const minutes = log.work_hours
                    ? Math.round(Number(log.work_hours) * 60)
                    : 0;

                  return (
                    <div
                      key={log.attendance_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {getDateFromCheckIn(log.check_in)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getTimeFromCheckIn(log.check_in)}
                          </p>
                        </div>
                      </div>
                      {hasCheckOut ? (
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums">
                            {formatMinutes(minutes)}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                            <CheckSquare className="size-3" /> Present
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 tracking-tight">Detailed Logs</h3>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No attendance logs available
            </div>
          ) : (
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
                {logs.map((log) => {
                  const checkInDate = new Date(log.check_in);
                  const checkOutDate = log.check_out
                    ? new Date(log.check_out)
                    : null;
                  const minutes = log.work_hours
                    ? Math.round(Number(log.work_hours) * 60)
                    : 0;
                  const hasCheckOut = !!log.check_out;

                  return (
                    <tr
                      key={log.attendance_id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        {checkInDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {checkInDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {checkOutDate
                          ? checkOutDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 font-bold tabular-nums">
                        {hasCheckOut ? formatMinutes(minutes) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {hasCheckOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                            <CheckSquare className="size-3" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
