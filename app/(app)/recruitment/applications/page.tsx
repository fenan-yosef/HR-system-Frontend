import { ApplicationsList } from "@/features/recruitment/components/ApplicationsList";

export default function ApplicationsPage() {
  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Applications
        </h1>
        <p className="text-base font-medium text-muted-foreground">
          Review incoming talent and track candidate progression.
        </p>
      </div>
      <ApplicationsList />
    </section>
  );
}
