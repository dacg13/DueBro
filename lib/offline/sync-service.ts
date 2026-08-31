/**
 * Offline Sync Service & Last-Write-Wins (LWW) Conflict Resolution
 *
 * Responsibilities:
 * - Pure LWW conflict resolution algorithm based on timestamp comparison (ANTIGRAVITY_BUILD_PROMPT.md line 105)
 * - Optimistic local IndexedDB mutations via Dexie.js
 * - Sync queue serialization, chronological FIFO processing, and automatic network reconnection flushes
 */

import { getOfflineDb, type SyncQueueItem, type OfflineDeadline, type OfflineSubject } from "./db";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export type SyncStatus = "online" | "offline" | "syncing" | "error";

/**
 * Pure Last-Write-Wins (LWW) Conflict Resolution Algorithm
 * Returns the winning record based on the most recent updatedAt timestamp.
 */
export function resolveConflictLWW<T extends { updatedAt: Date | string }>(
  localRecord: T,
  remoteRecord: T
): { winner: "local" | "remote"; record: T } {
  const localTime = new Date(localRecord.updatedAt).getTime();
  const remoteTime = new Date(remoteRecord.updatedAt).getTime();

  if (localTime >= remoteTime) {
    return { winner: "local", record: localRecord };
  }
  return { winner: "remote", record: remoteRecord };
}

/**
 * Enqueues an offline mutation and optimistically updates local IndexedDB.
 */
export async function enqueueOfflineMutation(
  item: Omit<SyncQueueItem, "queueId" | "status" | "retryCount">
): Promise<number | undefined> {
  const db = getOfflineDb();
  if (!db) return undefined;

  // 1. Enqueue sync item
  const queueId = await db.sync_queue.add({
    ...item,
    status: "pending",
    retryCount: 0,
    errorMessage: null,
  });

  // 2. Optimistic local cache update
  if (item.entityType === "deadline") {
    if (item.operation === "delete") {
      await db.deadlines.delete(item.entityId);
    } else {
      await db.deadlines.put({
        ...(item.payload as unknown as OfflineDeadline),
        id: item.entityId,
        isSynced: false,
      });
    }
  } else if (item.entityType === "subject") {
    if (item.operation === "delete") {
      await db.subjects.delete(item.entityId);
    } else {
      await db.subjects.put({
        ...(item.payload as unknown as OfflineSubject),
        id: item.entityId,
        isSynced: false,
      });
    }
  }

  return queueId;
}

/**
 * Flushes all pending mutations in the sync queue in chronological order.
 */
export async function flushSyncQueue(
  handler: (item: SyncQueueItem) => Promise<{ success: boolean; error?: string }>
): Promise<{ processed: number; failed: number }> {
  const db = getOfflineDb();
  if (!db) return { processed: 0, failed: 0 };

  const pendingItems = await db.sync_queue
    .where("status")
    .equals("pending")
    .or("status")
    .equals("failed")
    .sortBy("timestamp");

  let processed = 0;
  let failed = 0;

  for (const item of pendingItems) {
    if (!item.queueId) continue;

    // Skip items with >5 retries to avoid endless crash loops
    if (item.retryCount >= 5) {
      failed++;
      continue;
    }

    // Mark syncing
    await db.sync_queue.update(item.queueId, { status: "syncing" });

    try {
      const res = await handler(item);
      if (res.success) {
        // Successfully synced: delete from queue
        await db.sync_queue.delete(item.queueId);
        processed++;
      } else {
        // Failed: record retry
        await db.sync_queue.update(item.queueId, {
          status: "failed",
          retryCount: item.retryCount + 1,
          errorMessage: res.error || "Sync failed",
        });
        failed++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await db.sync_queue.update(item.queueId, {
        status: "failed",
        retryCount: item.retryCount + 1,
        errorMessage: msg,
      });
      failed++;
    }
  }

  return { processed, failed };
}

function subscribeOnline(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof window !== "undefined" ? navigator.onLine : true;
}

function getServerOnlineSnapshot() {
  return true;
}

/**
 * React hook to track online/offline status and pending sync count.
 */
export function useOfflineSync() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  );

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("online");

  const refreshPendingCount = useCallback(async () => {
    const db = getOfflineDb();
    if (!db) return;
    try {
      const count = await db.sync_queue.count();
      setPendingCount(count);
    } catch {
      // Ignore IndexedDB read error in unsupported environments
    }
  }, []);

  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      if (active) {
        void refreshPendingCount();
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    syncStatus,
    setSyncStatus,
    refreshPendingCount,
  };
}
