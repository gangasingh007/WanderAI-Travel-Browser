import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeMultipleLocations, type GeocodeResult } from "@/lib/geocoding";
import { v4 as uuidv4 } from 'uuid';

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

type ItineraryLocation = {
  name: string;
  type: string;
  description?: string;
  day?: number;
  activities?: string[];
  tips?: string[];
  timeOfDay?: string;
};

type ParsedItinerary = {
  title: string;
  description: string;
  duration?: string;
  startingLocation?: string;
  destination?: string;
  locations: ItineraryLocation[];
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Enhanced system prompt with focus on destination proximity
 */
function createEnhancedSystemPrompt(): string {
  return `You are WanderAI, an expert travel itinerary planning assistant with deep knowledge of geography and travel destinations worldwide.

YOUR MAIN TASK:
1. Extract the STARTING LOCATION (where the trip begins)
2. Extract the PRIMARY DESTINATION (the main focus of the trip)
3. Include ONLY locations that are close to the PRIMARY DESTINATION
4. Create a concentrated, day-by-day itinerary with specific locations
5. Exclude locations that are far from the primary destination

CRITICAL - LOCATION PROXIMITY RULES:
- ALL locations (except Day 1 starting point) should be within 50-100 km of the primary destination
- Focus on the PRIMARY DESTINATION AREA, not on the route/transit
- If traveling multi-city (e.g., Ludhiana to Shimla), only include Shimla attractions, not Chandigarh
- STARTING LOCATION goes on Day 1 as departure point
- Days 2-3+ focus ONLY on PRIMARY DESTINATION attractions
- Include nearby attractions within the destination region

CRITICAL LOCATION NAMING RULES:
1. ALWAYS include the full, geocodable location name with city, state, and country
2. Format: "Landmark/Place Name, City, State/Region, Country"
   Examples:
   - "Central Bus Stand, Ludhiana, Punjab, India" (ONLY for Day 1 - starting point)
   - "The Ridge, Shimla, Himachal Pradesh, India" (destination attraction)
   - "Christ Church, Shimla, Himachal Pradesh, India" (destination attraction)
   - "Jakhoo Temple, Shimla, Himachal Pradesh, India" (destination attraction)
3. For Indian locations: ALWAYS include state
4. NEVER include cities that are just "on the way" - focus on destination
5. Make sure all attractions are in or very close to the PRIMARY DESTINATION
6. Validate that locations are real, existing places

LOCATION TYPES (choose one):
- PIN: Starting point (Day 1 only), main destination entry point
- CAR: Car rental, transportation hubs AT destination
- HOTEL: Hotels and accommodations IN destination
- FOOD: Restaurants, cafes, food experiences IN destination
- ATTRACTION: Museums, monuments, parks, viewpoints IN destination, within 50km of destination
- CUSTOM: Other points of interest IN destination

IDEAL STRUCTURE FOR 4-DAY TRIP FROM LUDHIANA TO SHIMLA:
Day 1: "Central Bus Stand, Ludhiana, Punjab, India" (PIN - starting point only)
Day 2: 3-4 Shimla attractions (ATTRACTION/HOTEL/FOOD)
Day 3: 3-4 Shimla attractions (ATTRACTION/FOOD/CUSTOM)
Day 4: 2-3 Shimla attractions (ATTRACTION/CUSTOM)

DO NOT INCLUDE: Chandigarh, Narkanda, Kalka, or any other transit city attractions
ONLY INCLUDE: Shimla and immediate surroundings

STRUCTURE YOUR RESPONSE AS VALID JSON:
{
  "title": "Clear, descriptive trip title",
  "description": "2-3 sentence overview focusing on the destination",
  "duration": "X days",
  "startingLocation": "Starting City, State, Country",
  "destination": "Primary Destination City, State, Country",
  "locations": [
    {
      "name": "Starting Point, City, State, Country",
      "type": "PIN",
      "description": "Departure point from starting location",
      "day": 1,
      "activities": ["Depart", "Begin journey"],
      "tips": ["Start early"],
      "timeOfDay": "morning"
    },
    {
      "name": "Attraction Name, Primary Destination City, State, Country",
      "type": "ATTRACTION",
      "description": "Must-visit in the destination",
      "day": 2,
      "activities": ["Explore", "Take photos"],
      "tips": ["Best in morning"],
      "timeOfDay": "morning"
    },
    {
      "name": "Hotel/Restaurant Name, Primary Destination City, State, Country",
      "type": "HOTEL",
      "description": "Stay or dining in destination",
      "day": 2,
      "activities": ["Check-in", "Relax"],
      "tips": ["Advance booking recommended"],
      "timeOfDay": "evening"
    }
  ]
}

QUALITY CHECKLIST:
✓ FIRST location is ONLY the starting point (Day 1)
✓ ALL other locations are IN or NEAR the PRIMARY DESTINATION
✓ All locations within 50-100km of destination
✓ No transit/route cities included (no Chandigarh, Kalka, etc.)
✓ Each day has 2-4 attractions/locations
✓ Day numbers match trip duration
✓ Focus is 80%+ on primary destination
✓ Only starting point is from starting location
✓ All locations properly formatted with city, state, country
✓ Minimum 5+ total locations (1 start + 4+ destination)

Return ONLY the JSON object, no markdown formatting or explanations.`;
}

/**
 * Create user prompt emphasizing destination focus
 */
function createUserPrompt(travelRequest: string): string {
  return `Create a detailed travel itinerary based on this request:

"${travelRequest}"

CRITICAL INSTRUCTIONS FOR OPTIMIZATION:
1. EXTRACT starting location and primary destination clearly
2. Day 1: Include ONLY the starting point as departure
3. Days 2+: Focus ONLY on the PRIMARY DESTINATION area
4. EXCLUDE any intermediate/transit cities
5. All attractions should be IN or within 50km of primary destination
6. Use FULL location names with city, state, country

EXAMPLE - "4 day trip from Ludhiana to Shimla":
STARTING: Ludhiana, Punjab, India
DESTINATION: Shimla, Himachal Pradesh, India
INCLUDE: Central Bus Stand (Ludhiana - Day 1 only), then 12+ Shimla attractions
EXCLUDE: Chandigarh, Narkanda, Kalka - these are just "on the way"

LOCATIONS FORMAT:
- Day 1: "Central Bus Stand, Ludhiana, Punjab, India" (departure)
- Day 2-4: Only Shimla attractions like:
  - "The Ridge, Shimla, Himachal Pradesh, India"
  - "Christ Church, Shimla, Himachal Pradesh, India"
  - "Oberoi Cecil Hotel, Shimla, Himachal Pradesh, India"
  - "Kufri Fun World, Shimla, Himachal Pradesh, India"
  - "Jakhoo Temple, Shimla, Himachal Pradesh, India"
  - "Mall Road, Shimla, Himachal Pradesh, India"

Return ONLY valid JSON with destination-focused locations.`;
}

/**
 * Parse and validate AI response
 */
function parseAIResponse(response: string): ParsedItinerary | null {
  try {
    let cleanResponse = response
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '');

    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      //@ts-ignore
      cleanResponse = jsonMatch;
    }

    const parsed = JSON.parse(cleanResponse);

    if (!parsed.title || typeof parsed.title !== 'string') {
      console.error('[create-ai] Missing or invalid title');
      return null;
    }

    if (!Array.isArray(parsed.locations) || parsed.locations.length === 0) {
      console.error('[create-ai] Missing or empty locations array');
      return null;
    }

    if (!parsed.startingLocation || typeof parsed.startingLocation !== 'string') {
      console.warn('[create-ai] Missing startingLocation');
      parsed.startingLocation = parsed.locations?.name || 'Unknown';
    }

    if (!parsed.destination || typeof parsed.destination !== 'string') {
      console.warn('[create-ai] Missing destination');
      parsed.destination = parsed.locations[parsed.locations.length - 1]?.name || 'Unknown';
    }

    const validLocations = parsed.locations.filter((loc: any) => {
      if (!loc.name || typeof loc.name !== 'string' || loc.name.trim().length === 0) {
        console.warn('[create-ai] Invalid location name:', loc);
        return false;
      }
      if (!loc.type || typeof loc.type !== 'string') {
        console.warn('[create-ai] Invalid location type:', loc);
        return false;
      }
      return true;
    });

    if (validLocations.length === 0) {
      console.error('[create-ai] No valid locations after filtering');
      return null;
    }

    return {
      title: parsed.title,
      description: parsed.description || '',
      duration: parsed.duration || undefined,
      startingLocation: parsed.startingLocation,
      destination: parsed.destination,
      locations: validLocations,
    };
  } catch (error) {
    console.error('[create-ai] Failed to parse AI response:', error);
    console.error('[create-ai] Response was:', response.substring(0, 500));
    return null;
  }
}

