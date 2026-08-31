"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { academicTerms, type AcademicTerm, type NewAcademicTerm } from "@/server/db/schema";
import { academicTermSchema, type AcademicTermInput } from "@/lib/validation/academic-terms";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves all academic terms for the user.
 */
export async function getAcademicTermsAction(): Promise<ActionResult<AcademicTerm[]>> {
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
      .from(academicTerms)
      .where(eq(academicTerms.userId, user.id))
      .orderBy(desc(academicTerms.startDate));

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch academic terms:", error);
    return { success: false, error: "Failed to load academic terms" };
  }
}

/**
 * Creates a new academic term.
 */
export async function createAcademicTermAction(
  rawInput: AcademicTermInput
): Promise<ActionResult<AcademicTerm>> {
  const parseResult = academicTermSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid term dates",
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

    // If new term is set as current, unset previous current terms
    if (input.isCurrent) {
      await db
        .update(academicTerms)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(eq(academicTerms.userId, user.id));
    }

    const newTermRecord: NewAcademicTerm = {
      userId: user.id,
      name: input.name.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      isCurrent: input.isCurrent,
    };

    const [created] = await db.insert(academicTerms).values(newTermRecord).returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to create academic term:", error);
    return { success: false, error: "Failed to create academic term" };
  }
}

/**
 * Updates an academic term.
 */
export async function updateAcademicTermAction(
  id: string,
  rawInput: Partial<AcademicTermInput>
): Promise<ActionResult<AcademicTerm>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    if (rawInput.isCurrent) {
      await db
        .update(academicTerms)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(eq(academicTerms.userId, user.id));
    }

    const [updated] = await db
      .update(academicTerms)
      .set({ ...rawInput, updatedAt: new Date() })
      .where(and(eq(academicTerms.id, id), eq(academicTerms.userId, user.id)))
      .returning();

    revalidatePath("/subjects");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update academic term:", error);
    return { success: false, error: "Failed to update academic term" };
  }
}

/**
 * Sets a specific term as the active current term.
 */
export async function setActiveAcademicTermAction(id: string): Promise<ActionResult<AcademicTerm>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Unset all
    await db
      .update(academicTerms)
      .set({ isCurrent: false, updatedAt: new Date() })
      .where(eq(academicTerms.userId, user.id));

    // Set selected
    const [updated] = await db
      .update(academicTerms)
      .set({ isCurrent: true, updatedAt: new Date() })
      .where(and(eq(academicTerms.id, id), eq(academicTerms.userId, user.id)))
      .returning();

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to set active term:", error);
    return { success: false, error: "Failed to set active term" };
  }
}

/**
 * Deletes an academic term.
 */
export async function deleteAcademicTermAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .delete(academicTerms)
      .where(and(eq(academicTerms.id, id), eq(academicTerms.userId, user.id)));

    revalidatePath("/subjects");
    revalidatePath("/deadlines");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete academic term:", error);
    return { success: false, error: "Failed to delete academic term" };
  }
}
