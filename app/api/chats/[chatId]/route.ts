// /app/api/chats/[chatId]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const supabase = await createClient();
  try {
    const chatId = params.chatId;

    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Fetch the chat and its messages
    const { data: chat, error } = await supabase
      .from('chat')
      .select('*, message(*)')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // 3. SECURITY CHECK: Ensure the logged-in user owns this chat
    const chatData = chat as any;
    if (chatData.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 4. Sort messages and return
    const sortedMessages = (chatData.message || []).sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json(sortedMessages);

  } catch (error) {
    console.error("Error fetching chat:", error);
    return new NextResponse("An error occurred fetching chat.", { status: 500 });
  }
}