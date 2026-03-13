import { ApplicationsList } from "@/features/recruitment/components/ApplicationsList";

export default function ApplicationsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Job Applications
        </h1>
        <p className="text-base font-medium text-muted-foreground">
          Manage and review incoming candidate applications.
        </p>
      </div>
      <ApplicationsList />
    </div>
  );
}
