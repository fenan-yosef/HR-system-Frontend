"use client";

import { FolderKanban, KanbanSquare, PlayCircle } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const projects = [
  { name: "Platform Revamp", status: "In progress", owner: "Alex Chen" },
  { name: "Mobile V2", status: "Planning", owner: "Priya Singh" },
  { name: "QA Automation", status: "In progress", owner: "Jordan Lee" },
];

export default function ManagerProjectsPage() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Across squads</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">5</div>
            <p className="text-sm text-slate-500">2 launching this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocked</CardTitle>
            <CardDescription>Need escalation</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">1</div>
            <p className="text-sm text-slate-500">Vendor access pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ship Readiness</CardTitle>
            <CardDescription>Next release</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">82%</div>
              <p className="text-sm text-slate-500">QA underway</p>
            </div>
            <div className="bg-blue-50 text-blue-600 flex size-12 items-center justify-center rounded-full">
              <PlayCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project board</CardTitle>
            <CardDescription>Status by owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {projects.map((project) => (
              <div
                key={project.name}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-xs text-slate-500">{project.status} · {project.owner}</div>
                </div>
                <Button size="sm" variant="outline">Open</Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Get started fast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <KanbanSquare className="size-5 text-indigo-600" />
              Sprint board template for new squads.
            </div>
            <div className="flex items-center gap-3">
              <FolderKanban className="size-5 text-emerald-600" />
              Release checklist for launches.
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
