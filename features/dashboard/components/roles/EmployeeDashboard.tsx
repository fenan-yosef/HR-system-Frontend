"use client";
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  MessageSquareText,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { getDateKey, getWeekDates } from "@/lib/utils-date";
import {
  clockIn,
  clockOut,
  fetchAttendanceLogs,
  summarizeAttendanceLog,
} from "@/services/attendanceService";
import type { AttendanceEntry } from "@/types/attendance";
import { InteractiveBarChart } from "@/components/ui/charts";
import { StatCard } from "../widgets/StatCard";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface EmployeeDashboardMetrics {
  stats?: DashboardStat[];
  personal_stats?: {
    attendance?: string;
    profile_completion?: number;
    weekly_hours?: number;
    total_days?: number;
  };
}

interface EmployeeDashboardProps {
  metrics?: EmployeeDashboardMetrics;
}

interface ServiceItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}

async function resolveLocationLabel() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  return new Promise<string | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(`${latitude.toFixed(7)}, ${longitude.toFixed(7)}`);
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

export function EmployeeDashboard({ metrics }: EmployeeDashboardProps) {
  const [attendanceActivity, setAttendanceActivity] = useState<
    AttendanceEntry[]
  >([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [actionState, setActionState] = useState<
    "check-in" | "check-out" | null
  >(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const stats = metrics?.stats ?? [];
  const personal = {
    attendance: metrics?.personal_stats?.attendance ?? "Unknown",
    profile_completion: metrics?.personal_stats?.profile_completion ?? 0,
    weekly_hours: metrics?.personal_stats?.weekly_hours ?? 0,
    total_days: metrics?.personal_stats?.total_days ?? 0,
  };

  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoadingAttendance(true);
        setAttendanceError(null);
        const logs = await fetchAttendanceLogs();
        setAttendanceActivity(logs.map((log) => summarizeAttendanceLog(log)));
      } catch (error) {
        console.error("Failed to load employee attendance", error);
        setAttendanceError("Attendance status could not be loaded.");
      } finally {
        setLoadingAttendance(false);
      }
    }

    void loadAttendance();
  }, []);

  const todayKey = new Date().toISOString().split("T")[0];

  const weeklyData = useMemo(() => {
    const entriesByDate = new Map<string, AttendanceEntry[]>();

    for (const entry of attendanceActivity) {
      const bucket = entriesByDate.get(entry.dateKey) ?? [];
      bucket.push(entry);
      entriesByDate.set(entry.dateKey, bucket);
    }

    return getWeekDates(new Date()).map((date: Date) => {
      const dateKey = getDateKey(date);
      const matchingEntries = entriesByDate.get(dateKey) ?? [];
      const totalMinutes = matchingEntries.reduce((sum, entry) => {
        if (entry.status === "active" && dateKey === todayKey) {
          const activeSessionStart = new Date(entry.checkInAt);
          const activeMins = Math.max(
            0,
            Math.floor(
              (new Date().getTime() - activeSessionStart.getTime()) / 60000,
            ),
          );
          return sum + activeMins;
        }

        return sum + entry.totalMinutes;
      }, 0);

      return {
        label: date.toLocaleDateString([], { weekday: "short" }),
        value: totalMinutes,
      };
    });
  }, [attendanceActivity, todayKey]);

  const activeEntry =
    attendanceActivity.find((entry) => entry.status === "active") ?? null;
  const latestEntry = attendanceActivity[0] ?? null;
  const attendanceLabel = activeEntry ? "Clocked In" : personal.attendance;
  const statusIsActive = attendanceLabel === "Clocked In";

  const handleAttendanceAction = async () => {
    if (loadingAttendance || actionState) return;

    setAttendanceError(null);

    try {
      if (activeEntry) {
        setActionState("check-out");
        await clockOut({ check_out: new Date().toISOString() });
      } else {
        setActionState("check-in");
        const location = await resolveLocationLabel();
        await clockIn({
          check_in: new Date().toISOString(),
          location: location ?? "Unknown",
        });
      }

      const logs = await fetchAttendanceLogs();
      setAttendanceActivity(logs.map((log) => summarizeAttendanceLog(log)));
    } catch (error) {
      console.error("Failed to update attendance from dashboard", error);
      setAttendanceError(
        activeEntry ? "Clock-out failed." : "Clock-in failed.",
      );
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-orange-600">
            Welcome Back!
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Here is an overview of your work status.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 border-none bg-white shadow-md flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="size-4.5 text-orange-500" />
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  statusIsActive
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {loadingAttendance ? "Loading..." : attendanceLabel}
              </span>
            </div>
            <h3 className="text-sm font-bold mb-1">Punch Card</h3>
            <p className="text-muted-foreground text-xs mb-2">
              {activeEntry
                ? `Checked in at ${activeEntry.checkIn}`
                : latestEntry
                  ? `Last attendance at ${latestEntry.checkIn}`
                  : "Remember to clock out when you finish."}
            </p>
            {attendanceError && (
              <p className="text-[10px] font-medium text-rose-600">
                {attendanceError}
              </p>
            )}
          </div>
          <button
            onClick={handleAttendanceAction}
            disabled={loadingAttendance || Boolean(actionState)}
            className="relative z-10 w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all active:scale-95 shadow-md shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionState === "check-in"
              ? "Clocking In..."
              : actionState === "check-out"
                ? "Clocking Out..."
                : activeEntry
                  ? "Clock Out Now"
                  : "Clock In Now"}
          </button>
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
        </Card>

        <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="size-4.5 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold">Quick Services</h3>
          </div>
          <div className="space-y-2">
            {(
              [
                {
                  label: "Request Leave",
                  icon: Calendar,
                  color: "text-blue-500",
                  href: ROUTES.LEAVE_REQUESTS,
                },
                {
                  label: "Request Letter",
                  icon: FileText,
                  color: "text-indigo-500",
                  href: ROUTES.EMPLOYEE_REQUEST_LETTER,
                },
                {
                  label: "Submit Complaint",
                  icon: MessageSquareText,
                  color: "text-rose-500",
                  href: ROUTES.EMPLOYEE_REQUEST_COMPLAINT,
                },
                {
                  label: "Update Profile",
                  icon: User,
                  color: "text-emerald-500",
                  href: ROUTES.MY_PROFILE,
                },
              ] as ServiceItem[]
            ).map((service, i) =>
              service.href ? (
                <Link
                  href={service.href}
                  key={i}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/50 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <service.icon className={`size-4 ${service.color}`} />
                    <span className="text-xs font-bold">{service.label}</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  key={i}
                  type="button"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/50 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <service.icon className={`size-4 ${service.color}`} />
                    <span className="text-xs font-bold">{service.label}</span>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ),
            )}
          </div>
        </Card>

        <Card className="p-4 border-none bg-indigo-900 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="text-sm font-bold mb-2">Onboarding Progress</h3>
            <div className="flex-1 flex flex-col justify-center items-center py-2">
              <div className="size-16 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                <span className="text-sm font-bold">
                  {personal.profile_completion}%
                </span>
                <svg className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="176"
                    strokeDashoffset={
                      176 - (176 * personal.profile_completion) / 100
                    }
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
            <p className="text-indigo-200 text-[10px] text-center mt-2 font-medium">
              {personal.profile_completion === 100
                ? "Perfect! All steps completed."
                : "Complete your profile to unlock all features."}
            </p>
          </div>
          <div className="absolute top-0 left-0 size-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl pointer-events-none" />
        </Card>
      </div>

      <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="size-4.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold">Weekly Attendance Overview</h3>
        </div>
        <div className="h-44">
          <InteractiveBarChart
            data={weeklyData.map((d: { label: string; value: number }) => ({
              label: d.label,
              value: Math.round((d.value / 60) * 10) / 10,
            }))}
            color="from-orange-500 to-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
            hoverColor="from-orange-400 to-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            height={120}
            valueSuffix="h"
          />
          <p className="text-[8px] text-center font-bold text-muted-foreground mt-1 uppercase tracking-wider">
            Hours worked per day
          </p>
        </div>
      </Card>
    </div>
  );
}
