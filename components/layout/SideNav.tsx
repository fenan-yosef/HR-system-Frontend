"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/navigation/roleNavConfig";

interface SideNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose?: () => void;
  roleLabel?: string;
}

export function SideNav({ items, isOpen, onClose, roleLabel = "" }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-slate-950 text-slate-100 fixed inset-y-0 z-40 w-72 shrink-0 border-r border-slate-800 shadow-2xl transition-transform duration-200",
        "lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="bg-slate-800/80 text-white flex size-9 items-center justify-center rounded-lg">
            <LayoutDashboard className="size-5" />
          </span>
          <div className="leading-tight">
            <div className="text-xs text-slate-300">HR Management System</div>
            <div>{roleLabel || "Workspace"}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    "hover:bg-slate-900 hover:text-white",
                    active ? "bg-slate-900 text-white shadow-inner" : "text-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60",
                      active ? "border-slate-700" : "border-transparent"
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-slate-800 text-slate-200 rounded-full px-2 py-0.5 text-xs">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-slate-500" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
