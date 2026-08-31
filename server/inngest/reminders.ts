import { inngest } from "./client";
import { db } from "@/server/db";
import { reminders, notifications, deadlines } from "@/server/db/schema";
import { eq, and, lte } from "drizzle-orm";

export const dispatchDueRemindersJob = inngest.createFunction(
  {
    id: "dispatch-due-reminders",
    name: "Dispatch Due Reminders",
    triggers: [{ cron: "* * * * *" }], // Runs every minute
  },
  async ({ step }) => {
    // Step 1: Find all un-dispatched reminders that have reached their fireAt time
    const dueReminders = await step.run("fetch-due-reminders", async () => {
      const now = new Date();
      return await db
        .select({
          reminder: reminders,
          deadline: deadlines,
        })
        .from(reminders)
        .innerJoin(deadlines, eq(reminders.deadlineId, deadlines.id))
        .where(and(eq(reminders.isDispatched, false), lte(reminders.fireAt, now)))
        .limit(100);
    });

    if (dueReminders.length === 0) {
      return { message: "No reminders due for dispatch." };
    }

    // Step 2: Fan out notification records & mark reminders as dispatched
    const dispatchedCount = await step.run("dispatch-notifications", async () => {
      let count = 0;

      for (const item of dueReminders) {
        const { reminder } = item;

        for (const channel of reminder.channels) {
          // Record notification dispatch log
          await db.insert(notifications).values({
            userId: reminder.userId,
            reminderId: reminder.id,
            channel,
            status: "sent",
            sentAt: new Date(),
          });
        }

        // Mark reminder as dispatched
        await db
          .update(reminders)
          .set({
            isDispatched: true,
          })
          .where(eq(reminders.id, reminder.id));

        count++;
      }

      return count;
    });

    return { success: true, dispatchedCount };
  }
);
