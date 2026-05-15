"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Beaker,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PermissionKey =
  | "recruitment.read"
  | "recruitment.write"
  | "employees.read"
  | "employees.write"
  | "security.audit"
  | "settings.update"
  | "roles.manage";

interface RoleProfile {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  permissions: PermissionKey[];
}

interface PermissionGroup {
  title: string;
  keys: PermissionKey[];
}

interface TrialRun {
  area: string;
  coverage: string;
  status: "Stable" | "Needs Review";
}

interface SimulationCase {
  id: string;
  title: string;
  required: PermissionKey[];
}

const ROLE_PROFILES: RoleProfile[] = [
  {
    id: 1,
    name: "Administrator",
    description: "Full policy governance and emergency override control.",
    memberCount: 2,
    permissions: [
      "recruitment.read",
      "recruitment.write",
      "employees.read",
      "employees.write",
      "security.audit",
      "settings.update",
      "roles.manage",
    ],
  },
  {
    id: 2,
    name: "HR Staff",
    description: "Operational ownership for recruitment and employee changes.",
    memberCount: 8,
    permissions: ["recruitment.read", "recruitment.write", "employees.read", "employees.write"],
  },
  {
    id: 3,
    name: "Auditor",
    description: "Read-only visibility into access and compliance logs.",
    memberCount: 3,
    permissions: ["recruitment.read", "employees.read", "security.audit"],
  },
];

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Talent Operations",
    keys: ["recruitment.read", "recruitment.write"],
  },
  {
    title: "Workforce Records",
    keys: ["employees.read", "employees.write"],
  },
  {
    title: "Platform Control",
    keys: ["security.audit", "settings.update", "roles.manage"],
  },
];

const TRIAL_RUNS: TrialRun[] = [
  { area: "Role catalog cards", coverage: "6/6 states", status: "Stable" },
  { area: "Permission matrix", coverage: "21 assertions", status: "Stable" },
  { area: "Assignment workflow", coverage: "4 edge cases", status: "Needs Review" },
];

const SIMULATION_CASES: SimulationCase[] = [
  {
    id: "SIM-01",
    title: "Promote HR Staff into emergency admin",
    required: ["roles.manage", "settings.update"],
  },
  {
    id: "SIM-02",
    title: "Read-only auditor attempts employee write",
    required: ["employees.write"],
  },
  {
    id: "SIM-03",
    title: "Security review board accesses audit logs",
    required: ["security.audit"],
  },
];

function hasAllPermissions(role: RoleProfile, required: PermissionKey[]) {
  return required.every((permission) => role.permissions.includes(permission));
}

export function RoleManagementWorkspace() {
  const [selectedRoleId, setSelectedRoleId] = useState<number>(1);
  const [targetUser, setTargetUser] = useState("Amal N.");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedRole = useMemo(() => {
    return ROLE_PROFILES.find((role) => role.id === selectedRoleId) ?? ROLE_PROFILES[0];
  }, [selectedRoleId]);

  const runAssignment = () => {
    setSaveMessage(`Role update prepared for ${targetUser || "the selected user"}.`);
    window.setTimeout(() => setSaveMessage(null), 2200);
  };

  return (
    <section className="space-y-8 pb-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Admin Role Management</h1>
        <p className="text-muted-foreground max-w-3xl">
          Controlled workspace for RBAC trials, policy simulations, and clean governance updates.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6 border-none shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
              <Layers3 className="size-5" />
            </div>
            <h2 className="font-bold">System Trials with Component Breakdown Ideation</h2>
          </div>
          <div className="space-y-3">
            {TRIAL_RUNS.map((trial) => (
              <div key={trial.area} className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-sm font-semibold">{trial.area}</p>
                <p className="text-xs text-muted-foreground">Coverage: {trial.coverage}</p>
                <p className="text-xs mt-1">
                  <span className={trial.status === "Stable" ? "text-emerald-600" : "text-amber-600"}>
                    {trial.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="font-bold">Independent Design Pattern Implementations</h2>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Policy Object Pattern for route-level privilege groups.</p>
            <p>Strategy Pattern for permission simulation scenarios.</p>
            <p>Command-style updates for reversible role assignment events.</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <Sparkles className="size-5" />
            </div>
            <h2 className="font-bold">Miscellaneous Refactoring / Clean Code improvements</h2>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Data-driven role model constants reduce repeated UI logic.</p>
            <p>Pure helper for permission assertions improves testability.</p>
            <p>Scoped UI state isolates assignment behavior from simulation blocks.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="p-6 border-none shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Role Catalog</h3>
          </div>
          <div className="space-y-3">
            {ROLE_PROFILES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  selectedRole.id === role.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm">{role.name}</p>
                  <span className="text-xs text-muted-foreground">{role.memberCount} members</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm xl:col-span-3 space-y-5">
          <h3 className="text-lg font-bold">Role Assignment Workspace</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-user">Target User</Label>
              <Input
                id="target-user"
                value={targetUser}
                onChange={(event) => setTargetUser(event.target.value)}
                placeholder="Type user name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-role">Role</Label>
              <select
                id="target-role"
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(Number(event.target.value))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ROLE_PROFILES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border/80 p-4">
            <p className="text-sm font-semibold mb-3">Permission Matrix</p>
            <div className="grid gap-3 md:grid-cols-2">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.title} className="rounded-lg border border-border/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.keys.map((permission) => {
                      const enabled = selectedRole.permissions.includes(permission);
                      return (
                        <div key={permission} className="flex items-center justify-between text-xs">
                          <span>{permission}</span>
                          <span className={enabled ? "text-emerald-600" : "text-muted-foreground"}>
                            {enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={runAssignment}>Apply Role Update</Button>
            <Button variant="outline">Create New Role Blueprint</Button>
          </div>

          {saveMessage && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
            >
              {saveMessage}
            </motion.p>
          )}
        </Card>
      </div>

      <Card className="p-6 border-none shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Beaker className="size-5 text-primary" />
          <h3 className="text-lg font-bold">Component Model Test Simulations</h3>
        </div>
        <div className="space-y-3">
          {SIMULATION_CASES.map((testCase) => {
            const passed = hasAllPermissions(selectedRole, testCase.required);
            return (
              <div key={testCase.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{testCase.id} - {testCase.title}</p>
                  <p className="text-xs text-muted-foreground">Requires: {testCase.required.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {passed ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Sparkles className="size-4 text-amber-600" />}
                  <span className={passed ? "text-emerald-600" : "text-amber-600"}>{passed ? "PASS" : "FLAG"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
