"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { deadlines, subtasks, type Deadline, type NewDeadline, type Subtask } from "@/server/db/schema";
import { deadlineSchema, type DeadlineFormInput } from "@/lib/validation/deadlines";
import { calculateDeadlineProgress } from "@/server/domain/deadlines";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves all deadlines for the authenticated user with optional filtering.
 */
export async function getDeadlinesAction(filters?: {
  subjectId?: string;
  type?: string;
  status?: string;
  search?: string;
}): Promise<ActionResult<Deadline[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If unauthenticated (e.g. initial dev test), return empty
    if (!user) {
      return { success: true, data: [] };
    }

    const query = db
      .select()
      .from(deadlines)
      .where(and(eq(deadlines.userId, user.id), isNull(deadlines.deletedAt)))
      .orderBy(asc(deadlines.dueDate), desc(deadlines.createdAt));

    const result = await query;
    let filtered = result;

    if (filters?.subjectId && filters.subjectId !== "all") {
      filtered = filtered.filter((d) => d.subjectId === filters.subjectId);
    }
    if (filters?.type && filters.type !== "all") {
      filtered = filtered.filter((d) => d.type === filters.type);
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((d) => d.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (d) => d.title.toLowerCase().includes(q) || (d.notes && d.notes.toLowerCase().includes(q))
      );
    }

    return { success: true, data: filtered };
  } catch (error) {
    console.error("Failed to fetch deadlines:", error);
    return { success: false, error: "Failed to load deadlines" };
  }
}

/**
 * Creates a new Deadline.
 */
export async function createDeadlineAction(rawInput: DeadlineFormInput): Promise<ActionResult<Deadline>> {
  const parseResult = deadlineSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid deadline data",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to create deadlines" };
    }

    const input = parseResult.data;
    const newDeadlineRecord: NewDeadline = {
      userId: user.id,
      title: input.title,
      type: input.type,
      subjectId: input.subjectId || null,
      termId: input.termId || null,
      dueDate: input.dueDate || null,
      dueTime: input.dueTime || null,
      priority: input.priority,
      status: input.status,
      progress: input.progress,
      estimatedEffortHours: input.estimatedEffortHours || null,
      location: input.location || null,
      notes: input.notes || null,
      tags: input.tags,
      links: input.links,
      recurrenceRuleId: input.recurrenceRuleId || null,
    };

    const [created] = await db.insert(deadlines).values(newDeadlineRecord).returning();

    revalidatePath("/deadlines");
    revalidatePath("/today");
    revalidatePath("/calendar");

    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to create deadline:", error);
    return { success: false, error: "Failed to create deadline" };
  }
}

/**
 * Updates an existing Deadline.
 */
export async function updateDeadlineAction(
  id: string,
  rawInput: Partial<DeadlineFormInput>
): Promise<ActionResult<Deadline>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const updateValues: Partial<NewDeadline> = {
      ...rawInput,
      updatedAt: new Date(),
    };

    if (rawInput.status === "completed") {
      updateValues.completedAt = new Date();
      updateValues.progress = 100;
    } else if (rawInput.status) {
      updateValues.completedAt = null;
    }

    const [updated] = await db
      .update(deadlines)
      .set(updateValues)
      .where(and(eq(deadlines.id, id), eq(deadlines.userId, user.id)))
      .returning();

    revalidatePath("/deadlines");
    revalidatePath("/today");
    revalidatePath("/calendar");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update deadline:", error);
    return { success: false, error: "Failed to update deadline" };
  }
}

/**
 * Toggles a deadline's completion status.
 */
export async function toggleDeadlineCompleteAction(id: string): Promise<ActionResult<Deadline>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const [existing] = await db
      .select()
      .from(deadlines)
      .where(and(eq(deadlines.id, id), eq(deadlines.userId, user.id)));

    if (!existing) {
      return { success: false, error: "Deadline not found" };
    }

    const isNowCompleted = existing.status !== "completed";
    const newStatus = isNowCompleted ? "completed" : "not_started";
    const newProgress = isNowCompleted ? 100 : existing.progress;

    const [updated] = await db
      .update(deadlines)
      .set({
        status: newStatus,
        completedAt: isNowCompleted ? new Date() : null,
        progress: newProgress,
        updatedAt: new Date(),
      })
      .where(and(eq(deadlines.id, id), eq(deadlines.userId, user.id)))
      .returning();

    revalidatePath("/deadlines");
    revalidatePath("/today");
    revalidatePath("/calendar");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle deadline completion:", error);
    return { success: false, error: "Failed to toggle completion" };
  }
}

/**
 * Soft deletes a deadline.
 */
export async function deleteDeadlineAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .update(deadlines)
      .set({ deletedAt: new Date() })
      .where(and(eq(deadlines.id, id), eq(deadlines.userId, user.id)));

    revalidatePath("/deadlines");
    revalidatePath("/today");
    revalidatePath("/calendar");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete deadline:", error);
    return { success: false, error: "Failed to delete deadline" };
  }
}

/**
 * Subtask Actions
 */
export async function getSubtasksAction(deadlineId: string): Promise<ActionResult<Subtask[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    const list = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.deadlineId, deadlineId), eq(subtasks.userId, user.id)))
      .orderBy(asc(subtasks.position));

    return { success: true, data: list };
  } catch (error) {
    console.error("Failed to fetch subtasks:", error);
    return { success: false, error: "Failed to load subtasks" };
  }
}

export async function createSubtaskAction(deadlineId: string, title: string): Promise<ActionResult<Subtask>> {
  if (!title.trim()) return { success: false, error: "Subtask title is required" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const existing = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.deadlineId, deadlineId), eq(subtasks.userId, user.id)));

    const [created] = await db
      .insert(subtasks)
      .values({
        deadlineId,
        userId: user.id,
        title: title.trim(),
        position: existing.length,
      })
      .returning();

    // Recalculate deadline progress
    const allSubtasks = [...existing, created];
    const newProgress = calculateDeadlineProgress(allSubtasks);
    await db
      .update(deadlines)
      .set({ progress: newProgress, updatedAt: new Date() })
      .where(eq(deadlines.id, deadlineId));

    revalidatePath("/deadlines");
    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to create subtask:", error);
    return { success: false, error: "Failed to create subtask" };
  }
}

export async function toggleSubtaskAction(subtaskId: string): Promise<ActionResult<Subtask>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [existing] = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.userId, user.id)));

    if (!existing) return { success: false, error: "Subtask not found" };

    const [updated] = await db
      .update(subtasks)
      .set({
        isCompleted: !existing.isCompleted,
        updatedAt: new Date(),
      })
      .where(eq(subtasks.id, subtaskId))
      .returning();

    // Recalculate deadline progress
    const all = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.deadlineId, existing.deadlineId));

    const newProgress = calculateDeadlineProgress(all);
    await db
      .update(deadlines)
      .set({ progress: newProgress, updatedAt: new Date() })
      .where(eq(deadlines.id, existing.deadlineId));

    revalidatePath("/deadlines");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle subtask:", error);
    return { success: false, error: "Failed to toggle subtask" };
  }
}

export async function deleteSubtaskAction(subtaskId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [existing] = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.userId, user.id)));

    if (!existing) return { success: false, error: "Subtask not found" };

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));

    const all = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.deadlineId, existing.deadlineId));

    const newProgress = calculateDeadlineProgress(all);
    await db
      .update(deadlines)
      .set({ progress: newProgress, updatedAt: new Date() })
      .where(eq(deadlines.id, existing.deadlineId));

    revalidatePath("/deadlines");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete subtask:", error);
    return { success: false, error: "Failed to delete subtask" };
  }
}
