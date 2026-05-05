import IdCardsTable from "@/components/hr/IdCardsTable";
import { RoleGuard } from "@/context/RoleGuard";

export default function IdCardsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_STAFF", "HR_CEO"]}>
      <section className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Employee ID Cards</h1>
          <p className="text-sm text-muted-foreground">Generate single or bulk printable ID cards.</p>
        </div>
        <IdCardsTable />
      </section>
    </RoleGuard>
  );
}
