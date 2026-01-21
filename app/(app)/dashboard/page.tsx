import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Role-based dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Central workspace for HR staff, administrators, employees, and applicants.
        </p>
      </div>
      <DashboardOverview />
    </section>
  );
}
