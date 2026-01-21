import { Card } from "@/components/ui/card";

export function ShortlistPlaceholder() {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <h2 className="text-base font-semibold">Shortlist</h2>
      <p className="text-sm text-muted-foreground">
        This view will summarise shortlisted candidates, their source job postings,
        and upcoming interview activities.
      </p>
    </Card>
  );
}
