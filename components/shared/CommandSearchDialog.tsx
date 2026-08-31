"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Deadline, type Subject } from "@/types";
import {
  Search,
  CheckSquare,
  BookOpen,
  Calendar,
  Sun,
  BarChart3,
  Inbox,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

interface CommandSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deadlines: Deadline[];
  subjects: Subject[];
  onSelectDeadline?: (deadline: Deadline) => void;
}

const NAV_SHORTCUTS = [
  { label: "Today Focus & Daily Planner", href: "/today", icon: Sun },
  { label: "Calendar (Month & Week)", href: "/calendar", icon: Calendar },
  { label: "Workload Capacity Planner", href: "/workload", icon: BarChart3 },
  { label: "Deadlines List & Board", href: "/deadlines", icon: CheckSquare },
  { label: "Courses & Subjects", href: "/subjects", icon: BookOpen },
  { label: "Inbox & Quick Capture", href: "/inbox", icon: Inbox },
  { label: "Settings & Preferences", href: "/settings", icon: Settings },
];

export function CommandSearchDialog({
  isOpen,
  onClose,
  deadlines,
  subjects,
  onSelectDeadline,
}: CommandSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        }
      } else if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Subject lookup
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Search filter
  const q = query.trim().toLowerCase();

  const matchingDeadlines = useMemo(() => {
    if (!q) return deadlines.slice(0, 5); // Show first 5 recent
    return deadlines
      .filter((d) => {
        if (d.deletedAt) return false;
        const sub = d.subjectId ? subjectMap.get(d.subjectId) : null;
        return (
          d.title.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q)) ||
          (sub && sub.name.toLowerCase().includes(q)) ||
          d.type.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [deadlines, q, subjectMap]);

  const matchingSubjects = useMemo(() => {
    if (!q) return subjects.slice(0, 3);
    return subjects
      .filter((s) => !s.archived && s.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [subjects, q]);

  const matchingNav = useMemo(() => {
    if (!q) return NAV_SHORTCUTS.slice(0, 4);
    return NAV_SHORTCUTS.filter((n) => n.label.toLowerCase().includes(q));
  }, [q]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-bg-surface border border-border-default shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border-default bg-bg-elevated/40">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deadlines, notes, courses, or jump to view..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-bg-elevated border border-border-default text-[10px] font-mono text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4 divide-y divide-border-default/50">
          {/* Deadlines Section */}
          {matchingDeadlines.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Deadlines ({matchingDeadlines.length})
              </div>
              {matchingDeadlines.map((dl) => {
                const sub = dl.subjectId ? subjectMap.get(dl.subjectId) : null;
                const subColor = sub?.color || "#5B6EF5";

                return (
                  <button
                    key={dl.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectDeadline?.(dl);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-bg-elevated text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: subColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                          {dl.title}
                        </div>
                        <div className="text-[10px] text-text-tertiary flex items-center gap-1.5 tabular-nums">
                          {sub && <span>{sub.name}</span>}
                          {dl.dueDate && <span>&bull; Due {dl.dueDate}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold capitalize px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary">
                      {dl.priority}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Subjects Section */}
          {matchingSubjects.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Courses ({matchingSubjects.length})
              </div>
              {matchingSubjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/subjects");
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-bg-elevated text-left transition-colors cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0" />
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs font-semibold text-text-primary group-hover:text-accent truncate">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Section */}
          {matchingNav.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Quick Navigation
              </div>
              {matchingNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(item.href);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-bg-elevated text-left transition-colors cursor-pointer group"
                  >
                    <Icon className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-xs font-medium text-text-primary group-hover:text-accent truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-default bg-bg-elevated/40 text-[11px] text-text-tertiary flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" />
            Full-Text &amp; Prefix Instant Filter
          </span>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-bg-surface border border-border-default font-mono">⌘K</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
}
