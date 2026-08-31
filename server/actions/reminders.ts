"use server";

import { db } from "@/server/db";
import { reminders, notifications } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { reminderSchema, type ReminderInput } from "@/lib/validation/reminders";
import { type Reminder, type InAppNotification, type ReminderChannel } from "@/types";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getRemindersForDeadlineAction(
  deadlineId: string
): Promise<ActionResult<Reminder[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    const rows = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.deadlineId, deadlineId), eq(reminders.userId, userId)))
      .orderBy(reminders.fireAt);

    const mapped: Reminder[] = rows.map((r) => ({
      id: r.id,
      deadlineId: r.deadlineId,
      userId: r.userId,
      mode: r.mode,
      offsetMinutes: r.offsetMinutes,
      fireAt: new Date(r.fireAt),
      channels: r.channels as ReminderChannel[],
      isDispatched: r.isDispatched,
      createdAt: new Date(r.createdAt),
    }));

    return { success: true, data: mapped };
  } catch {
    return { success: false, error: "Failed to fetch reminders for deadline." };
  }
}

export async function createReminderAction(
  deadlineId: string,
  input: ReminderInput
): Promise<ActionResult<Reminder>> {
  try {
    const validated = reminderSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid reminder data." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    // 1. Check existing reminders count for 3-cap enforcement
    const existing = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.deadlineId, deadlineId), eq(reminders.userId, userId)));

    if (existing.length >= 3) {
      return { success: false, error: "Maximum 3 reminders allowed per deadline." };
    }

    const fireAtDate =
      validated.data.mode === "absolute" && validated.data.fireAt
        ? new Date(validated.data.fireAt)
        : new Date(Date.now() + 86400000);

    const [created] = await db
      .insert(reminders)
      .values({
        deadlineId,
        userId,
        mode: validated.data.mode,
        offsetMinutes: validated.data.offsetMinutes ?? null,
        fireAt: fireAtDate,
        channels: validated.data.channels,
        isDispatched: false,
      })
      .returning();

    const mapped: Reminder = {
      id: created.id,
      deadlineId: created.deadlineId,
      userId: created.userId,
      mode: created.mode,
      offsetMinutes: created.offsetMinutes,
      fireAt: new Date(created.fireAt),
      channels: created.channels as ReminderChannel[],
      isDispatched: created.isDispatched,
      createdAt: new Date(created.createdAt),
    };

    return { success: true, data: mapped };
  } catch {
    return { success: false, error: "Failed to create reminder." };
  }
}

export async function deleteReminderAction(reminderId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    await db
      .delete(reminders)
      .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

    return { success: true, data: { id: reminderId } };
  } catch {
    return { success: false, error: "Failed to delete reminder." };
  }
}

export async function getInAppNotificationsAction(): Promise<ActionResult<InAppNotification[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const mapped: InAppNotification[] = rows.map((n) => ({
      id: n.id,
      userId: n.userId,
      deadlineId: null,
      reminderId: n.reminderId,
      title: `Reminder Dispatch [${n.channel.toUpperCase()}]`,
      body: n.errorMessage || `Notification dispatched via ${n.channel}`,
      channel: n.channel,
      status: n.status,
      sentAt: n.sentAt ? new Date(n.sentAt) : null,
      createdAt: new Date(n.createdAt),
    }));

    return { success: true, data: mapped };
  } catch {
    return { success: false, error: "Failed to fetch notifications." };
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    await db
      .update(notifications)
      .set({ status: "sent", sentAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    return { success: true, data: { id: notificationId } };
  } catch {
    return { success: false, error: "Failed to mark notification as read." };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "demo-user";

    await db
      .update(notifications)
      .set({ status: "sent", sentAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.status, "queued")));

    return { success: true, data: { count: 1 } };
  } catch {
    return { success: false, error: "Failed to mark all notifications as read." };
  }
}
