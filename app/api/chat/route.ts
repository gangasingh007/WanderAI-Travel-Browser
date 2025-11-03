import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from 'uuid';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { message, chatId } = body;

    let currentChatId = chatId;

    // 2. Find or create the chat
    if (!currentChatId) {
      const newChatId = uuidv4();
      const { error: chatError } = await supabase
        .from('Chat')
        .insert({
          id: newChatId,
          userId: user.id, // <-- Use the real user ID
          title: "New Chat",
          updatedAt: new Date().toISOString(),
        } as any);

      if (chatError) throw chatError;
      currentChatId = newChatId;
    }

    // 3. Save the User's message
    const { error: userMessageError } = await supabase
      .from('Message')
      .insert({
        id: uuidv4(),
        content: message,
        sender: "user",
        chatId: currentChatId,
      } as any);
    
    if (userMessageError) throw userMessageError;

    // 4. Get AI response
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are Wander AI, a helpful travel assistant and for every query you have to answer in detail with proper tabular comparisons and Detials" },
        { role: "user", content: message },
      ],
    });
    const aiResponse = completion.choices[0].message.content || "Sorry, I couldn't think of a response.";

    // 5. Save AI message
    const { error: aiMessageError } = await supabase
      .from('Message')
      .insert({
        id: uuidv4(),
        content: aiResponse,
        sender: "ai",
        chatId: currentChatId,
      } as any);
    
    if (aiMessageError) throw aiMessageError;

    // 6. Respond
    return NextResponse.json({
      reply: aiResponse,
      chatId: currentChatId,
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return new NextResponse("An error occurred. Please try again.", { status: 500 });
  }
}