/**
 * Map location type from AI to database enum
 */
function mapPinType(type: string): "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN" {
  const upperType = type.toUpperCase();
  const validTypes = ["HOTEL", "FOOD", "ATTRACTION", "CUSTOM", "CAR", "PIN"];
  return validTypes.includes(upperType) ? (upperType as any) : "CUSTOM";
}

/**
 * Map location type to icon
 */
function mapPinIcon(type: "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN"): "PIN" | "CAR" | "HOTEL" | "FOOD" | "ATTRACTION" {
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

/**
 * Validate location name quality
 */
function isLocationNameValid(name: string): boolean {
  const parts = name.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length < 2) {
    console.warn(`[create-ai] Location name too vague: "${name}"`);
    return false;
  }
  
  const veryGenericTerms = ['nearby', 'local area'];
  const lowerName = name.toLowerCase();
  for (const term of veryGenericTerms) {
    if (lowerName.includes(term)) {
      console.warn(`[create-ai] Location too generic: "${name}"`);
      return false;
    }
  }
  
  return true;
}

/**
 * Ensure starting location is in the locations array
 */
function ensureStartingLocationInLocations(
  parsedItinerary: ParsedItinerary,
  validLocations: ItineraryLocation[]
): ItineraryLocation[] {
  const startingLoc = parsedItinerary.startingLocation?.toLowerCase().trim() || '';
  
  const hasStarting = validLocations.some(loc => 
    // @ts-ignore
    loc.name.toLowerCase().includes(startingLoc.split(',')) && loc.day === 1
  );
  
  if (!hasStarting && startingLoc) {
    console.warn(`[create-ai] Starting location not found, adding it`);
    
    const startingEntry: ItineraryLocation = {
      // @ts-ignore
      name: parsedItinerary.startingLocation,
      type: 'PIN',
      description: `Starting point of your journey to ${parsedItinerary.destination}`,
      day: 1,
      activities: ['Depart', 'Begin your journey'],
      tips: ['Start early for the best journey', 'Pack essentials'],
      timeOfDay: 'morning',
    };
    
    return [startingEntry, ...validLocations];
  }
  
  return validLocations;
}

