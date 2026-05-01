"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { RoleGuard } from "@/context/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyDisciplinaryActions } from "@/services/disciplinaryService";
import type { DisciplinaryAction } from "@/types/disciplinary";
import {
  formatDate,
  formatLabel,
  getActionType,
  getDescription,
  getSeverity,
  getStatus,
  getStatusStyles,
} from "@/components/disciplinary/disciplinary-utils";
import { cn } from "@/lib/utils";

export default function MyDisciplinaryPage() {
  const [records, setRecords] = useState<DisciplinaryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyDisciplinaryActions();
        setRecords(data);
      } catch (err) {
        console.error("Failed to load disciplinary records", err);
        setError("Unable to load your disciplinary records right now.");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  return (
    <RoleGuard allowedRoles={["EMPLOYEE"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">My Disciplinary Records</h1>
          <p className="text-muted-foreground">
            Review any disciplinary actions recorded against your profile.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" /> Records
            </CardTitle>
            <CardDescription>
              Read-only history of disciplinary actions and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading records...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                No disciplinary records were found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="border-b px-4 py-3 font-semibold">Action Type</th>
                      <th className="border-b px-4 py-3 font-semibold">Severity</th>
                      <th className="border-b px-4 py-3 font-semibold">Status</th>
                      <th className="border-b px-4 py-3 font-semibold">Description</th>
                      <th className="border-b px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => {
                      const status = getStatus(record);
                      return (
                        <tr key={record.id ?? index} className="border-b last:border-b-0">
                          <td className="px-4 py-4 text-sm font-medium text-foreground">
                            {formatLabel(getActionType(record))}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatLabel(getSeverity(record))}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                                getStatusStyles(status),
                              )}
                            >
                              {formatLabel(status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            <p className="max-w-xl break-words">{getDescription(record) || "-"}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(record.created_at ?? record.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}