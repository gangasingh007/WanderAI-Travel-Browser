import { createClient } from "@/lib/supabase/client";

/**
 * Auth utility functions
 */

export type UserType = "traveler" | "creator";

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  userType: UserType,
  fullName?: string,
  username?: string
) {
  const supabase = createClient();

  console.log("[auth.signUp] start", {
    email,
    userType,
    hasFullName: Boolean(fullName),
    hasUsername: Boolean(username),
  });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: userType,
        full_name: fullName,
        username: username,
      },
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    console.error("[auth.signUp] supabase.auth.signUp error", error);
  } else {
    console.log("[auth.signUp] supabase.auth.signUp success", {
      userId: data.user?.id,
      hasSession: Boolean(data.session),
    });
  }

  if (error) throw error;

  // Server-side insert into public.users using service role route
  if (data.user) {
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          username,
          fullName,
          userType: userType.toUpperCase(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[auth.signUp] /api/users/create failed", res.status, err);
      } else {
        console.log("[auth.signUp] profile upserted in public.users");
      }
    } catch (insertErr) {
      console.error("[auth.signUp] failed to call /api/users/create", insertErr);
    }
  }

  return { data, error: null };
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  return { error };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

