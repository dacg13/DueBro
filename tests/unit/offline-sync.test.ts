import { describe, it, expect } from "vitest";
import { resolveConflictLWW } from "@/lib/offline/sync-service";

describe("Offline First & Last-Write-Wins (LWW) Sync Engine", () => {
  interface TestRecord {
    id: string;
    title: string;
    progress: number;
    updatedAt: string | Date;
  }

  it("selects local record when local updatedAt is newer than remote", () => {
    const local: TestRecord = {
      id: "rec-1",
      title: "Local Title (Updated Offline)",
      progress: 75,
      updatedAt: "2026-10-12T14:30:00Z", // Newer
    };

    const remote: TestRecord = {
      id: "rec-1",
      title: "Remote Title (Stale)",
      progress: 25,
      updatedAt: "2026-10-12T10:00:00Z", // Older
    };

    const result = resolveConflictLWW(local, remote);
    expect(result.winner).toBe("local");
    expect(result.record.title).toBe("Local Title (Updated Offline)");
    expect(result.record.progress).toBe(75);
  });

  it("selects remote record when remote updatedAt is newer than local", () => {
    const local: TestRecord = {
      id: "rec-1",
      title: "Local Title (Stale)",
      progress: 25,
      updatedAt: "2026-10-12T10:00:00Z",
    };

    const remote: TestRecord = {
      id: "rec-1",
      title: "Remote Title (Newer from another device)",
      progress: 100,
      updatedAt: "2026-10-12T16:00:00Z",
    };

    const result = resolveConflictLWW(local, remote);
    expect(result.winner).toBe("remote");
    expect(result.record.title).toBe("Remote Title (Newer from another device)");
    expect(result.record.progress).toBe(100);
  });

  it("gives local precedence when timestamps are identical", () => {
    const local: TestRecord = {
      id: "rec-1",
      title: "Local Identical",
      progress: 50,
      updatedAt: "2026-10-12T12:00:00Z",
    };

    const remote: TestRecord = {
      id: "rec-1",
      title: "Remote Identical",
      progress: 50,
      updatedAt: "2026-10-12T12:00:00Z",
    };

    const result = resolveConflictLWW(local, remote);
    expect(result.winner).toBe("local");
    expect(result.record.title).toBe("Local Identical");
  });
});
