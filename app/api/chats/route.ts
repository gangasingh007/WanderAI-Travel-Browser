// /app/api/chats/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase =await  createClient();
  try {
    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Fetch chats for that user
    const { data: chats, error } = await supabase
      .from('chat')
      .select('*')
      .eq('userId', user.id) // <-- Use the real user ID
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(chats);

  } catch (error) {
    console.error("Error fetching chats:", error);
    return new NextResponse("An error occurred fetching chats.", { status: 500 });
  }
}