"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/context/RoleGuard";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import { useUI } from "@/context/UIContext";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

  return (
    <RoleGuard>
      <div className="bg-background text-foreground flex h-dvh overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
        
        <Sidebar />
        
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div key={pathname} className="min-h-full">
              {children}
            </div>
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
};
