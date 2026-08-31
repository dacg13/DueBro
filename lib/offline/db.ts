import Dexie, { type Table } from "dexie";
import { type Deadline, type Subject, type AcademicTerm } from "@/types";

export interface SyncQueueItem {
  queueId?: number;
  entityType: "deadline" | "subject" | "term";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: string; // ISO string
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  errorMessage?: string | null;
}

export interface OfflineDeadline extends Deadline {
  isSynced?: boolean;
}

export interface OfflineSubject extends Subject {
  isSynced?: boolean;
}

export class DueBroOfflineDatabase extends Dexie {
  deadlines!: Table<OfflineDeadline, string>;
  subjects!: Table<OfflineSubject, string>;
  academic_terms!: Table<AcademicTerm, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super("duebro_offline_db");
    this.version(1).stores({
      deadlines: "id, userId, subjectId, dueDate, status, updatedAt, isSynced",
      subjects: "id, userId, termId, name, updatedAt, isSynced",
      academic_terms: "id, userId, name, isCurrent",
      sync_queue: "++queueId, entityType, entityId, operation, timestamp, status, retryCount",
    });
  }
}

// Client-side singleton instance (avoiding SSR errors)
let offlineDbInstance: DueBroOfflineDatabase | null = null;

export function getOfflineDb(): DueBroOfflineDatabase | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!offlineDbInstance) {
    offlineDbInstance = new DueBroOfflineDatabase();
  }
  return offlineDbInstance;
}
