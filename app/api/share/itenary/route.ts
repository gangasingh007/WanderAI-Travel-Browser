import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itineraryId } = await request.json();

    // Verify the itinerary belongs to the user
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .select('id, created_by, title, is_public')
      .eq('id', itineraryId)
      .single();

    if (itineraryError || !itinerary) {
      return new NextResponse("Itinerary not found", { status: 404 });
    }

    if ((itinerary as any).created_by !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update itinerary to be public
    const { error: updateError } = await supabase
      .from('itineraries')
      //@ts-ignore
      .update({ is_public: true } as any)
      .eq('id', itineraryId);

    if (updateError) {
      throw updateError;
    }

    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/itinerary/${itineraryId}`;

    return NextResponse.json({
      shareLink: shareableLink,
      itineraryId: itineraryId
    });

  } catch (error) {
    console.error("Error creating share link:", error);
    return new NextResponse("An error occurred.", { status: 500 });
  }
}