/**
 * Filter locations by proximity to destination
 */
function filterLocationsByProximity(
  locations: Array<{
    location: ItineraryLocation;
    geocode: GeocodeResult;
  }>,
  destinationGeocode: GeocodeResult,
  maxDistanceKm: number = 100
): Array<{
  location: ItineraryLocation;
  geocode: GeocodeResult;
}> {
  console.log(`[create-ai] Filtering locations within ${maxDistanceKm}km of destination (${destinationGeocode.latitude}, ${destinationGeocode.longitude})`);
  
  const filtered = locations.filter(({ location, geocode }) => {
    // Always keep Day 1 starting point
    if (location.day === 1) {
      console.log(`[create-ai] ✓ Keeping Day 1 starting point: ${location.name}`);
      return true;
    }
    
    const distance = calculateDistance(
      destinationGeocode.latitude,
      destinationGeocode.longitude,
      geocode.latitude,
      geocode.longitude
    );
    
    console.log(`[create-ai] Distance to "${location.name}": ${distance.toFixed(2)}km`);
    
    if (distance <= maxDistanceKm) {
      console.log(`[create-ai] ✓ Within range: ${location.name}`);
      return true;
    } else {
      console.log(`[create-ai] ✗ Too far (${distance.toFixed(2)}km > ${maxDistanceKm}km): ${location.name}`);
      return false;
    }
  });
  
  return filtered;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  // ...logs removed...
  
  try {
    // Step 1: Validate environment
  // ...logs removed...
    if (!process.env.GROQ_API_KEY) {
      console.error("[create-ai] GROQ_API_KEY is missing");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("[create-ai] MAPBOX_TOKEN is missing");
      return NextResponse.json(
        { error: "Map service not configured. Please contact support." },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Parse request body
  // ...logs removed...
    let body: CreateAIItineraryRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[create-ai] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid request format. Please send valid JSON." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 3: Authenticate user
  // ...logs removed...
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("[create-ai] Authentication failed:", authError);
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

  // ...logs removed...

    // Step 4: Validate input
  // ...logs removed...
    const { prompt, videoLink, isPublic = false } = body;
    
    if (videoLink) {
      return NextResponse.json(
        { error: "Video processing not yet available. Please use text prompt." },
        { status: 501, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Please provide a travel description to generate your itinerary." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

  // ...logs removed...

    // Step 5: Generate itinerary with AI
  // ...logs removed...
    const groq = await getGroqClient();
    
    let aiResponse: string;
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: createEnhancedSystemPrompt() },
          { role: "user", content: createUserPrompt(prompt) },
        ],
        temperature: 0.5, // Lower for more focused results
        max_tokens: 4096,
      });

      if (!completion?.choices?.[0]?.message?.content) {
        throw new Error("AI returned empty response - no content in message");
      }

      aiResponse = completion.choices[0].message.content;
      
      if (typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
        throw new Error("AI response is empty or not a string");
      }

  // ...logs removed...

    } catch (aiError: any) {
      console.error("[create-ai] AI API error:", aiError?.message);
      
      if (aiError?.message?.includes('401') || aiError?.message?.includes('Unauthorized')) {
        return NextResponse.json(
          { error: "AI service authentication failed. Please verify your GROQ_API_KEY." },
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (aiError?.message?.includes('429') || aiError?.message?.includes('rate')) {
        return NextResponse.json(
          { error: "AI service rate limit reached. Please try again in a moment." },
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (aiError?.message?.includes('timeout')) {
        return NextResponse.json(
          { error: "AI service request timed out. Please try again." },
          { status: 504, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to generate itinerary: ${aiError?.message}` },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 6: Parse AI response
  // ...logs removed...
    const parsedItinerary = parseAIResponse(aiResponse);

    if (!parsedItinerary) {
      console.error("[create-ai] Failed to parse AI response");
      return NextResponse.json(
        {
          error: "AI couldn't generate a valid itinerary. Please try rephrasing your request.",
          hint: "Include starting location, destination, and trip duration for better results.",
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

  // ...logs removed...

    // Step 7: Filter locations with valid names
  // ...logs removed...
    let validNamedLocations = parsedItinerary.locations.filter(loc => 
      isLocationNameValid(loc.name)
    );

    validNamedLocations = ensureStartingLocationInLocations(parsedItinerary, validNamedLocations);
  // ...logs removed...

    if (validNamedLocations.length === 0) {
      return NextResponse.json(
        {
          error: "Could not extract specific locations from your request.",
          example: "Try: 'Plan a 4-day trip from Ludhiana to Shimla'",
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 8: Geocode locations
  // ...logs removed...
    const locationNames = validNamedLocations.map(loc => loc.name);
    const geocodeResults = await geocodeMultipleLocations(locationNames);

    // Step 9: Match locations with geocode results
  // ...logs removed...
    const allValidLocations: Array<{
      location: ItineraryLocation;
      geocode: GeocodeResult;
    }> = [];

    for (let i = 0; i < validNamedLocations.length; i++) {
      const location = validNamedLocations[i];
      const geocode = geocodeResults[i];

      if (geocode && geocode.latitude && geocode.longitude) {
        allValidLocations.push({ location, geocode });
  // ...logs removed...
      } else {
  // ...logs removed...
      }
    }

  // ...logs removed...

    if (allValidLocations.length === 0) {
      return NextResponse.json(
        {
          error: "Couldn't find any locations on the map.",
          example: "Try being more specific with place names and cities.",
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 10: Filter by proximity to destination
    // Step 10: Filter by proximity to destination
    // ...logs removed...
    const destinationCity = parsedItinerary.destination
      ? parsedItinerary.destination.split(',')[0].trim().toLowerCase()
      : '';

    let destinationGeocode: GeocodeResult | null = null;

    for (let i = 0; i < validNamedLocations.length; i++) {
      const locationName = validNamedLocations[i].name.toLowerCase();
      if (locationName.includes(destinationCity)) {
        destinationGeocode = allValidLocations[i]?.geocode || null;
        break;
      }
    }

    if (!destinationGeocode && allValidLocations.length > 0) {
      destinationGeocode = allValidLocations[allValidLocations.length - 1].geocode;
    }

    if (!destinationGeocode) {
      return NextResponse.json(
        { error: "Could not identify the destination location." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let validLocationsFiltered = filterLocationsByProximity(allValidLocations, destinationGeocode, 100);

    if (validLocationsFiltered.length < 2) {
      validLocationsFiltered = filterLocationsByProximity(allValidLocations, destinationGeocode, 200);
    }

    if (validLocationsFiltered.length < 2) {
      validLocationsFiltered = filterLocationsByProximity(allValidLocations, destinationGeocode, 500);
    }

    const validLocations = validLocationsFiltered;

if (validLocations.length === 0) {
  return NextResponse.json(
    {
      error: "No valid destinations found within range of your target location.",
    },
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}


    // Step 11: Create itinerary in database
  // ...logs removed...
    const itineraryId = uuidv4();
    
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .insert({
        id: itineraryId,
        title: parsedItinerary.title,
        description: parsedItinerary.description || `AI-generated itinerary from ${parsedItinerary.startingLocation} to ${parsedItinerary.destination}`,
        created_by: user.id,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (itineraryError || !itinerary) {
    // ...logs removed...
      return NextResponse.json(
        { error: "Failed to save itinerary. Please try again." },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 12: Create pins
  // ...logs removed...
    const pinsToInsert = validLocations.map(({ location, geocode }, index) => {
      const pinType = mapPinType(location.type);
      const pinIcon = mapPinIcon(pinType);

      let description = location.description || "";
      if (location.activities && location.activities.length > 0) {
        description += `\n\n🎯 Activities:\n${location.activities.map(a => `-  ${a}`).join('\n')}`;
      }
      if (location.tips && location.tips.length > 0) {
        description += `\n\n💡 Tips:\n${location.tips.map(t => `-  ${t}`).join('\n')}`;
      }
      if (location.timeOfDay) {
        description += `\n\n⏰ Best time: ${location.timeOfDay}`;
      }

      return {
        id: uuidv4(),
        itinerary_id: itineraryId,
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
          timeOfDay: location.timeOfDay || null,
          aiGenerated: true,
          distanceFromDestination: calculateDistance(
            destinationGeocode.latitude,
            destinationGeocode.longitude,
            geocode.latitude,
            geocode.longitude
          ),
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
    // ...logs removed...
      await supabase.from('itineraries').delete().eq('id', itineraryId);
      return NextResponse.json(
        { error: "Failed to save locations. Please try again." },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 13: Format response
  // ...logs removed...
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

    const duration = Date.now() - startTime;
  // ...logs removed...

    return NextResponse.json(
      {
        success: true,
        data: {
          draftId: itineraryId,
          title: parsedItinerary.title,
          description: parsedItinerary.description,
          duration: parsedItinerary.duration,
          startingLocation: parsedItinerary.startingLocation,
          destination: parsedItinerary.destination,
          isPublic: false,
          pins: formattedPins,
          stats: {
            totalLocations: validLocations.length,
            processingTimeMs: duration,
            destinationCoordinates: {
              lat: destinationGeocode.latitude,
              lon: destinationGeocode.longitude,
            },
          },
        },
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
  // ...logs removed...
    
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred. Please try again.",
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            message: error?.message,
            type: error?.constructor?.name,
          },
        }),
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const dynamic = 'force-dynamic';
