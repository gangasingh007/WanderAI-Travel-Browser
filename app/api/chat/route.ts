import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Groq from "groq-sdk";

const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const DUMMY_USER_ID = "2959a622-8045-4de6-b03b-f0cbb6260036"; 

// -------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, chatId } = body;

    if (!DUMMY_USER_ID) {
      throw new Error("Please set DUMMY_USER_ID in the API route");
    }

    let currentChat;
    if (chatId) {
      currentChat = await prisma.chat.findUnique({ where: { id: chatId } });
    }
    
    if (!currentChat) { 
      currentChat = await prisma.chat.create({
        data: {
          userId: DUMMY_USER_ID, 
          title: "New Chat",
        },
      });
    }

    await prisma.message.create({
      data: {
        content: message,
        sender: "user",
        chatId: currentChat.id,
      },
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are Wander AI, a helpful travel assistant." },
        { role: "user", content: message },
      ],
    });

    const aiResponse = completion.choices[0].message.content || "Sorry, I couldn't think of a response.";

    await prisma.message.create({
      data: {
        content: aiResponse,
        sender: "ai",
        chatId: currentChat.id,
      },
    });

    return NextResponse.json({
      reply: aiResponse,
      chatId: currentChat.id,
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return new NextResponse("An error occurred. Please try again.", { status: 500 });
  }
}