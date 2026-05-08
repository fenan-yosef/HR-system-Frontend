"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserCircle, 
  Briefcase, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Shield, 
  Lock, 
  Calendar, 
  FileText, 
  Share2, 
  PieChart, 
  Clock, 
  User,
  Settings,
  ArrowUpRight,
  ListTodo,
  ClipboardCheck,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const iconMap: Record<string, any> = {
  Users, UserCircle, Briefcase, Zap, ShieldCheck, Shield, Lock, Calendar, FileText, Share2, PieChart, Clock, User, Settings, ArrowUpRight, ListTodo, ClipboardCheck, ChevronRight, CheckCircle2, TrendingUp
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  purple: "bg-purple-500/10 text-purple-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  rose: "bg-rose-500/10 text-rose-600",
  cyan: "bg-cyan-500/10 text-cyan-600",
  sky: "bg-sky-500/10 text-sky-600",
  violet: "bg-violet-500/10 text-violet-600",
  orange: "bg-orange-500/10 text-orange-600",
  green: "bg-green-500/10 text-green-600",
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  delay?: number;
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  const Icon = iconMap[icon] || Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="group relative overflow-hidden border-none bg-card p-6 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={`rounded-2xl p-3 ${colorMap[color] || "bg-primary/10 text-primary"}`}>
              <Icon className="size-6" />
            </div>
            <TrendingUp className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight">
              {value}
            </p>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 size-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
      </Card>
    </motion.div>
  );
}
