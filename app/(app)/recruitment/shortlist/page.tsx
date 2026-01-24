import { ShortlistPlaceholder } from "@/features/recruitment/components/ShortlistPlaceholder";

export default function ShortlistPage() {
  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Shortlist
        </h1>
        <p className="text-base font-medium text-muted-foreground">
          Focus on top-tier talent and coordinate final decision processes.
        </p>
      </div>
      <ShortlistPlaceholder />
    </section>
  );
}
