import { JobPostingListPlaceholder } from "@/features/recruitment/components/JobPostingListPlaceholder";
import { Plus } from "lucide-react";

export default function JobPostingsPage() {
  return (
    <section className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Job Postings
          </h1>
          <p className="text-base font-medium text-muted-foreground">
            Orchestrate your hiring strategy and manage role visibility.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="size-4" />
          Create New Posting
        </button>
      </div>
      <JobPostingListPlaceholder />
    </section>
  );
}
