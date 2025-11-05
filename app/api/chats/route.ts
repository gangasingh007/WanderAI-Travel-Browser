// /app/api/chats/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get limit from query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    // 3. Fetch chats for that user
    let query = supabase
      .from('Chat')
      .select('*')
      .eq('userId', user.id) // <-- Use the real user ID
      .order('createdAt', { ascending: false });

    // Apply limit if provided
    if (limitNumber && limitNumber > 0) {
      query = query.limit(limitNumber);
    }

    const { data: chats, error } = await query;

    if (error) throw error;

    return NextResponse.json(chats);

  } catch (error) {
    console.error("Error fetching chats:", error);
    return new NextResponse("An error occurred fetching chats.", { status: 500 });
  }
}