import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId, fetchYouTubeMetadata } from "@/lib/video/youtube";
import Groq from "groq-sdk";
import { geocodeMultipleLocations, type GeocodeResult } from "@/lib/geocoding";
import { v4 as uuidv4 } from 'uuid';

function mapPinType(type: string) {
  const upper = (type || '').toUpperCase();
  const valid = ["HOTEL","FOOD","ATTRACTION","CUSTOM","CAR","PIN"] as const;
  return (valid as readonly string[]).includes(upper) ? upper : "CUSTOM";
}
function mapPinIcon(type: string) {
  const iconMap: Record<string, "PIN"|"CAR"|"HOTEL"|"FOOD"|"ATTRACTION"> = {
    HOTEL:"HOTEL", FOOD:"FOOD", ATTRACTION:"ATTRACTION", CUSTOM:"PIN", CAR:"CAR", PIN:"PIN"
  };
  return iconMap[(type || 'PIN').toUpperCase()] || "PIN";
}

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_MAPBOX_TOKEN" }, { status: 500 });
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const url: string | undefined = body?.videoUrl || body?.videoLink;
    if (!url || !url.trim()) return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });

    // Determine platform; MVP supports YouTube
    const ytId = extractYouTubeId(url);
    if (!ytId) {
      return NextResponse.json({ error: "Only YouTube links are supported in MVP" }, { status: 400 });
    }

    // Fetch video metadata (title, description, tags)
    const meta = await fetchYouTubeMetadata(ytId);
    if (!meta) {
      return NextResponse.json({ error: "Failed to fetch YouTube metadata. Configure YOUTUBE_API_KEY." }, { status: 500 });
    }

    // Build AI context from metadata
    const contextText = `Title: ${meta.title}\nChannel: ${meta.channelTitle}\nTags: ${(meta.tags||[]).join(', ')}\nDescription:\n${meta.description}`;

    // Ask Groq to extract itinerary JSON
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are Wander AI. Extract a structured travel itinerary as pure JSON from the given video context. Use precise geocodable names. The JSON must include title, description, and an array 'locations' where each location has name, type (HOTEL|FOOD|ATTRACTION|CUSTOM|CAR|PIN), optional description, optional day and order, optional activities and tips." },
        { role: "user", content: `Analyze this YouTube video context to extract the itinerary. Return ONLY JSON.\n\n${contextText}` }
      ],
      temperature: 0.6,
    });
    let aiResponse = completion.choices?.[0]?.message?.content || "";
    // Strip code fences if present
    aiResponse = aiResponse.trim().replace(/^```json\s*/i, '').replace(/```\s*$/,'');
    let parsed: any;
    try { parsed = JSON.parse(aiResponse); } catch {
      const match = aiResponse.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: "AI did not return valid JSON" }, { status: 500 });
      parsed = JSON.parse(match[0]);
    }
    if (!parsed?.locations || !Array.isArray(parsed.locations)) {
      return NextResponse.json({ error: "AI response missing locations" }, { status: 500 });
    }

    // Geocode
    const names: string[] = parsed.locations.map((l: any) => l.name);
    const geocoded = await geocodeMultipleLocations(names);
    const valid: Array<{ loc: any; geo: GeocodeResult }> = [];
    parsed.locations.forEach((loc: any, i: number) => {
      const geo = geocoded[i];
      if (geo) valid.push({ loc, geo });
    });
    if (valid.length === 0) return NextResponse.json({ error: "Failed to geocode any locations" }, { status: 400 });

    // Create draft itinerary
    const itineraryId = uuidv4();
    const { data: itin, error: itinErr } = await supabase
      .from('itineraries')
      .insert({
        id: itineraryId,
        title: parsed.title || meta.title || 'Untitled',
        description: parsed.description || meta.description || null,
        created_by: user.id,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select().single();
    if (itinErr || !itin) return NextResponse.json({ error: itinErr?.message || 'Failed creating draft' }, { status: 500 });

    const pinsToInsert = valid.map(({ loc, geo }, index) => {
      const pinType = mapPinType(loc.type);
      const pinIcon = mapPinIcon(pinType);
      let description = loc.description || '';
      if (loc.activities?.length) description += `\n\nActivities: ${loc.activities.join(', ')}`;
      if (loc.tips?.length) description += `\n\nTips: ${loc.tips.join(' ')}`;
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
        meta_json: { placeName: geo.placeName, activities: loc.activities || [], tips: loc.tips || [], aiGenerated: true },
        photos: [],
        videos: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    });
    const { error: pinsErr } = await supabase.from('itinerary_pins').insert(pinsToInsert as any);
    if (pinsErr) {
      await supabase.from('itineraries').delete().eq('id', itineraryId);
      return NextResponse.json({ error: pinsErr.message }, { status: 500 });
    }

    // Return draft and prefill data
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
        title: (itin as any).title,
        description: (itin as any).description,
        isPublic: false,
        pins: formattedPins,
      }
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}


