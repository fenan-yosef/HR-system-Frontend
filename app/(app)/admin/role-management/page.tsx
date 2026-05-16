import { RoleGuard } from "@/context/RoleGuard";
import { RoleManagementWorkspace } from "@/features/admin-role-management/components/RoleManagementWorkspace";

export default function RoleManagementPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <RoleManagementWorkspace />
    </RoleGuard>
  );
}
