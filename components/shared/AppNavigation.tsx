"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings,
  Plus,
  Inbox,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

interface AppNavigationProps {
  onOpenAddDeadline: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Today", href: "/today", icon: Sun },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Workload", href: "/workload", icon: BarChart3 },
  { label: "Analytics", href: "/analytics", icon: TrendingUp, desktopOnly: true },
  { label: "Deadlines", href: "/deadlines", icon: CheckSquare },
  { label: "Subjects", href: "/subjects", icon: BookOpen, desktopOnly: true },
  { label: "Inbox", href: "/inbox", icon: Inbox, desktopOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppNavigation({ onOpenAddDeadline, children }: AppNavigationProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col lg:flex-row text-text-primary">
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between border-r border-border-default bg-bg-surface p-4 transition-all duration-250 shrink-0 select-none",
          isSidebarCollapsed ? "w-20" : "w-60"
        )}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2">
            {!isSidebarCollapsed ? (
              <Link href="/today" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-text-primary">
                  Due<span className="text-accent">Bro</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-accent-subtle text-accent">
                  Pro
                </span>
              </Link>
            ) : (
              <span className="text-xl font-bold text-accent mx-auto">D</span>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Desktop Primary Action Button (+ Add Deadline) */}
          <button
            type="button"
            onClick={onOpenAddDeadline}
            className={cn(
              "w-full h-10 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]",
              isSidebarCollapsed && "px-0"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Add Deadline</span>}
          </button>

          {/* Nav Links */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    isActive
                      ? "bg-accent-subtle text-accent font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary")} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-border-default space-y-2">
          {!isSidebarCollapsed && (
            <div className="px-2 py-1 flex items-center gap-2 text-[11px] text-text-tertiary">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Risk Engine Active</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOutAction()}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer",
              isSidebarCollapsed && "justify-center px-0"
            )}
            title={isSidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Floating Action Button (FAB) — <1024px */}
      <div className="lg:hidden fixed right-5 bottom-20 z-40">
        <button
          type="button"
          onClick={onOpenAddDeadline}
          className="w-14 h-14 rounded-full bg-accent text-white shadow-xl flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-transform cursor-pointer"
          aria-label="Add new deadline"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Bottom Tab Bar (4 items per DESIGN_PRD.md §7) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-border-default px-3 py-2 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.filter((item) => !item.desktopOnly).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-accent font-semibold" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-text-secondary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
