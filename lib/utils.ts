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

/**
 * Extracts a candidate-friendly application path from a JobPosition.
 * Prefers public_id, fallback to extracting UUID from application_url, final fallback to numeric route.
 */
export function getJobApplyPath(job: { public_id?: string; position_id: number; application_url?: string }): string {
  if (job.public_id) return `/apply/${job.public_id}`;
  
  if (job.application_url) {
    // Expected format: http://.../public/apply/[UUID]/
    try {
      const parts = job.application_url.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      // Simple heuristic for UUID: length > 30 and contains hyphens
      if (lastPart.length > 30 && lastPart.includes('-')) {
        return `/apply/${lastPart}`;
      }
    } catch (e) {
      console.warn("Failed to parse application_url for UUID extraction");
    }
  }
  
  return `/jobs/${job.position_id}/apply`;
}
