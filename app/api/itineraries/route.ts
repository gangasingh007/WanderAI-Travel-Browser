import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get limit from query params (optional)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    // Fetch user's itineraries
    let query = supabase
      .from('itineraries')
      .select('id, title, description, thumbnail, created_at, updated_at')
      .eq('created_by', user.id)
      .order('updated_at', { ascending: false });

    if (limitNumber && limitNumber > 0) {
      query = query.limit(limitNumber);
    }

    const { data: itineraries, error } = await query;

    if (error) throw error;

    return NextResponse.json(itineraries || []);

  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return new NextResponse("An error occurred.", { status: 500 });
  }
}
