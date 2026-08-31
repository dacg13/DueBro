"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { subjects, type Subject, type NewSubject } from "@/server/db/schema";
import { subjectSchema, type SubjectInput } from "@/lib/validation/subjects";
import { eq, and, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves subjects for the authenticated user, optionally filtered by term.
 */
export async function getSubjectsAction(termId?: string): Promise<ActionResult<Subject[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, data: [] };
    }

    const result = await db
      .select()
      .from(subjects)
      .where(
        termId && termId !== "all"
          ? and(eq(subjects.userId, user.id), eq(subjects.termId, termId))
          : eq(subjects.userId, user.id)
      )
      .orderBy(asc(subjects.archived), desc(subjects.createdAt));

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return { success: false, error: "Failed to load subjects" };
  }
}

/**
 * Creates a new subject.
 */
export async function createSubjectAction(rawInput: SubjectInput): Promise<ActionResult<Subject>> {
  const parseResult = subjectSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid subject data",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const input = parseResult.data;
    const newSubjectRecord: NewSubject = {
      termId: input.termId,
      userId: user.id,
      name: input.name.trim(),
      color: input.color.toUpperCase(),
      archived: false,
    };

    const [created] = await db.insert(subjects).values(newSubjectRecord).returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");
    revalidatePath("/today");

    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to create subject:", error);
    return { success: false, error: "Failed to create subject" };
  }
}

/**
 * Updates an existing subject.
 */
export async function updateSubjectAction(
  id: string,
  rawInput: Partial<SubjectInput>
): Promise<ActionResult<Subject>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const updateValues: Partial<NewSubject> = {
      ...rawInput,
      updatedAt: new Date(),
    };
    if (rawInput.color) {
      updateValues.color = rawInput.color.toUpperCase();
    }

    const [updated] = await db
      .update(subjects)
      .set(updateValues)
      .where(and(eq(subjects.id, id), eq(subjects.userId, user.id)))
      .returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");
    revalidatePath("/today");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update subject:", error);
    return { success: false, error: "Failed to update subject" };
  }
}

/**
 * Archives a subject.
 */
export async function archiveSubjectAction(id: string): Promise<ActionResult<Subject>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const [updated] = await db
      .update(subjects)
      .set({
        archived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(subjects.id, id), eq(subjects.userId, user.id)))
      .returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to archive subject:", error);
    return { success: false, error: "Failed to archive subject" };
  }
}

/**
 * Unarchives a subject.
 */
export async function unarchiveSubjectAction(id: string): Promise<ActionResult<Subject>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const [updated] = await db
      .update(subjects)
      .set({
        archived: false,
        archivedAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(subjects.id, id), eq(subjects.userId, user.id)))
      .returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to unarchive subject:", error);
    return { success: false, error: "Failed to unarchive subject" };
  }
}

/**
 * Deletes a subject.
 */
export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .delete(subjects)
      .where(and(eq(subjects.id, id), eq(subjects.userId, user.id)));

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete subject:", error);
    return { success: false, error: "Failed to delete subject" };
  }
}
