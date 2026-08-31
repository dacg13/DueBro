"use client";

import { useState, useEffect } from "react";
import { AppNavigation } from "@/components/shared/AppNavigation";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { CommandSearchDialog } from "@/components/shared/CommandSearchDialog";
import { OfflineSyncBanner } from "@/components/shared/OfflineSyncBanner";
import { type Subject, type Deadline } from "@/types";

// Default fallback subjects for UI demonstration
const DEFAULT_DEMO_SUBJECTS: Subject[] = [
  {
    id: "demo-cs101",
    termId: "demo-term",
    userId: "demo-user",
    name: "CS101 Algorithms",
    color: "#5B6EF5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "demo-math201",
    termId: "demo-term",
    userId: "demo-user",
    name: "MATH201 Linear Algebra",
    color: "#2DB5A5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "demo-phys150",
    termId: "demo-term",
    userId: "demo-user",
    name: "PHYS150 Mechanics",
    color: "#E0A030",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEFAULT_DEMO_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    userId: "demo-user",
    subjectId: "demo-cs101",
    termId: "demo-term",
    title: "Dynamic Programming Problem Set 4",
    type: "assignment",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    progress: 50,
    estimatedEffortHours: 4.0,
    location: null,
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-2",
    userId: "demo-user",
    subjectId: "demo-math201",
    termId: "demo-term",
    title: "Midterm Exam: Vector Spaces",
    type: "exam",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    dueTime: "10:00",
    priority: "critical",
    status: "not_started",
    progress: 10,
    estimatedEffortHours: 8.0,
    location: "Hall B, Room 204",
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <OfflineSyncBanner />
      <AppNavigation onOpenAddDeadline={() => setIsAddDeadlineOpen(true)}>
        {children}
        <AddDeadlineDialog
          isOpen={isAddDeadlineOpen}
          onClose={() => setIsAddDeadlineOpen(false)}
          subjects={DEFAULT_DEMO_SUBJECTS}
          onSuccess={() => {
            setIsAddDeadlineOpen(false);
          }}
        />

        {/* Global Cmd+K Search Dialog */}
        <CommandSearchDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          deadlines={DEFAULT_DEMO_DEADLINES}
          subjects={DEFAULT_DEMO_SUBJECTS}
        />
      </AppNavigation>
    </>
  );
}
