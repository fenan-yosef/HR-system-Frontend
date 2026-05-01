import { PendingIntervieweesList } from "@/features/recruitment/components/PendingIntervieweesList";

export default function PendingInterviewsPage() {
  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Pending Interviews
        </h1>
        <p className="text-base font-medium text-muted-foreground">
          Finalize interview invitations and review top candidates.
        </p>
      </div>
      <PendingIntervieweesList />
    </section>
  );
}
