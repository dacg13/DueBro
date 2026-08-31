"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, profileSchema, notificationPreferencesSchema, type LoginInput, type SignupInput, type ProfileInput, type NotificationPreferencesInput } from "@/lib/validation/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function signInAction(rawInput: LoginInput): Promise<ActionResult> {
  const parseResult = loginSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid credentials" };
  }

  const { email, password } = parseResult.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUpAction(rawInput: SignupInput): Promise<ActionResult> {
  const parseResult = signupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid sign up details" };
  }

  const { email, password, name } = parseResult.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: { user: data.user } };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUserAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string) || user.email?.split("@")[0] || "Student",
  };
}

export async function updateProfilePreferencesAction(rawInput: ProfileInput): Promise<ActionResult> {
  const parseResult = profileSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid profile data" };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Update Supabase user metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      name: parseResult.data.name,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: parseResult.data };
}

export async function updateNotificationPreferencesAction(rawInput: NotificationPreferencesInput): Promise<ActionResult> {
  const parseResult = notificationPreferencesSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: "Invalid notification preferences" };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  revalidatePath("/settings");
  return { success: true, data: parseResult.data };
}
