import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId, fetchYouTubeMetadata } from "@/lib/video/youtube";
import Groq from "groq-sdk";
import { geocodeMultipleLocations, type GeocodeResult } from "@/lib/geocoding";
import { v4 as uuidv4 } from 'uuid';

function mapPinType(type: string): "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN" {
  const upper = (type || '').toUpperCase();
  const validTypes = ["HOTEL", "FOOD", "ATTRACTION", "CUSTOM", "CAR", "PIN"] as const;
  return (validTypes as readonly string[]).includes(upper as any) 
    ? (upper as any) 
    : "CUSTOM";
}

function mapPinIcon(type: string): "PIN" | "CAR" | "HOTEL" | "FOOD" | "ATTRACTION" {
  const iconMap: Record<string, "PIN" | "CAR" | "HOTEL" | "FOOD" | "ATTRACTION"> = {
    HOTEL: "HOTEL",
    FOOD: "FOOD",
    ATTRACTION: "ATTRACTION",
    CUSTOM: "PIN",
    CAR: "CAR",
    PIN: "PIN"
  };
  return iconMap[(type || 'PIN').toUpperCase()] || "PIN";
}

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Enhanced prompt for better AI extraction
const SYSTEM_PROMPT = `You are WanderAI, an expert travel itinerary extraction assistant. 

Your task is to analyze YouTube video metadata and extract a precise, structured travel itinerary.

IMPORTANT RULES:
1. Extract ONLY actual locations mentioned in the video (not generic descriptions)
2. Use complete, geocodable location names (e.g., "Eiffel Tower, Paris, France" not just "Eiffel Tower")
3. Include city and country for better geocoding accuracy
4. Categorize each location correctly as: HOTEL, FOOD, ATTRACTION, CUSTOM, CAR, or PIN
5. Extract day-by-day structure if mentioned
6. Include specific activities and tips mentioned in the video
7. Return ONLY valid JSON, no markdown or explanations

JSON Structure:
{
  "title": "Clear, descriptive title of the trip",
  "description": "Brief summary of the itinerary (2-3 sentences)",
  "duration": "Number of days if mentioned",
  "locations": [
    {
      "name": "Full location name with city and country",
      "type": "HOTEL|FOOD|ATTRACTION|CUSTOM|CAR|PIN",
      "description": "Brief description of this location",
      "day": 1,
      "order": 0,
      "activities": ["Activity 1", "Activity 2"],
      "tips": ["Tip 1", "Tip 2"],
      "timeOfDay": "morning|afternoon|evening|night (optional)"
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_MAPBOX_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const url: string | undefined = body?.videoUrl || body?.videoLink;
    
    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: "videoUrl is required" },
        { status: 400 }
      );
    }

    // Extract YouTube video ID
    const ytId = extractYouTubeId(url);
    
    if (!ytId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a valid YouTube link." },
        { status: 400 }
      );
    }

    // Fetch video metadata
    const meta = await fetchYouTubeMetadata(ytId);
    
    if (!meta) {
      return NextResponse.json(
        { error: "Failed to fetch YouTube video data. Please ensure the video is public and the YouTube API key is configured." },
        { status: 500 }
      );
    }

    // Build comprehensive context for AI
    const contextText = `
VIDEO INFORMATION:
Title: ${meta.title}
Channel: ${meta.channelTitle}
Published: ${meta.publishedAt}
Duration: ${meta.duration || 'Unknown'}
Tags: ${(meta.tags || []).join(', ')}

DESCRIPTION:
${meta.description}

