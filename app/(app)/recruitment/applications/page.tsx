import { ApplicationsBoard } from "@/features/recruitment/components/ApplicationsBoard";

export default function ApplicationsPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-4xl space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
          Recruitment workspace
        </p>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Applications
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
          Scan candidates in compact job groups, open details only when needed, and keep AI-reviewed applicants visible without turning the page into a long wall of cards.
        </p>
      </div>
      <ApplicationsBoard />
    </section>
  );
}
