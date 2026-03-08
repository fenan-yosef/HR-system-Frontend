import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mediaUrl(pathOrFilename: string | null | undefined) {
  if (!pathOrFilename) return "";
  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(pathOrFilename)) return pathOrFilename;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/g, "");
  const p = String(pathOrFilename).replace(/^\/+/, "");
  return `${base}/media/${encodeURIComponent(p)}`;
}
