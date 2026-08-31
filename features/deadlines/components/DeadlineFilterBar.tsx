"use client";

import { type Subject, deadlineTypeEnum } from "@/types";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineFilterBarProps {
  subjects: Subject[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "dueDate" | "priority" | "title";
  onSortChange: (sort: "dueDate" | "priority" | "title") => void;
}

const STATUS_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "not_started", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Overdue" },
];

export function DeadlineFilterBar({
  subjects,
  selectedStatus,
  onStatusChange,
  selectedSubjectId,
  onSubjectChange,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: DeadlineFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Top Search & Sort Controls */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search deadlines, subjects, notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 bg-bg-surface border border-border-default hover:border-border-hover focus:border-accent rounded-xl text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-bg-surface border border-border-default text-xs text-text-secondary shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary" />
          <select
            value={sortBy}
            aria-label="Sort deadlines by"
            onChange={(e) => onSortChange(e.target.value as "dueDate" | "priority" | "title")}
            className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="dueDate" className="bg-bg-elevated">Sort by Due Date</option>
            <option value="priority" className="bg-bg-elevated">Sort by Priority</option>
            <option value="title" className="bg-bg-elevated">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Horizontally Scrollable Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 shrink-0 border-r border-border-default pr-2.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStatusChange(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                selectedStatus === s.id
                  ? "bg-accent-subtle text-accent border border-accent/30 font-semibold"
                  : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown / Chip */}
        {subjects.length > 0 && (
          <div className="shrink-0 flex items-center gap-1.5 border-r border-border-default pr-2.5">
            <button
              type="button"
              onClick={() => onSubjectChange("all")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                selectedSubjectId === "all"
                  ? "bg-accent-subtle text-accent border border-accent/30"
                  : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
              )}
            >
              All Subjects
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSubjectChange(sub.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                  selectedSubjectId === sub.id
                    ? "bg-bg-elevated text-text-primary border border-border-hover"
                    : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
                )}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Type Filter */}
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTypeChange("all")}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
              selectedType === "all"
                ? "bg-accent-subtle text-accent border border-accent/30"
                : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
            )}
          >
            All Types
          </button>
          {deadlineTypeEnum.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer",
                selectedType === type
                  ? "bg-bg-elevated text-text-primary border border-border-hover"
                  : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
              )}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
