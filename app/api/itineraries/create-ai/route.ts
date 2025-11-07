import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeLocation, geocodeMultipleLocations, type GeocodeResult } from "@/lib/geocoding";
import { v4 as uuidv4 } from 'uuid';
import {
  createItinerarySystemPrompt,
  createItineraryUserPrompt,
  parseAIResponse,
  type ParsedItinerary,
  type ItineraryLocation,
} from "@/lib/ai/itinerary-prompt";

// Lazy load Groq to avoid module initialization errors
let Groq: any = null;
let groqInstance: any = null;

async function getGroqClient() {
  if (groqInstance) {
    return groqInstance;
  }

  try {
    if (!Groq) {
      Groq = (await import("groq-sdk")).default;
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }

    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    return groqInstance;
  } catch (error) {
    console.error("Failed to initialize Groq client:", error);
    throw error;
  }
}

type CreateAIItineraryRequest = {
  prompt?: string;
  videoLink?: string;
  isPublic?: boolean;
};

/**
 * Map location type from AI to database enum
 */
function mapPinType(
  type: string
): "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN" {
  const upperType = type.toUpperCase();
  const validTypes = ["HOTEL", "FOOD", "ATTRACTION", "CUSTOM", "CAR", "PIN"];
  return validTypes.includes(upperType) ? (upperType as any) : "CUSTOM";
}

/**
 * Map location type to icon
 */
function mapPinIcon(
  type: "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN"
): "PIN" | "CAR" | "HOTEL" | "FOOD" | "ATTRACTION" {
  const iconMap: Record<string, "PIN" | "CAR" | "HOTEL" | "FOOD" | "ATTRACTION"> = {
    HOTEL: "HOTEL",
    FOOD: "FOOD",
    ATTRACTION: "ATTRACTION",
    CUSTOM: "PIN",
    CAR: "CAR",
    PIN: "PIN",
  };
  return iconMap[type] || "PIN";
}

