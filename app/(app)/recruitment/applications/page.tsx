import { ApplicationsListPlaceholder } from "@/features/recruitment/components/ApplicationsListPlaceholder";

export default function ApplicationsPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Applications</h1>
        <p className="text-sm text-muted-foreground">
          Track candidates across stages with future intelligent ranking support.
        </p>
      </div>
      <ApplicationsListPlaceholder />
    </section>
  );
}
