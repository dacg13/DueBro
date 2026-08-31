export const reminderModeEnum = ["relative", "absolute"] as const;
export type ReminderMode = (typeof reminderModeEnum)[number];

export const reminderChannelEnum = ["push", "email"] as const;
export type ReminderChannel = (typeof reminderChannelEnum)[number];

export const notificationStatusEnum = ["queued", "sent", "failed"] as const;
export type NotificationStatus = (typeof notificationStatusEnum)[number];

export interface Reminder {
  id: string;
  deadlineId: string;
  userId: string;
  mode: ReminderMode;
  offsetMinutes: number | null; // e.g. 1440 (1 day), 120 (2 hours), 10080 (7 days)
  fireAt: Date;
  channels: ReminderChannel[];
  isDispatched: boolean;
  createdAt: Date;
}

export interface InAppNotification {
  id: string;
  userId: string;
  deadlineId: string | null;
  reminderId: string | null;
  title: string;
  body: string;
  channel: string;
  status: NotificationStatus;
  sentAt: Date | null;
  createdAt: Date;
}

export interface QuietHoursConfig {
  enabled: boolean;
  start: string; // "HH:MM" e.g. "22:00"
  end: string; // "HH:MM" e.g. "08:00"
}
