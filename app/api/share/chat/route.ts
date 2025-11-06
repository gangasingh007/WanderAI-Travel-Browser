import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { chatId } = await request.json();

    // Verify the chat belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from('Chat')
      .select('id, userId, title')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    if ((chat as any).userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Generate shareable link ID
    const shareId = uuidv4();
    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/chat/${shareId}`;

    // Store share record (you might want to create a 'shared_chats' table)
    const { error: shareError } = await supabase
      .from('shared_chats')
      .insert({
        id: shareId,
        chatId: chatId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      } as any);

    if (shareError) {
      console.error('Share error:', shareError);
    }

    return NextResponse.json({
      shareLink: shareableLink,
      shareId: shareId
    });

  } catch (error) {
    console.error("Error creating share link:", error);
    return new NextResponse("An error occurred.", { status: 500 });
  }
}