export async function POST(request: Request) {
  console.log("[create-ai] ====== REQUEST RECEIVED ======");
  console.log("[create-ai] Timestamp:", new Date().toISOString());
  
  // Ensure we always return JSON, even for unexpected errors
  try {
    console.log("[create-ai] Step 1: Starting request processing");
    
    // Validate environment variables first
    console.log("[create-ai] Step 2: Checking environment variables");
    console.log("[create-ai] GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
    console.log("[create-ai] MAPBOX_TOKEN exists:", !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
    
    if (!process.env.GROQ_API_KEY) {
      console.error("[create-ai] ERROR: GROQ_API_KEY is missing");
      return NextResponse.json(
        { error: "AI service is not configured. Please check GROQ_API_KEY environment variable." },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("[create-ai] ERROR: NEXT_PUBLIC_MAPBOX_TOKEN is missing");
      return NextResponse.json(
        { error: "Map service is not configured. Please check NEXT_PUBLIC_MAPBOX_TOKEN environment variable." },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("[create-ai] Step 3: Environment variables validated");

    // Parse request body first (before other async operations)
    console.log("[create-ai] Step 4: Parsing request body");
    let body: CreateAIItineraryRequest;
    try {
      body = (await request.json()) as CreateAIItineraryRequest;
      console.log("[create-ai] Request body parsed successfully");
      console.log("[create-ai] Body keys:", Object.keys(body));
      console.log("[create-ai] Has prompt:", !!body.prompt);
      console.log("[create-ai] Has videoLink:", !!body.videoLink);
    } catch (parseError: any) {
      console.error("[create-ai] ERROR: Failed to parse request body");
      console.error("[create-ai] Parse error:", parseError);
      console.error("[create-ai] Parse error message:", parseError?.message);
      console.error("[create-ai] Parse error stack:", parseError?.stack);
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get authenticated user
    console.log("[create-ai] Step 5: Initializing Supabase client");
    let supabase;
    try {
      supabase = await createClient();
      console.log("[create-ai] Supabase client created successfully");
    } catch (supabaseError: any) {
      console.error("[create-ai] ERROR: Failed to create Supabase client");
      console.error("[create-ai] Supabase error:", supabaseError);
      console.error("[create-ai] Supabase error message:", supabaseError?.message);
      console.error("[create-ai] Supabase error stack:", supabaseError?.stack);
      return NextResponse.json(
        { error: "Failed to initialize authentication service." },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("[create-ai] Step 6: Getting authenticated user");
    let user;
    let authError;
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
      authError = authResult.error;
      console.log("[create-ai] Auth result received");
      console.log("[create-ai] Has user:", !!user);
      console.log("[create-ai] Has auth error:", !!authError);
      if (authError) {
        console.error("[create-ai] Auth error details:", authError);
      }
    } catch (authErr: any) {
      console.error("[create-ai] ERROR: Exception during auth");
      console.error("[create-ai] Auth exception:", authErr);
      console.error("[create-ai] Auth exception message:", authErr?.message);
      console.error("[create-ai] Auth exception stack:", authErr?.stack);
      return NextResponse.json(
        { error: "Authentication failed." },
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (authError || !user) {
      console.error("[create-ai] ERROR: Unauthorized - no user or auth error");
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("[create-ai] Step 7: User authenticated, processing request body");
    const { prompt, videoLink, isPublic = false } = body;
    console.log("[create-ai] Prompt:", prompt?.substring(0, 100) + "...");
    console.log("[create-ai] VideoLink:", videoLink);
    console.log("[create-ai] IsPublic:", isPublic);

    // Validate input
    console.log("[create-ai] Step 8: Validating input");
    if (!prompt && !videoLink) {
      console.error("[create-ai] ERROR: No prompt or videoLink provided");
      return NextResponse.json(
        { error: "Either prompt or videoLink is required" },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // For now, we'll focus on prompt-based generation
    // Video link processing can be added later
    if (videoLink) {
      console.log("[create-ai] Video link provided (not yet implemented)");
      return NextResponse.json(
        { error: "Video link processing is not yet implemented. Please use prompt-based generation." },
        { 
          status: 501,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!prompt || !prompt.trim()) {
      console.error("[create-ai] ERROR: Prompt is empty");
      return NextResponse.json(
        { error: "Prompt is required" },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("[create-ai] Step 9: Input validated, starting AI processing");

    // Step 1: Use Groq to extract itinerary information
    console.log("[create-ai] Step 10: Initializing Groq client");
    let parsedItinerary: ParsedItinerary | null = null;
    let aiResponse = "";

    try {
      console.log("[create-ai] Getting Groq client instance");
      const groq = await getGroqClient();
      console.log("[create-ai] Groq client obtained successfully");
      
      console.log("[create-ai] Step 11: Creating AI completion request");
      const systemPrompt = createItinerarySystemPrompt();
      const userPrompt = createItineraryUserPrompt(prompt);
      console.log("[create-ai] System prompt length:", systemPrompt.length);
      console.log("[create-ai] User prompt length:", userPrompt.length);
      
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      console.log("[create-ai] Step 12: AI completion received");
      aiResponse = completion.choices[0].message.content || "";
      console.log("[create-ai] AI response length:", aiResponse.length);
      console.log("[create-ai] AI response preview:", aiResponse.substring(0, 200));
      
      console.log("[create-ai] Step 13: Parsing AI response");
      parsedItinerary = parseAIResponse(aiResponse);
      console.log("[create-ai] Parsed itinerary:", !!parsedItinerary);

      if (!parsedItinerary) {
        console.warn("[create-ai] WARNING: Failed to parse AI response, attempting to fix...");
        // Retry with a more lenient parser
        try {
          // Extract JSON from response if wrapped in text
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log("[create-ai] Found JSON match, retrying parse");
            parsedItinerary = parseAIResponse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("[create-ai] ERROR: Retry parse failed:", e);
        }

        if (!parsedItinerary) {
          console.error("[create-ai] ERROR: Could not parse AI response after retry");
          return NextResponse.json(
            {
              error: "Failed to parse AI response. Please try rephrasing your request.",
              rawResponse: aiResponse.substring(0, 500), // Return first 500 chars for debugging
            },
            { 
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
      
      console.log("[create-ai] Step 14: AI response parsed successfully");
      console.log("[create-ai] Itinerary title:", parsedItinerary.title);
      console.log("[create-ai] Number of locations:", parsedItinerary.locations.length);
    } catch (error: any) {
      console.error("[create-ai] ERROR: AI processing exception");
      console.error("[create-ai] Error type:", error?.constructor?.name);
      console.error("[create-ai] Error message:", error?.message);
      console.error("[create-ai] Error stack:", error?.stack);
      return NextResponse.json(
        {
          error: "Failed to process request with AI. Please try again.",
          details: error.message,
        },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Geocode all locations
    console.log("[create-ai] Step 15: Starting geocoding");
    const locationNames = parsedItinerary.locations.map((loc) => loc.name);
    console.log("[create-ai] Locations to geocode:", locationNames);
    const geocodeResults = await geocodeMultipleLocations(locationNames);
    console.log("[create-ai] Geocoding completed");
    console.log("[create-ai] Geocoded results count:", geocodeResults.length);

    // Filter out locations that couldn't be geocoded
    console.log("[create-ai] Step 16: Filtering valid locations");
    const validLocations: Array<{
      location: ItineraryLocation;
      geocode: GeocodeResult;
    }> = [];

    for (let i = 0; i < parsedItinerary.locations.length; i++) {
      const location = parsedItinerary.locations[i];
      const geocode = geocodeResults[i];

      if (geocode) {
        validLocations.push({
          location,
          geocode,
        });
        console.log(`[create-ai] ✓ Geocoded: ${location.name} -> (${geocode.latitude}, ${geocode.longitude})`);
      } else {
        console.warn(`[create-ai] ✗ Failed to geocode location: ${location.name}`);
      }
    }

    console.log("[create-ai] Valid locations count:", validLocations.length);

    if (validLocations.length === 0) {
      console.error("[create-ai] ERROR: No valid locations after geocoding");
      return NextResponse.json(
        {
          error: "Could not find coordinates for any locations. Please be more specific with location names.",
        },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Create draft itinerary and pins in database (private)
    console.log("[create-ai] Step 17: Creating draft in DB");
    const itineraryId = uuidv4();
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .insert({
        id: itineraryId,
        title: parsedItinerary.title,
        description: parsedItinerary.description || null,
        created_by: user.id,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (itineraryError || !itinerary) {
      console.error("[create-ai] ERROR: Failed to create draft itinerary", itineraryError);
      return NextResponse.json(
        { error: itineraryError?.message || 'Failed to create draft itinerary' },
        { status: 500 }
      );
    }

    const pinsToInsert = validLocations.map(({ location, geocode }, index) => {
      const pinType = mapPinType(location.type);
      const pinIcon = mapPinIcon(pinType);

      let description = location.description || "";
      if (location.activities && location.activities.length > 0) {
        description += `\n\nActivities: ${location.activities.join(", ")}`;
      }
      if (location.tips && location.tips.length > 0) {
        description += `\n\nTips: ${location.tips.join(" ")}`;
      }

      return {
        id: uuidv4(),
        itinerary_id: (itinerary as any).id,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        title: location.name,
        description: description.trim() || null,
        type: pinType,
        icon: pinIcon,
        order_index: index,
        day: location.day || null,
        date: null,
        created_by: user.id,
        google_place_id: geocode.placeId || null,
        meta_json: {
          placeName: geocode.placeName,
          placeId: geocode.placeId,
          activities: location.activities || [],
          tips: location.tips || [],
          aiGenerated: true,
        },
        photos: [],
        videos: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    });

    const { error: pinsError } = await supabase
      .from('itinerary_pins')
      .insert(pinsToInsert as any);

    if (pinsError) {
      console.error("[create-ai] ERROR: Failed to create draft pins", pinsError);
      // Try to cleanup itinerary
      await supabase.from('itineraries').delete().eq('id', (itinerary as any).id);
      return NextResponse.json(
        { error: pinsError.message || 'Failed to create draft pins' },
        { status: 500 }
      );
    }

    console.log("[create-ai] Draft created with ID:", (itinerary as any).id);
    
    // Also return prefill data for manual page
    const formattedPins = pinsToInsert.map((p: any) => ({
      lngLat: [p.longitude, p.latitude] as [number, number],
      title: p.title,
      description: p.description || "",
      type: p.type,
      icon: p.icon,
      orderIndex: p.order_index,
      day: p.day || undefined,
      meta: p.meta_json,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          draftId: (itinerary as any).id,
          title: (itinerary as any).title,
          description: (itinerary as any).description,
          isPublic: false,
          pins: formattedPins,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Log the full error for debugging
    console.error("[create-ai] Unhandled error:", error);
    console.error("[create-ai] Error stack:", error?.stack);
    console.error("[create-ai] Error name:", error?.name);
    console.error("[create-ai] Error message:", error?.message);
    
    // Ensure we always return JSON, never HTML
    const errorMessage = error?.message || "Unknown server error";
    const errorDetails = process.env.NODE_ENV === "development" 
      ? {
          message: errorMessage,
          stack: error?.stack,
          name: error?.name,
          type: error?.constructor?.name,
        }
      : { message: errorMessage };

    try {
      return NextResponse.json(
        {
          error: errorMessage,
          ...errorDetails,
        },
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (jsonError: any) {
      // If even JSON creation fails, return a simple text response
      console.error("[create-ai] Failed to create JSON response:", jsonError);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }
}

// Mark as dynamic route to prevent static optimization
export const dynamic = 'force-dynamic';

