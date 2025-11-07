/**
 * Geocoding utility using Mapbox Geocoding API
 * Converts location names to coordinates for itinerary pins
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeName: string;
  placeId?: string;
  context?: string[];
}

export interface GeocodeOptions {
  country?: string;
  limit?: number;
  bbox?: string; // Format: "minLng,minLat,maxLng,maxLat"
}

/**
 * Geocode a location name to get coordinates
 * @param locationName - The name of the location to geocode
 * @param options - Optional geocoding parameters
 * @returns GeocodeResult or null if not found
 */
export async function geocodeLocation(
  locationName: string,
  options: GeocodeOptions = {}
): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error("Mapbox token not found");
    return null;
  }

  const { country = "in", limit = 1, bbox } = options;

  try {
    // Focus on India by default (bbox: [68.1766451354, 6.4626995853, 97.4025614766, 35.5087008017])
    const defaultBbox = "68.1766451354,6.4626995853,97.4025614766,35.5087008017";
    const bboxParam = bbox || defaultBbox;

    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json`
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", country);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("bbox", bboxParam);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Geocoding failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const features = data.features;

    if (!features || features.length === 0) {
      return null;
    }

    const feature = features[0];
    const [longitude, latitude] = feature.center;

    return {
      latitude,
      longitude,
      placeName: feature.place_name || feature.text,
      placeId: feature.id,
      context: feature.context
        ? feature.context.map((ctx: any) => ctx.text || "").filter(Boolean)
        : [],
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Geocode multiple locations in parallel
 * @param locationNames - Array of location names to geocode
 * @param options - Optional geocoding parameters
 * @returns Array of GeocodeResult (null for failed geocodes)
 */
export async function geocodeMultipleLocations(
  locationNames: string[],
  options: GeocodeOptions = {}
): Promise<(GeocodeResult | null)[]> {
  const results = await Promise.all(
    locationNames.map((name) => geocodeLocation(name, options))
  );
  return results;
}

