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
    
    const rawMessage = (error.message || "").toString();
    const waitMatch = rawMessage.match(/after\s*(\d+)\s*seconds?/i);

    if (waitMatch) {
      const waitSeconds = Number(waitMatch[1]);
      const friendly = {
        ...error,
        message: `Please wait ${waitSeconds} second${waitSeconds === 1 ? "" : "s"} before trying again.`,
        waitSeconds,
      } as any;

      return { data: null, error: friendly };
    }

    // For other errors, return the original error to the caller to handle
    return { data: null, error };
  } else {
    console.log("[auth.signUp] supabase.auth.signUp success", {
      userId: data.user?.id,
      hasSession: Boolean(data.session),
    });
  }

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
        console.error("[auth.signUp]/api/users/create failed", res.status, err);
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

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[auth.signIn] supabase.auth.signInWithPassword error", error);

      // Map common auth error codes to friendlier messages for the UI
      const code = (error?.code || "").toString();
      let friendlyMessage = error.message || "Sign in failed";

      if (/invalid_credentials/i.test(code) || /invalid_login_credentials/i.test(friendlyMessage)) {
        friendlyMessage = "Invalid email or password. If you recently signed up, please check your inbox to verify your email address before signing in.";
      } else if (/too_many_requests|rate_limit|retry/i.test(code + " " + friendlyMessage)) {
        friendlyMessage = "Too many attempts. Please wait a moment and try again.";
      }

      const friendlyError = { ...error, message: friendlyMessage, code } as any;
      return { data: null, error: friendlyError };
    }

    return { data, error: null };
  } catch (thrown: any) {
    // In case the Supabase client unexpectedly throws (network or runtime errors),
    // capture and return a friendly error instead of letting it bubble up.
    console.error("[auth.signIn] unexpected exception", thrown);
    const message = (thrown?.message && String(thrown.message)) || String(thrown) || "Sign in failed";
    return { data: null, error: { message, code: "exception" } };
  }
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