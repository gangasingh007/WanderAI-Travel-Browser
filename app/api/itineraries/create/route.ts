import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type CreateItineraryRequest = {
  title: string;
  description?: string;
  isPublic?: boolean;
  pins: Array<{
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    type?: string;
    icon?: string;
    orderIndex?: number;
    day?: number;
    date?: string;
  }>;
};

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = (await request.json()) as CreateItineraryRequest;
    const { title, description, isPublic = false, pins } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!pins || pins.length === 0) {
      return NextResponse.json({ error: "At least one pin is required" }, { status: 400 });
    }

    // Validate pins
    for (const pin of pins) {
      if (typeof pin.latitude !== "number" || typeof pin.longitude !== "number") {
        return NextResponse.json({ error: "Invalid pin coordinates" }, { status: 400 });
      }
      if (!pin.title || !pin.title.trim()) {
        return NextResponse.json({ error: "All pins must have a title" }, { status: 400 });
      }
    }

    // Create itinerary with pins in a transaction
    // @ts-ignore
    const result = await prisma.$transaction(async (tx) => {
      // Create itinerary
      const itinerary = await tx.itinerary.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          created_by: user.id,
          is_public: isPublic,
        },
      });

      // Create pins
      const createdPins = await Promise.all(
        pins.map((pin, index) => {
          // Map pin type to valid enum values
          const validPinTypes = ["HOTEL", "FOOD", "ATTRACTION", "CUSTOM", "CAR", "PIN"] as const;
          const validPinIcons = ["PIN", "CAR", "HOTEL", "FOOD", "ATTRACTION"] as const;
          
          let pinType = (pin.type?.toUpperCase() || "CUSTOM") as string;
          if (!validPinTypes.includes(pinType as any)) {
            pinType = "CUSTOM";
          }
          
          let pinIcon = (pin.icon?.toUpperCase() || pinType) as string;
          if (!validPinIcons.includes(pinIcon as any)) {
            // Default mapping for types not in icon enum
            const iconMap: Record<string, string> = {
              START: "PIN",
              END: "PIN",
              BIKE: "PIN",
              RICKSHAW: "PIN",
              PLANE: "PIN",
              TRAIN: "PIN",
            };
            pinIcon = iconMap[pinIcon] || "PIN";
          }
          
          return tx.itineraryPin.create({
            data: {
              itinerary_id: itinerary.id,
              latitude: pin.latitude,
              longitude: pin.longitude,
              title: pin.title.trim(),
              description: pin.description?.trim() || null,
              type: pinType as any,
              icon: pinIcon as any,
              order_index: pin.orderIndex ?? index,
              day: pin.day || null,
              date: pin.date ? new Date(pin.date) : null,
              created_by: user.id,
            },
          });
        })
      );

      return { itinerary, pins: createdPins };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          itinerary: result.itinerary,
          pins: result.pins,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[/api/itineraries/create] server error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
