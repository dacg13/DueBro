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
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/server/actions/auth";
import { AppLogo } from "@/components/shared/AppLogo";
import { cn } from "@/lib/utils";

interface AppNavigationProps {
  onOpenAddDeadline: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Today", href: "/today", icon: Sun },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Deadlines", href: "/deadlines", icon: CheckSquare },
  { label: "Subjects", href: "/subjects", icon: BookOpen, desktopOnly: true },
  { label: "Inbox", href: "/inbox", icon: Inbox, desktopOnly: true },
  { label: "Analytics", href: "/analytics", icon: TrendingUp, desktopOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppNavigation({ onOpenAddDeadline, children }: AppNavigationProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-void-950 flex flex-col lg:flex-row text-signal-white">
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between border-r border-white/8 bg-void-900/40 backdrop-blur-[20px] p-4 transition-all duration-250 shrink-0 select-none",
          isSidebarCollapsed ? "w-20" : "w-60"
        )}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1">
            {!isSidebarCollapsed ? (
              <Link href="/today" className="flex items-center gap-2">
                <AppLogo size="md" showWordmark={true} glow={true} />
              </Link>
            ) : (
              <Link href="/today" className="mx-auto" aria-label="DueBro home">
                <AppLogo size="sm" showWordmark={false} glow={true} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-lg text-graphite-300 hover:text-signal-white hover:bg-void-850/60 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Desktop Primary Action Button (+ Add Deadline) — §8: signal-white fill with void-950 text */}
          <button
            type="button"
            onClick={onOpenAddDeadline}
            className={cn(
              "w-full h-10 rounded-xl bg-signal-white hover:bg-signal-white/95 text-void-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(250,250,252,0.25)] hover:shadow-[0_0_28px_rgba(250,250,252,0.4)] active:scale-[0.98]",
              isSidebarCollapsed && "px-0"
            )}
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
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
                      ? "bg-void-800/60 text-signal-white font-semibold border border-white/10 shadow-[0_0_16px_rgba(250,250,252,0.06)]"
                      : "text-mist-100/70 hover:text-signal-white hover:bg-void-850/40"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-signal-white drop-shadow-[0_0_8px_rgba(250,250,252,0.6)]"
                        : "text-graphite-300 group-hover:text-signal-white"
                    )}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/8 space-y-2">
          {!isSidebarCollapsed && (
            <div className="px-2 py-1 flex items-center gap-2 text-[11px] text-graphite-300">
              <ShieldCheck className="w-3.5 h-3.5 text-signal-white drop-shadow-[0_0_6px_rgba(250,250,252,0.5)]" />
              <span>Risk Engine Active</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOutAction()}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-graphite-300 hover:text-signal-danger hover:bg-signal-danger/10 transition-colors cursor-pointer",
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
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-void-950/80 backdrop-blur-[20px] sticky top-0 z-30">
          <Link href="/today" className="flex items-center gap-2">
            <AppLogo size="sm" showWordmark={true} glow={true} />
          </Link>
        </header>

        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Floating Action Button (FAB) — <1024px */}
      <div className="lg:hidden fixed right-5 bottom-20 z-40">
        <button
          type="button"
          onClick={onOpenAddDeadline}
          className="w-14 h-14 rounded-full bg-signal-white text-void-950 shadow-[0_0_24px_rgba(250,250,252,0.5)] flex items-center justify-center hover:bg-signal-white/95 active:scale-95 transition-transform cursor-pointer"
          aria-label="Add new deadline"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-void-900/80 backdrop-blur-[20px] border-t border-white/8 px-3 py-2 flex items-center justify-around"
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
                isActive ? "text-signal-white font-semibold drop-shadow-[0_0_8px_rgba(250,250,252,0.5)]" : "text-mist-200/60 hover:text-signal-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-signal-white drop-shadow-[0_0_6px_rgba(250,250,252,0.7)]" : "text-graphite-300")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
