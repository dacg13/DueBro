"use client";

import { useOfflineSync } from "@/lib/offline/sync-service";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineSyncBanner() {
  const { isOnline, pendingCount, syncStatus } = useOfflineSync();

  if (isOnline && pendingCount === 0 && syncStatus === "online") {
    return null; // Silent when fully online and synced
  }

  return (
    <aside
      aria-label="Network and Offline Sync Status"
      className={cn(
        "fixed top-3 right-3 z-50 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 border",
        !isOnline
          ? "bg-warning/15 text-warning border-warning/40"
          : pendingCount > 0 || syncStatus === "syncing"
          ? "bg-accent-subtle text-accent border-accent/40"
          : "bg-success/15 text-success border-success/40"
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline — Changes saved locally</span>
        </>
      ) : syncStatus === "syncing" || pendingCount > 0 ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing {pendingCount} offline change{pendingCount === 1 ? "" : "s"}...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All changes synced</span>
        </>
      )}
    </aside>
  );
}
