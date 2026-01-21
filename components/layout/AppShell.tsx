"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/context/RoleGuard";

interface AppShellProps {
  children: React.ReactNode;
}

// Shared authenticated layout used for all role-based application pages.
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <RoleGuard>
      <div className="bg-background text-foreground flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 bg-muted/40 p-6">
            <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
};
