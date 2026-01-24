import { ApplicationsListPlaceholder } from "@/features/recruitment/components/ApplicationsListPlaceholder";
import { Download } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <section className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Applications
          </h1>
          <p className="text-base font-medium text-muted-foreground">
            Review incoming talent and track candidate progression.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-card border border-border px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95">
          <Download className="size-4" />
          Export CSV
        </button>
      </div>
      <ApplicationsListPlaceholder />
    </section>
  );
}
