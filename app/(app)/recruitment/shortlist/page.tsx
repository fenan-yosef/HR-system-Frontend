import { ShortlistPlaceholder } from "@/features/recruitment/components/ShortlistPlaceholder";

export default function ShortlistPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Shortlist</h1>
        <p className="text-sm text-muted-foreground">
          Review shortlisted candidates and coordinate interviews and offers.
        </p>
      </div>
      <ShortlistPlaceholder />
    </section>
  );
}
