"use client";

import { useState, useMemo, useEffect } from "react";
import { type Deadline, type Subject, type InAppNotification } from "@/types";
import { QuickCaptureWidget } from "@/features/inbox/components/QuickCaptureWidget";
import { InboxTriageCard } from "@/features/inbox/components/InboxTriageCard";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { getDeadlinesAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Inbox as InboxIcon,
  Bell,
  Clock,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [activeMainTab, setActiveMainTab] = useState<"capture" | "notifications">("capture");
  const [capturedDeadlines, setCapturedDeadlines] = useState<Deadline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notificationsList, setNotificationsList] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    Promise.all([getDeadlinesAction(), getSubjectsAction()]).then(([dlRes, subRes]) => {
      if (dlRes.data) {
        // Items in inbox are uncompleted items without a subject or due date, or recently quick-captured
        const untriaged = dlRes.data.filter(
          (d) => !d.deletedAt && d.status !== "completed" && (!d.subjectId || !d.dueDate)
        );
        setCapturedDeadlines(untriaged);
      }
      if (subRes.data) setSubjects(subRes.data);
      setIsLoading(false);
    });
  }, []);

  const untriagedCount = useMemo(() => {
    return capturedDeadlines.filter((d) => !d.subjectId || !d.dueDate).length;
  }, [capturedDeadlines]);

  const unreadNotifCount = useMemo(() => {
    return notificationsList.filter((n) => n.status === "queued").length;
  }, [notificationsList]);

  const handleMarkAsRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "sent" } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) =>
      prev.map((n) => ({ ...n, status: "sent" }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-mist-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">Inbox &amp; Quick Capture</h1>
            {untriagedCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-signal-white text-void-950 shadow-[0_0_12px_rgba(250,250,252,0.3)]">
                {untriagedCount} untriaged
              </span>
            )}
          </div>
          <p className="text-xs text-mist-200 mt-0.5">
            Rapidly capture ideas and assignments with zero required fields, then triage in 1 tap.
          </p>
        </div>
      </div>

      {/* Quick Capture Widget */}
      <QuickCaptureWidget
        subjects={subjects}
        onSuccess={(created) => setCapturedDeadlines((prev) => [created, ...prev])}
      />

      {/* Main View Switcher: Capture Triage vs Notifications */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          type="button"
          onClick={() => setActiveMainTab("capture")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
            activeMainTab === "capture"
              ? "bg-accent-subtle text-accent border border-accent/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <InboxIcon className="w-3.5 h-3.5" />
          <span>Quick Capture Triage ({capturedDeadlines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("notifications")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
            activeMainTab === "notifications"
              ? "bg-accent-subtle text-accent border border-accent/20"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Dispatched Alerts ({notificationsList.length})</span>
          {unreadNotifCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* View 1: Quick Capture Triage */}
      {activeMainTab === "capture" && (
        <div className="space-y-3">
          {capturedDeadlines.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="Inbox is clear!"
              description="No captured deadlines waiting for triage. Use the input above to quickly jot down an assignment."
            />
          ) : (
            capturedDeadlines.map((dl) => (
              <InboxTriageCard
                key={dl.id}
                deadline={dl}
                subjects={subjects}
                onUpdate={(updated) =>
                  setCapturedDeadlines((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
                }
                onDelete={(id) => setCapturedDeadlines((prev) => prev.filter((d) => d.id !== id))}
                onOpenDetail={(dlToOpen) => {
                  setSelectedDeadline(dlToOpen);
                  setIsDetailOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* View 2: Dispatched Notifications Feed */}
      {activeMainTab === "notifications" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Alert History
            </span>
            {unreadNotifCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead} className="gap-1.5 text-xs h-7">
                <CheckCheck className="w-3.5 h-3.5 text-accent" />
                Mark all as read
              </Button>
            )}
          </div>

          {notificationsList.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No alerts"
              description="No notifications have been dispatched yet."
            />
          ) : (
            notificationsList.map((notif) => {
              const isUnread = notif.status === "queued";
              const sentFormatted = notif.sentAt
                ? format(new Date(notif.sentAt), "MMM d, h:mm a")
                : "Queued";

              return (
                <div
                  key={notif.id}
                  onClick={() => isUnread && handleMarkAsRead(notif.id)}
                  className={cn(
                    "p-4 rounded-2xl bg-bg-surface border transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer",
                    isUnread
                      ? "border-accent/40 bg-accent-subtle/15 shadow-xs"
                      : "border-border-default hover:border-border-hover opacity-80"
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        isUnread
                          ? "bg-signal-white text-void-950 shadow-[0_0_16px_rgba(250,250,252,0.35)]"
                          : "bg-void-900/60 text-mist-200 border border-white/8"
                      )}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={cn(
                            "text-sm font-semibold truncate",
                            isUnread ? "text-text-primary" : "text-text-secondary"
                          )}
                        >
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-text-tertiary tabular-nums">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sentFormatted}
                        </span>
                        <span className="capitalize px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary">
                          via {notif.channel.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className="shrink-0 text-xs text-text-secondary hover:text-text-primary"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Deadline Detail Inspection Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadline}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subject={selectedDeadline?.subjectId ? subjects.find((s) => s.id === selectedDeadline.subjectId) : null}
        onEdit={(dl) => {
          setSelectedDeadline(dl);
          setIsAddOpen(true);
        }}
        onDeleteSuccess={(id) => setCapturedDeadlines((prev) => prev.filter((d) => d.id !== id))}
      />

      {/* Add / Edit Deadline Dialog */}
      <AddDeadlineDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        subjects={subjects}
        onSuccess={(saved) => {
          setCapturedDeadlines((prev) => [saved, ...prev]);
        }}
      />
    </div>
  );
}
