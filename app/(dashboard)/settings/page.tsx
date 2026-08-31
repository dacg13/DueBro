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
    { key: "critical" as const, label: "Critical Priority Escalations", desc: "Urgent alerts when critical exams/deadlines approach" },
    { key: "overdue" as const, label: "Overdue Alerts", desc: "Instant alert when an incomplete deadline passes" },
    { key: "exam" as const, label: "Exam Urgency Countdown", desc: "7 days, 1 day, and 2 hours exam countdowns" },
    { key: "digest" as const, label: "Daily Morning Digest", desc: "Daily summary of today's scheduled tasks" },
    { key: "workload" as const, label: "Congestion Alerts", desc: "When 3+ deadlines cluster into a 3-day window" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-signal-white">Settings</h1>
        <p className="text-xs text-mist-200 mt-0.5">
          Manage your quiet hours, notification rules, and workspace exports.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-signal-white/10 border border-white/20 text-signal-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_24px_rgba(250,250,252,0.15)]">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Multi-Channel Delivery Grid */}
        <div className="rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-lg bg-void-850 text-signal-white flex items-center justify-center border border-white/10">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-signal-white">Notification Matrix &amp; Channels</h2>
              <p className="text-xs text-mist-200">
                Choose how and when DueBro delivers intelligent deadline reminders.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-mist-200">
                  <th className="py-2.5 font-medium">Category</th>
                  <th className="py-2.5 px-4 font-medium text-center w-24">
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Push</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 font-medium text-center w-24">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {notificationCategories.map(({ key, label, desc }) => {
                  const pushVal = formValues[key]?.push ?? true;
                  const emailVal = formValues[key]?.email ?? true;

                  return (
                    <tr key={key} className="hover:bg-void-900/40 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-signal-white">{label}</p>
                        <p className="text-[11px] text-mist-200">{desc}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={pushVal}
                            onCheckedChange={(checked) =>
                              setValue(`${key}.push`, !!checked, { shouldDirty: true })
                            }
                            aria-label={`Enable push for ${label}`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={emailVal}
                            onCheckedChange={(checked) =>
                              setValue(`${key}.email`, !!checked, { shouldDirty: true })
                            }
                            aria-label={`Enable email for ${label}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Quiet Hours & Focus Windows */}
        <div className="rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-void-850 text-signal-white flex items-center justify-center border border-white/10">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-signal-white">Quiet Hours &amp; Study Shield</h2>
                <p className="text-xs text-mist-200">
                  Mutes non-critical notifications during sleep or focus hours.
                </p>
              </div>
            </div>

            <Checkbox
              checked={quietHoursEnabled}
              onCheckedChange={(checked) => setQuietHoursEnabled(!!checked)}
              aria-label="Toggle quiet hours"
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="quietStart" className="block text-xs font-medium text-mist-200">
                  Quiet Hours Start Time
                </label>
                <Input
                  id="quietStart"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="h-10 text-xs w-40"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="quietEnd" className="block text-xs font-medium text-mist-200">
                  Quiet Hours End Time
                </label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="h-10 text-xs w-40"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Notification Preferences</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Section 3: Data Export & Workspace Backup */}
      <div className="rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-void-850 text-signal-white flex items-center justify-center border border-white/10">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-signal-white">Export &amp; Integrations</h2>
            <p className="text-xs text-mist-200">
              Download your schedule as an iCalendar subscription feed or export raw tables.
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
            className="p-3.5 rounded-xl bg-void-900/60 border border-white/8 hover:border-white/20 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-signal-white flex items-center gap-1.5">
              <span>📅 Export .ICS Calendar</span>
            </div>
            <p className="text-[11px] text-mist-200">
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
            className="p-3.5 rounded-xl bg-void-900/60 border border-white/8 hover:border-white/20 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-signal-white flex items-center gap-1.5">
              <span>📊 Export CSV Sheet</span>
            </div>
            <p className="text-[11px] text-mist-200">
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
            className="p-3.5 rounded-xl bg-void-900/60 border border-white/8 hover:border-white/20 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="text-xs font-bold text-signal-white flex items-center gap-1.5">
              <span>💾 Backup JSON Archive</span>
            </div>
            <p className="text-[11px] text-mist-200">
              Full workspace backup including courses, terms, and settings.
            </p>
          </button>
        </div>
      </div>

      {/* Account & Session Section */}
      <div className="pt-6 border-t border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-signal-white">Account Session</h3>
          <p className="text-xs text-mist-200 mt-0.5">Signed in as demo-user@university.edu</p>
        </div>

        <Button
          variant="secondary"
          onClick={handleSignOut}
          className="text-xs text-signal-danger hover:text-signal-danger hover:bg-signal-danger/10 border-signal-danger/20 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
