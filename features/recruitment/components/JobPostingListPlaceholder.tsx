import { Card } from "@/components/ui/card";

export function JobPostingListPlaceholder() {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <h2 className="text-base font-semibold">Job Postings</h2>
      <p className="text-sm text-muted-foreground">
        This view will list open, closed, and draft job postings retrieved from the
        Django REST recruitment API.
      </p>
    </Card>
  );
}
