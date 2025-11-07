import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params (Next.js 15+ pattern)
    const params = await context.params;
    let itineraryId = params?.id;
    if (!itineraryId) {
      try {
        const url = new URL(request.url);
        const parts = url.pathname.split("/").filter(Boolean);
        itineraryId = parts[parts.length - 1];
      } catch {}
    }

    if (!itineraryId) {
      return NextResponse.json({ error: 'Missing itinerary id' }, { status: 400 });
    }

    // Fetch itinerary
    const { data: itinerary, error: itinError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', itineraryId)
      .single();

    if (itinError || !itinerary) {
      return NextResponse.json({ error: itinError?.message || 'Itinerary not found' }, { status: 404 });
    }

    // Ensure the requester is the owner
    if ((itinerary as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch pins
    const { data: pins, error: pinsError } = await supabase
      .from('itinerary_pins')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('order_index', { ascending: true });

    if (pinsError) {
      return NextResponse.json({ error: pinsError.message }, { status: 500 });
    }

    // Shape for manual editor
    const formattedPins = (pins || []).map((p: any) => ({
      lngLat: [p.longitude, p.latitude] as [number, number],
      title: p.title || '',
      description: p.description || '',
      type: p.type || 'PIN',
      icon: p.icon || 'PIN',
      orderIndex: p.order_index ?? 0,
      day: p.day ?? undefined,
      meta: p.meta_json || {},
      id: p.id,
    }));

    return NextResponse.json({
      id: (itinerary as any).id,
      title: (itinerary as any).title || '',
      description: (itinerary as any).description || '',
      isPublic: !!(itinerary as any).is_public,
      pins: formattedPins,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}


