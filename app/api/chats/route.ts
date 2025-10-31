// /app/api/chats/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This MUST be the same ID as in the file above
const DUMMY_USER_ID = "2959a622-8045-4de6-b03b-f0cbb6260036"; 

export async function GET() {
  try {
    if (!DUMMY_USER_ID) {
      throw new Error("Please set DUMMY_USER_ID in the API route");
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: DUMMY_USER_ID,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(chats);

  } catch (error) {
    console.error("Error fetching chats:", error);
    return new NextResponse("An error occurred fetching chats.", { status: 500 });
  }
}