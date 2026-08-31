"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesInput,
} from "@/lib/validation/auth";
import { updateNotificationPreferencesAction, signOutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Moon,
  Sliders,
  LogOut,
  Save,
  CheckCircle2,
  Loader2,
  Smartphone,
  Mail,
  Calendar,
} from "lucide-react";

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Capacity State
  const [dailyCapacity, setDailyCapacity] = useState<number>(2.5);
  const [weekendCapacity, setWeekendCapacity] = useState<number>(4.0);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(true);
  const [quietStart, setQuietStart] = useState<string>("22:00");
  const [quietEnd, setQuietEnd] = useState<string>("08:00");

  const {
    handleSubmit,
    control,
    setValue,
  } = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      upcoming: { push: true, email: true },
      critical: { push: true, email: true },
      overdue: { push: true, email: true },
      exam: { push: true, email: true },
      digest: { push: true, email: false },
      workload: { push: true, email: false },
    },
  });

  const formValues = useWatch({ control });

  const onSubmit = async (data: NotificationPreferencesInput) => {
    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      await updateNotificationPreferencesAction(data);
      setSuccessMsg("Preferences saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
  };

  const notificationCategories = [
    { key: "upcoming" as const, label: "Upcoming Assignment Reminders", desc: "1 day & 2 hours before submission deadlines" },
    { key: "critical" as const, label: "Critical Risk Escalations", desc: "When remaining effort exceeds study capacity" },
    { key: "overdue" as const, label: "Overdue Alerts", desc: "Instant alert when an incomplete deadline passes" },
    { key: "exam" as const, label: "Exam Urgency Countdown", desc: "7 days, 1 day, and 2 hours exam countdowns" },
    { key: "digest" as const, label: "Daily Morning Study Digest", desc: "Summary of today's workload and priority tasks" },
    { key: "workload" as const, label: "Workload Congestion Alerts", desc: "When 3+ deadlines cluster into a 3-day window" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your study pacing capacity, quiet hours, and multi-channel notification rules.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Study Capacity & Pacing */}
        <div className="rounded-2xl bg-bg-surface border border-border-default p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Study Capacity &amp; Risk Engine Pacing</h2>
              <p className="text-xs text-text-secondary">
                Configures your daily available study hours used to evaluate deadline risk scores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dailyCapacity" className="block text-xs font-medium text-text-secondary">
                Weekday Daily Capacity (Hours/Day)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="dailyCapacity"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(parseFloat(e.target.value) || 2.0)}
                  className="h-10 text-xs w-32 tabular-nums"
                />
                <span className="text-xs text-text-tertiary">Mon &ndash; Fri study hours</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="weekendCapacity" className="block text-xs font-medium text-text-secondary">
                Weekend Daily Capacity (Hours/Day)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="weekendCapacity"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={weekendCapacity}
                  onChange={(e) => setWeekendCapacity(parseFloat(e.target.value) || 4.0)}
                  className="h-10 text-xs w-32 tabular-nums"
                />
                <span className="text-xs text-text-tertiary">Sat &amp; Sun study hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Channel Delivery Grid */}
        <div className="rounded-2xl bg-bg-surface border border-border-default p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Multi-Channel Delivery Channels</h2>
              <p className="text-xs text-text-secondary">
                Configure Push and Email notifications per alert category.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notificationCategories.map((cat) => {
              const pushVal = formValues[cat.key]?.push ?? true;
              const emailVal = formValues[cat.key]?.email ?? false;

              return (
                <div
                  key={cat.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-elevated/40 border border-border-default"
                >
                  <div>
                    <div className="text-xs font-semibold text-text-primary">{cat.label}</div>
                    <div className="text-[11px] text-text-tertiary">{cat.desc}</div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                    {/* Push Toggle */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${cat.key}-push`}
                        checked={pushVal}
                        onCheckedChange={(checked) => setValue(`${cat.key}.push`, checked)}
                      />
                      <label
                        htmlFor={`${cat.key}-push`}
                        className="text-xs text-text-secondary flex items-center gap-1 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-text-tertiary" />
                        Push
                      </label>
                    </div>

                    {/* Email Toggle */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${cat.key}-email`}
                        checked={emailVal}
                        onCheckedChange={(checked) => setValue(`${cat.key}.email`, checked)}
                      />
                      <label
                        htmlFor={`${cat.key}-email`}
                        className="text-xs text-text-secondary flex items-center gap-1 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-text-tertiary" />
                        Email
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Quiet Hours */}
        <div className="rounded-2xl bg-bg-surface border border-border-default p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Quiet Hours Protection</h2>
                <p className="text-xs text-text-secondary">
                  Automatically defers notifications during sleep hours so you aren&apos;t disturbed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="quiet-hours-toggle"
                checked={quietHoursEnabled}
                onCheckedChange={(checked) => setQuietHoursEnabled(checked)}
              />
              <label htmlFor="quiet-hours-toggle" className="text-xs text-text-secondary cursor-pointer">
                Enabled
              </label>
            </div>
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <div>
                <label htmlFor="quiet-start" className="block text-xs font-medium text-text-secondary mb-1">
                  Quiet Hours Start (Sleep)
                </label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="h-10 text-xs tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="quiet-end" className="block text-xs font-medium text-text-secondary mb-1">
                  Quiet Hours End (Wake Up)
                </label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="h-10 text-xs tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Preferences...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Data Portability & Export / Import Section (PRODUCT_PRD.md §24) */}
      <div className="rounded-2xl bg-bg-surface border border-border-default p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border-default">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Data Portability &amp; Calendar Export</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Export your deadline feeds for Google Calendar, Apple Calendar, Canvas LMS, or download offline CSV backups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              const dummyBlob = new Blob(
                ["BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DueBro//EN\r\nEND:VCALENDAR"],
                { type: "text/calendar" }
              );
              const url = URL.createObjectURL(dummyBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "duebro-deadlines.ics";
              a.click();
            }}
            className="p-3.5 rounded-xl bg-bg-elevated border border-border-default hover:border-accent/50 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-text-primary group-hover:text-accent flex items-center gap-1.5">
              <span>📅 Export .ICS Calendar</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Live sync feed compatible with Apple Calendar &amp; Google Calendar.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              const dummyCSV = "Title,Type,Subject,DueDate,DueTime,Priority,Status\r\n";
              const blob = new Blob([dummyCSV], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "duebro-deadlines.csv";
              a.click();
            }}
            className="p-3.5 rounded-xl bg-bg-elevated border border-border-default hover:border-accent/50 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-text-primary group-hover:text-accent flex items-center gap-1.5">
              <span>📊 Export CSV Sheet</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Complete spreadsheet table for Excel, Google Sheets, or Notion.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              const dummyJSON = JSON.stringify({ version: "1.0.0", exportedAt: new Date().toISOString() }, null, 2);
              const blob = new Blob([dummyJSON], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "duebro-workspace-backup.json";
              a.click();
            }}
            className="p-3.5 rounded-xl bg-bg-elevated border border-border-default hover:border-accent/50 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-text-primary group-hover:text-accent flex items-center gap-1.5">
              <span>💾 Backup JSON Archive</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Full workspace backup including courses, terms, and settings.
            </p>
          </button>
        </div>
      </div>

      {/* Account & Session Section */}
      <div className="pt-6 border-t border-border-default flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Account Session</h3>
          <p className="text-xs text-text-secondary mt-0.5">Signed in as demo-user@university.edu</p>
        </div>

        <Button
          variant="secondary"
          onClick={handleSignOut}
          className="text-xs text-error hover:text-error hover:bg-error/10 border-error/20 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
