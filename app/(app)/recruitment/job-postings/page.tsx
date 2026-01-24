import { JobPositionManager } from "@/features/recruitment/components/JobPositionManager";

export default function JobPostingsPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Recruitment Workflow
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          Architect the future of your teams by managing pipeline and open positions.
        </p>
      </div>
      
      <JobPositionManager />
    </section>
  );
}
