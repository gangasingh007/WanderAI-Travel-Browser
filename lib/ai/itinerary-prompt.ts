/**
 * AI Prompt Engineering for Itinerary Generation
 * Structured prompts for Groq to extract itinerary information
 */

export interface ItineraryLocation {
  name: string;
  type: "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN";
  description?: string;
  day?: number;
  order?: number;
  activities?: string[];
  tips?: string[];
}

export interface ParsedItinerary {
  title: string;
  description: string;
  locations: ItineraryLocation[];
  duration?: number; // in days
  budget?: string;
  season?: string;
}

/**
 * Create a system prompt for itinerary generation
 */
export function createItinerarySystemPrompt(): string {
  return `You are Wander AI, an expert travel planning assistant specialized in creating detailed, practical travel itineraries for India and other destinations.

Your task is to analyze user travel requests and extract structured itinerary information. You must respond ONLY with valid JSON in the following format:

{
  "title": "A descriptive title for the itinerary (e.g., '5-Day Kerala Backwaters Adventure')",
  "description": "A comprehensive description of the trip (2-3 sentences)",
  "duration": number (in days),
  "locations": [
    {
      "name": "Exact location name as it would appear on a map",
      "type": "HOTEL" | "FOOD" | "ATTRACTION" | "CUSTOM" | "CAR" | "PIN",
      "description": "Detailed description of what to do/see here (2-3 sentences)",
      "day": number (which day of the trip, starting from 1),
      "order": number (order within the day, starting from 1),
      "activities": ["activity 1", "activity 2"],
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "budget": "Budget range or notes (e.g., 'Budget-friendly', 'Mid-range', 'Luxury')",
  "season": "Best season to visit (if mentioned)"
}

IMPORTANT RULES:
1. Extract ALL locations mentioned in the user's request
2. Use exact location names that would work in geocoding (e.g., "Munnar, Kerala" not just "Munnar")
3. Assign appropriate types: HOTEL for accommodations, FOOD for restaurants, ATTRACTION for places to visit, CUSTOM for others
4. Order locations logically by day and sequence
5. Include rich descriptions and activities for each location
6. If duration is not specified, infer from the number of locations
7. Always return valid JSON - no markdown, no code blocks, just pure JSON
8. Ensure all locations have proper names that can be geocoded
9. Include at least 2-3 activities per location if possible
10. Add helpful tips for each location when relevant`;
}

/**
 * Create a user prompt for itinerary extraction
 */
export function createItineraryUserPrompt(userInput: string): string {
  return `Analyze this travel request and create a detailed itinerary:

"${userInput}"

Extract all locations, activities, timeline, and travel details. Return the structured itinerary as JSON.`;
}

/**
 * Parse AI response to extract JSON
 */
export function parseAIResponse(response: string): ParsedItinerary | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned) as ParsedItinerary;

    // Validate structure
    if (!parsed.title || !parsed.locations || !Array.isArray(parsed.locations)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}

