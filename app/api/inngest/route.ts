import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { dispatchDueRemindersJob } from "@/server/inngest/reminders";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dispatchDueRemindersJob],
});
