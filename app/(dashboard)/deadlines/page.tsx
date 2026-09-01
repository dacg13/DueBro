"use client";

import { useState, useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import { DeadlineRow } from "@/components/shared/DeadlineRow";
import { DeadlineCard } from "@/components/shared/DeadlineCard";
import { DeadlineFilterBar } from "@/features/deadlines/components/DeadlineFilterBar";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { sortDeadlines, isDeadlineOverdue } from "@/server/domain/deadlines";
import { assessAllDeadlinesRisk } from "@/server/domain/risk";
import { CheckSquare, Plus, LayoutList, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// Initial demonstration data matching real academic course load
const INITIAL_DEMO_SUBJECTS: Subject[] = [
  {
    id: "sub-cs101",
    termId: "term-1",
    userId: "demo-user",
    name: "CS101 Algorithms",
    color: "#5B6EF5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-math201",
    termId: "term-1",
    userId: "demo-user",
    name: "MATH201 Linear Algebra",
    color: "#2DB5A5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-phys150",
    termId: "term-1",
    userId: "demo-user",
    name: "PHYS150 Mechanics",
    color: "#E0A030",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const INITIAL_DEMO_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    userId: "demo-user",
    subjectId: "sub-cs101",
    termId: "term-1",
    title: "Dynamic Programming Problem Set 4",
    type: "assignment",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // In 2 days
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    progress: 50,
    estimatedEffortHours: 4.5,
    location: null,
    notes: "Submit PDF via Gradescope. Cover memoization and bottom-up DP implementations.",
    tags: ["homework", "gradescope"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-2",
    userId: "demo-user",
    subjectId: "sub-math201",
    termId: "term-1",
    title: "Midterm Examination: Vector Spaces & Eigenvalues",
    type: "exam",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0], // In 5 days
    dueTime: "10:00",
    priority: "critical",
    status: "not_started",
    progress: 0,
    estimatedEffortHours: 8.0,
    location: "Hall B, Room 204",
    notes: "Closed book exam. 1 sheet of handwritten notes allowed.",
    tags: ["midterm", "exam"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-3",
    userId: "demo-user",
    subjectId: "sub-phys150",
    termId: "term-1",
    title: "Lab Report 3: Rotational Inertia",
    type: "lab",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0], // Tomorrow
    dueTime: "17:00",
    priority: "medium",
    status: "not_started",
    progress: 25,
    estimatedEffortHours: 2.0,
    location: "Physics Lab 102",
    notes: "Include error analysis table and uncertainty propagation formulas.",
    tags: ["lab"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-4",
    userId: "demo-user",
    subjectId: "sub-cs101",
    termId: "term-1",
    title: "Weekly Reading: CLRS Chapter 15",
    type: "reading",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], // Overdue
    dueTime: "23:59",
    priority: "low",
    status: "overdue",
    progress: 0,
    estimatedEffortHours: 1.5,
    location: null,
    notes: "Read pages 359-389 before lecture.",
    tags: ["reading"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function DeadlinesPage() {
  const [deadlinesList, setDeadlinesList] = useState<Deadline[]>(INITIAL_DEMO_DEADLINES);
  const [subjectsList] = useState<Subject[]>(INITIAL_DEMO_SUBJECTS);

  // Filters & Sorting state
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "title">("dueDate");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Modals state
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  // Filter & sort computation
  const filteredDeadlines = useMemo(() => {
    let list = deadlinesList.filter((d) => !d.deletedAt);

    if (selectedStatus !== "all") {
      if (selectedStatus === "overdue") {
        list = list.filter((d) => isDeadlineOverdue(d.dueDate, d.dueTime, d.status));
      } else {
        list = list.filter((d) => d.status === selectedStatus);
      }
    }

    if (selectedSubjectId !== "all") {
      list = list.filter((d) => d.subjectId === selectedSubjectId);
    }

    if (selectedType !== "all") {
      list = list.filter((d) => d.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q))
      );
    }

    return sortDeadlines(list, sortBy);
  }, [deadlinesList, selectedStatus, selectedSubjectId, selectedType, searchQuery, sortBy]);

  // Quick complete toggle with optimistic state update
  const handleToggleComplete = async (id: string) => {
    setDeadlinesList((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const isNowCompleted = d.status !== "completed";
          return {
            ...d,
            status: isNowCompleted ? "completed" : "not_started",
            completedAt: isNowCompleted ? new Date() : null,
            progress: isNowCompleted ? 100 : d.progress,
          };
        }
        return d;
      })
    );

    await toggleDeadlineCompleteAction(id);
  };

  const handleOpenDetail = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setIsAddOpen(true);
  };

  const handleDeleteSuccess = (id: string) => {
    setDeadlinesList((prev) => prev.filter((d) => d.id !== id));
  };

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjectsList.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjectsList]);

  const riskMap = useMemo(() => {
    return assessAllDeadlinesRisk(deadlinesList);
  }, [deadlinesList]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Deadlines</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Full record of all coursework, assignments, and upcoming exams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle: List vs Grid */}
          <div className="flex items-center p-1 rounded-xl bg-bg-surface border border-border-default">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-bg-elevated text-text-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              )}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-bg-elevated text-text-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              )}
              aria-label="Card grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => { setEditingDeadline(null); setIsAddOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Deadline
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <DeadlineFilterBar
        subjects={subjectsList}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Deadlines List / Grid */}
      {filteredDeadlines.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No deadlines found"
          description={
            searchQuery || selectedStatus !== "all" || selectedSubjectId !== "all"
              ? "No deadlines match the current filters. Try resetting your search or filters."
              : "You have no deadlines on your schedule yet. Add your first deadline to track effort and risk."
          }
          actionLabel="Add Deadline"
          onAction={() => { setEditingDeadline(null); setIsAddOpen(true); }}
        />
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {filteredDeadlines.map((deadline) => (
            <DeadlineRow
              key={deadline.id}
              deadline={deadline}
              subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
              assessment={riskMap.get(deadline.id)}
              onToggleComplete={handleToggleComplete}
              onClick={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDeadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
              subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
              assessment={riskMap.get(deadline.id)}
              onToggleComplete={handleToggleComplete}
              onClick={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadline}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subject={selectedDeadline?.subjectId ? subjectMap.get(selectedDeadline.subjectId) : null}
        onEdit={handleOpenEdit}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Add / Edit Modal */}
      <AddDeadlineDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        subjects={subjectsList}
        initialData={editingDeadline}
        onSuccess={(saved) => {
          setDeadlinesList((prev) => {
            const exists = prev.some((d) => d.id === saved.id);
            if (exists) {
              return prev.map((d) => (d.id === saved.id ? saved : d));
            }
            return [saved, ...prev];
          });
        }}
      />
    </div>
  );
}
