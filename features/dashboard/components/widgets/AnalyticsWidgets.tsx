"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function SimpleBarChart({ data, height = 200, color = "bg-primary" }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-2 w-full pt-8" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / max) * 100}%` }}
            transition={{ duration: 1, delay: i * 0.1 }}
            className={cn("w-full rounded-t-lg transition-all group-hover:brightness-110", color)}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-zinc-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg font-bold whitespace-nowrap z-30 shadow-xl border border-white/10 pointer-events-none">
              {item.value}h worked
            </div>
          </motion.div>
          <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

export function SimplePieChart({ data }: PieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const x1 = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180);
            currentAngle += angle;
            const x2 = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180);
            const largeArcFlag = angle > 180 ? 1 : 0;

            return (
              <motion.path
                key={i}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={item.color}
                className="hover:brightness-110 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
          <span className="text-xs font-black">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
            <span className="text-xs font-black ml-auto">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "black";
}

export function ActionButton({ label, icon: Icon, onClick, variant = "primary" }: ActionButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-border hover:bg-muted text-foreground",
    black: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-700 shadow-xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-sm transition-all",
        variants[variant]
      )}
    >
      <Icon className="size-5" />
      {label}
    </motion.button>
  );
}