TASK: Extract a detailed travel itinerary from this video context. Focus on specific locations, activities, and practical tips mentioned.
`.trim();

    // Call Groq AI for extraction
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contextText }
      ],
      temperature: 0.5, // Lower temperature for more precise extraction
      max_tokens: 2048,
    });

    let aiResponse = completion.choices?.[0]?.message?.content || "";
    
    // Clean up AI response: remove surrounding triple-backtick fences (optionally with "json") and trim
    aiResponse = aiResponse.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI response:', aiResponse);
        return NextResponse.json(
          { error: "AI could not extract a valid itinerary from this video. The video might not contain travel information." },
          { status: 400 }
        );
      }
      // @ts-ignore-
      parsed = JSON.parse(jsonMatch);
    }

    // Validate parsed data
    if (!parsed?.locations || !Array.isArray(parsed.locations) || parsed.locations.length === 0) {
      return NextResponse.json(
        { error: "No travel locations found in this video. Please try a video that contains travel itinerary information." },
        { status: 400 }
      );
    }

    // Filter out invalid locations
    const validLocations = parsed.locations.filter((loc: any) => 
      loc?.name && typeof loc.name === 'string' && loc.name.trim().length > 0
    );

    if (validLocations.length === 0) {
      return NextResponse.json(
        { error: "No valid locations could be extracted from this video." },
        { status: 400 }
      );
    }

    // Geocode all locations
    const locationNames: string[] = validLocations.map((l: any) => l.name);
    console.log('Geocoding locations:', locationNames);
    
    const geocoded = await geocodeMultipleLocations(locationNames);
    
    // Match geocoded results with locations
    const validPins: Array<{ loc: any; geo: GeocodeResult }> = [];
    validLocations.forEach((loc: any, i: number) => {
      const geo = geocoded[i];
      if (geo && geo.latitude && geo.longitude) {
        validPins.push({ loc, geo });
      } else {
        console.warn(`Failed to geocode: ${loc.name}`);
      }
    });

    if (validPins.length === 0) {
      return NextResponse.json(
        { error: "Could not geocode any of the extracted locations. Please ensure the video mentions specific, real places." },
        { status: 400 }
      );
    }

    // Create itinerary in database
    const itineraryId = uuidv4();
    const itineraryTitle = parsed.title || meta.title || 'YouTube Travel Itinerary';
    const itineraryDescription = parsed.description || 
      `Travel itinerary extracted from: ${meta.title}` ||
      meta.description?.substring(0, 200) || 
      'AI-generated itinerary from YouTube video';

    const { data: itin, error: itinErr } = await supabase
      .from('itineraries')
      .insert({
        id: itineraryId,
        title: itineraryTitle,
        description: itineraryDescription,
        created_by: user.id,
        is_public: body.isPublic || false,
        thumbnail: meta.thumbnails?.high || meta.thumbnails?.medium || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (itinErr || !itin) {
      console.error('Failed to create itinerary:', itinErr);
      return NextResponse.json(
        { error: itinErr?.message || 'Failed to create itinerary' },
        { status: 500 }
      );
    }

    // Create pins for each location
    const pinsToInsert = validPins.map(({ loc, geo }, index) => {
      const pinType = mapPinType(loc.type);
      const pinIcon = mapPinIcon(pinType);
      
      // Build comprehensive description
      let description = loc.description || '';
      if (loc.activities?.length) {
        description += `\n\n🎯 Activities:\n${loc.activities.map((a: string) => `-  ${a}`).join('\n')}`;
      }
      if (loc.tips?.length) {
        description += `\n\n💡 Tips:\n${loc.tips.map((t: string) => `-  ${t}`).join('\n')}`;
      }
      if (loc.timeOfDay) {
        description += `\n\n⏰ Best time: ${loc.timeOfDay}`;
      }

      return {
        id: uuidv4(),
        itinerary_id: itineraryId,
        latitude: geo.latitude,
        longitude: geo.longitude,
        title: loc.name,
        description: description.trim() || null,
        type: pinType,
        icon: pinIcon,
        order_index: typeof loc.order === 'number' ? loc.order : index,
        day: typeof loc.day === 'number' ? loc.day : null,
        date: null,
        created_by: user.id,
        google_place_id: (geo as any).placeId || null,
        meta_json: {
          placeName: geo.placeName,
          activities: loc.activities || [],
          tips: loc.tips || [],
          timeOfDay: loc.timeOfDay || null,
          aiGenerated: true,
          source: 'youtube',
          videoId: ytId,
          videoTitle: meta.title,
        },
        photos: [],
        videos: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    });

    // Insert all pins
    const { error: pinsErr } = await supabase
      .from('itinerary_pins')
      .insert(pinsToInsert as any);

    if (pinsErr) {
      console.error('Failed to insert pins:', pinsErr);
      // Rollback: delete the itinerary
      await supabase.from('itineraries').delete().eq('id', itineraryId);
      return NextResponse.json(
        { error: `Failed to save locations: ${pinsErr.message}` },
        { status: 500 }
      );
    }

    // Format response
    const formattedPins = pinsToInsert.map((p: any) => ({
      lngLat: [p.longitude, p.latitude] as [number, number],
      title: p.title,
      description: p.description || '',
      type: p.type,
      icon: p.icon,
      orderIndex: p.order_index,
      day: p.day || undefined,
      meta: p.meta_json,
    }));

    return NextResponse.json({
      success: true,
      data: {
        draftId: itineraryId,
        title: itineraryTitle,
        description: itineraryDescription,
        isPublic: body.isPublic || false,
        pins: formattedPins,
        duration: parsed.duration || null,
        totalLocations: validPins.length,
        videoMetadata: {
          id: ytId,
          title: meta.title,
          channel: meta.channelTitle,
          thumbnail: meta.thumbnails?.high || meta.thumbnails?.medium,
        }
      }
    }, { status: 200 });

  } catch (e: any) {
    console.error('Server error:', e);
    return NextResponse.json(
      { error: e?.message || 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}
