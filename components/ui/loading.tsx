"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Loading({ className, size = "md" }: LoadingProps) {
  const sizeMap = {
    xs: "size-4",
    sm: "size-6",
    md: "size-10",
    lg: "size-16",
    xl: "size-24",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src="/loading.gif"
        alt="Loading..."
        className={cn(sizeMap[size], "object-contain")}
      />
    </div>
  );
}
