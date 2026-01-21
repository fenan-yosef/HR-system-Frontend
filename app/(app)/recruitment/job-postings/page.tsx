import { JobPostingListPlaceholder } from "@/features/recruitment/components/JobPostingListPlaceholder";

export default function JobPostingsPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Job Postings</h1>
        <p className="text-sm text-muted-foreground">
          Manage open roles, departments, and locations for Guest Home Plc.
        </p>
      </div>
      <JobPostingListPlaceholder />
    </section>
  );
}
