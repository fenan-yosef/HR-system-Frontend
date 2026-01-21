import { Card } from "@/components/ui/card";

export function ApplicationsListPlaceholder() {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <h2 className="text-base font-semibold">Applications</h2>
      <p className="text-sm text-muted-foreground">
        This view will show incoming applications, their stages, and shortlisting
        decisions, integrated with intelligent ranking in later phases.
      </p>
    </Card>
  );
}
