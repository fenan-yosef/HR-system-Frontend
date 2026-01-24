"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, Search, HelpCircle, Menu } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  const { user } = useAuth();

  return (
    <header
      className="sticky text-white top-0 z-10 flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-8 backdrop-blur-xl"
      style={{ background: "linear-gradient(to right, #805AD5, #322659)" }}
    >
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="size-5" />
        </button>
        <div className="flex flex-col">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold tracking-tight text-white"
          >
            Management Portal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-medium text-white"
          >
            Monitor recruitment metrics and employee data
          </motion.p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-64 rounded-xl bg-muted/50 pl-10 pr-4 text-xs font-medium transition-all focus:bg-muted focus:ring-2 focus:ring-primary/20 border-none outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-border/50 pl-6">
          <button className="relative p-2 text-white hover:bg-muted hover:text-white rounded-xl transition-all">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
          <button className="p-2 text-white hover:bg-muted hover:text-white rounded-xl transition-all">
            <HelpCircle className="size-5" />
          </button>

          <div className="ml-2 h-8 w-px bg-border/50" />

          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end sm:flex">
              <span className="text-sm font-bold leading-none text-white">
                {user?.firstName}
              </span>
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                Online
              </span>
            </div>
            <div className="size-9 rounded-xl bg-linear-to-br from-primary to-primary/60 p-px">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
                <span className="text-xs font-bold text-white">
                  {user?.firstName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
