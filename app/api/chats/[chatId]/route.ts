import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ChatData = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> } // Mark params as Promise
) {
  const supabase = await createClient();
  try {
    // AWAIT params before accessing chatId
    const { chatId } = await params;
    

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new NextResponse("Unauthorized", { status: 401 });
    }
    

    // First, verify the chat exists and belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from('Chat')
      .select('id, userId, title, createdAt, updatedAt')
      .eq('id', chatId)
      .single();


    if (chatError) {
      console.error('❌ Chat error:', chatError);
      
      // Provide more specific error messages
      if (chatError.code === 'PGRST116') {
        return new NextResponse("Chat not found", { status: 404 });
      }
      
      throw chatError;
    }

    if (!chat) {
      console.warn('⚠️ No chat found for ID:', chatId);
      return new NextResponse("Chat not found", { status: 404 });
    }

    const chatData = chat as ChatData;

    // Security check: Ensure the logged-in user owns this chat
    if (chatData.userId !== user.id) {
      console.warn('🚫 Forbidden: User', user.id, 'tried to access chat owned by', chatData.userId);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch messages separately with explicit ordering
    const { data: messages, error: messagesError } = await supabase
      .from('Message')
      .select('*')
      .eq('chatId', chatId)
      .order('createdAt', { ascending: true });


    if (messagesError) {
      console.error('❌ Messages error:', messagesError);
      throw messagesError;
    }

    return NextResponse.json(messages || []);

  } catch (error) {
    console.error('💥 Error fetching chat:', error);
    return new NextResponse("An error occurred fetching chat.", { status: 500 });
  }
}
