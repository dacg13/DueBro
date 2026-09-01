"use client";

import { useState, useEffect } from "react";
import { AppNavigation } from "@/components/shared/AppNavigation";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { CommandSearchDialog } from "@/components/shared/CommandSearchDialog";
import { OfflineSyncBanner } from "@/components/shared/OfflineSyncBanner";
import { getDeadlinesAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import { type Subject, type Deadline } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    Promise.all([getDeadlinesAction(), getSubjectsAction()]).then(([dlRes, subRes]) => {
      if (dlRes.data) setDeadlines(dlRes.data);
      if (subRes.data) setSubjects(subRes.data);
    });
  }, []);

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
          subjects={subjects}
          onSuccess={(newDeadline) => {
            setDeadlines((prev) => [newDeadline, ...prev]);
            setIsAddDeadlineOpen(false);
          }}
        />

        {/* Global Cmd+K Search Dialog */}
        <CommandSearchDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          deadlines={deadlines}
          subjects={subjects}
        />
      </AppNavigation>
    </>
  );
}
