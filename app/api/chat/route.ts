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
    let isNewChat = false;

    // 2. Find or create the chat
    if (!currentChatId) {
      isNewChat = true;
      const newChatId = uuidv4();
      
      // Generate a dynamic title from the first message using AI
      let chatTitle = "New Chat";
      try {
        const titleCompletion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { 
              role: "system", 
              content: "Generate a concise, 3-5 word title that captures the essence of the user's message. Do not use quotation marks. Only respond with the title, nothing else." 
            },
            { role: "user", content: message },
          ],
          max_tokens: 20,
          temperature: 0.7,
        });
        
        const generatedTitle = titleCompletion.choices[0].message.content?.trim();
        if (generatedTitle && generatedTitle.length > 0) {
          chatTitle = generatedTitle.replace(/['"]/g, ''); // Remove any quotes
        }
      } catch (titleError) {
        console.error("Error generating title:", titleError);
        // Fallback: use first 50 characters of the message
        chatTitle = message.length > 50 ? message.substring(0, 47) + "..." : message;
      }

      const { error: chatError } = await supabase
        .from('Chat')
        .insert({
          id: newChatId,
          userId: user.id,
          title: chatTitle,
          updatedAt: new Date().toISOString(),
        } as any);

      if (chatError) throw chatError;
      currentChatId = newChatId;
    }

    // 3. Fetch conversation history (last 10 messages for context)
    const { data: previousMessages, error: historyError } = await supabase
      .from('Message')
      .select('content, sender, createdAt')
      .eq('chatId', currentChatId)
      .order('createdAt', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
    }

    // 4. Build conversation history for AI
    const conversationHistory = [];
    
    // Add system message
    conversationHistory.push({
      role: "system",
      content: "You are Wander AI, a helpful travel assistant. For every query you have to answer in detail with proper tabular comparisons and details. Maintain context from previous messages in the conversation."
    });

    // Add previous messages as context (if any)
    if (previousMessages && previousMessages.length > 0) {
      previousMessages.forEach((msg: any) => {
        conversationHistory.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content
        });
      });
    }

    // Add current user message
    conversationHistory.push({
      role: "user",
      content: message
    });

    console.log('📜 Conversation history length:', conversationHistory.length - 1); // -1 for system message

    // 5. Save the User's message
    const { error: userMessageError } = await supabase
      .from('Message')
      .insert({
        id: uuidv4(),
        content: message,
        sender: "user",
        chatId: currentChatId,
      } as any);
    
    if (userMessageError) throw userMessageError;

    // 6. Get AI response with full conversation context
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: conversationHistory as any,
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    const aiResponse = completion.choices[0].message.content || "Sorry, I couldn't think of a response.";

    // 7. Save AI message
    const { error: aiMessageError } = await supabase
      .from('Message')
      .insert({
        id: uuidv4(),
        content: aiResponse,
        sender: "ai",
        chatId: currentChatId,
      } as any);
    
    if (aiMessageError) throw aiMessageError;

    // 8. Update chat timestamp
    
    await supabase
      .from('Chat')
      // @ts-ignore
      .update({ updatedAt: new Date().toISOString() }as any )
      .eq('id', currentChatId);

    // 9. Respond
    return NextResponse.json({
      reply: aiResponse,
      chatId: currentChatId,
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return new NextResponse("An error occurred. Please try again.", { status: 500 });
  }
}
