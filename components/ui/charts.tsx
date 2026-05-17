"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ==========================================
// 1. Sleek Area Chart Component
// ==========================================
interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  strokeColor?: string;
  gradientColors?: [string, string];
  valuePrefix?: string;
  valueSuffix?: string;
}

export function AreaChart({
  data,
  height = 240,
  strokeColor = "#6366f1",
  gradientColors = ["rgba(99, 102, 241, 0.4)", "rgba(99, 102, 241, 0.0)"],
  valuePrefix = "",
  valueSuffix = "",
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height || height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  const { width } = dimensions;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = Math.max(10, width - paddingX * 2);
  const chartHeight = Math.max(10, height - paddingY * 2);

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find closest index based on X position
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
    setTooltipPos({
      x: points[closestIndex].x,
      y: points[closestIndex].y,
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-visible" style={{ height }}>
      {/* Dynamic Floating Tooltip */}
      <AnimatePresence>
        {hoverIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 pointer-events-none rounded-2xl bg-zinc-950/90 text-zinc-100 p-3 shadow-xl backdrop-blur-md border border-white/10 text-xs min-w-[120px]"
            style={{
              left: Math.max(10, Math.min(width - 130, tooltipPos.x - 60)),
              top: Math.max(10, tooltipPos.y - 70),
            }}
          >
            <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              {data[hoverIndex].label}
            </div>
            <div className="text-sm font-black mt-0.5">
              {valuePrefix}
              {data[hoverIndex].value.toLocaleString()}
              {valueSuffix}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        className="w-full h-full overflow-visible select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
          <clipPath id="chartClipPath">
            <motion.rect
              x="0"
              y="0"
              height={height}
              initial={{ width: 0 }}
              animate={{ width }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </clipPath>
        </defs>

        {/* X & Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + ratio * chartHeight;
          const gridVal = maxVal - ratio * valRange;
          return (
            <g key={i} className="opacity-40">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/20"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-bold fill-muted-foreground"
              >
                {valuePrefix}
                {Math.round(gridVal).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Chart Paths inside Clip Path */}
        <g clipPath="url(#chartClipPath)">
          {/* Fill Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Stroke Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* X Axis Labels */}
        {points.map((p, i) => {
          // Render label only for key points to avoid clutter
          const interval = Math.max(1, Math.round(points.length / 6));
          if (i % interval !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={height - paddingY + 18}
              textAnchor="middle"
              className="text-[10px] font-black fill-muted-foreground uppercase tracking-wider"
            >
              {p.label}
            </text>
          );
        })}

        {/* Interactive hover guides */}
        {hoverIndex !== null && points[hoverIndex] && (
          <g>
            {/* Vertical tracker dashed line */}
            <line
              x1={points[hoverIndex].x}
              y1={paddingY}
              x2={points[hoverIndex].x}
              y2={height - paddingY}
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />

            {/* Glowing active point marker */}
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].y}
              r="8"
              fill={strokeColor}
              className="opacity-20 animate-ping"
            />
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].y}
              r="5"
              fill={strokeColor}
              stroke="white"
              strokeWidth="2"
              className="shadow-xl"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

// ==========================================
// 2. Interactive Premium Donut Chart Component
// ==========================================
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
}

export function DonutChart({ data, centerLabel = "Total" }: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Concentric Circle Mathematics
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full p-4">
      {/* SVG Donut Ring Display */}
      <div className="relative size-40 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90 overflow-visible">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, i) => {
            const percentage = item.value / (total || 1);
            const strokeDashoffset = circumference - percentage * circumference;
            const currentRotation = accumulatedAngle;
            accumulatedAngle += percentage * 360;

            const isActive = activeIndex === i;

            return (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isActive ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, delay: i * 0.15, ease: "circOut" }}
                style={{
                  transformOrigin: "50px 50px",
                  rotate: `${currentRotation}deg`,
                  cursor: "pointer",
                }}
                className="transition-all hover:brightness-110"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        {/* Central Display Ring */}
        <div className="absolute inset-6 rounded-full bg-card/80 backdrop-blur-md shadow-inner flex flex-col items-center justify-center pointer-events-none select-none border border-black/5">
          <span className="text-2xl font-black tracking-tight text-foreground">
            {activeIndex !== null ? data[activeIndex].value : total}
          </span>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center max-w-[80px] truncate">
            {activeIndex !== null ? data[activeIndex].label : centerLabel}
          </span>
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="flex-1 space-y-3 w-full max-w-[200px]">
        {data.map((item, i) => {
          const isActive = activeIndex === i;
          const percentage = Math.round((item.value / (total || 1)) * 100);

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border border-transparent",
                isActive ? "bg-muted/60 border-border/50 shadow-sm" : "hover:bg-muted/30"
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="size-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-black text-foreground/80 truncate flex-1">
                {item.label}
              </span>
              <span className="text-xs font-black text-muted-foreground">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. Interactive Glowing Bar Chart Component
// ==========================================
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  hoverColor?: string;
  valueSuffix?: string;
}

export function InteractiveBarChart({
  data,
  height = 200,
  color = "from-indigo-500 to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
  hoverColor = "from-indigo-400 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]",
  valueSuffix = "",
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-3 w-full pt-8 relative px-2" style={{ height }}>
      {data.map((item, i) => {
        const isHovered = hoveredIdx === i;
        const heightPercent = (item.value / max) * 100;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Value Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[10px] font-black py-1.5 px-2.5 rounded-xl border border-white/10 shadow-xl whitespace-nowrap z-30"
                >
                  {item.value}
                  {valueSuffix}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Bar Column */}
            <div className="w-full relative overflow-visible">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                className={cn(
                  "w-full rounded-t-xl bg-gradient-to-t transition-all",
                  isHovered ? hoverColor : color
                )}
              />
            </div>

            {/* X Axis Label */}
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center truncate w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
