import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type CreateUserRequest = {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string | null;
  userType?: "TRAVELER" | "CREATOR" | string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateUserRequest>;
    const { id, email, username, fullName, userType } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing required fields id or email" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Supabase credentials not configured on server" },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(url, serviceKey);

    // First attempt upsert by id
    const now = new Date().toISOString();

    let { error } = await supabase
      .from("users")
      .upsert(
        [
          {
            id,
            email,
            username: username ?? null,
            full_name: fullName ?? null,
            user_type: (userType ?? "TRAVELER").toUpperCase(),
            created_at: now,
            updated_at: now,
          },
        ],
        { onConflict: "id" }
      );

    // If unique violation due to username constraint, retry with suffixed username
    if (error && error.code === "23505") {
      const safeUsername = `${(username ?? "user").toString()}_${id?.toString().slice(0, 6)}`;
      const retry = await supabase
        .from("users")
        .upsert(
          [
            {
              id,
              email,
              username: safeUsername,
              full_name: fullName ?? null,
              user_type: (userType ?? "TRAVELER").toUpperCase(),
              created_at: now,
              updated_at: now,
            },
          ],
          { onConflict: "id" }
        );
      error = retry.error ?? null;
    }

    if (error) {
      // Ensure we return a stable, serializable error message instead of
      // possibly returning `{}` when fields like `message` are undefined.
      const message =
        typeof error?.message === "string" && error.message.trim()
          ? error.message
          : JSON.stringify(error) !== "{}"
          ? JSON.stringify(error)
          : String(error) || "Upsert failed";

      console.error("[/api/users/create] upsert error", { message, code: error.code, error });

      return NextResponse.json(
        { error: message, code: error?.code ?? null },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" && err.message.trim()
        ? err.message
        : JSON.stringify(err) !== "{}"
        ? JSON.stringify(err)
        : String(err) || "Unknown server error";

    console.error("[/api/users/create] server error", { message, err });

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}


