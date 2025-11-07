# AI Itinerary Creation Implementation

## Overview

This document describes the implementation of AI-powered itinerary creation using Groq API. Users can provide a natural language description of their travel plans, and the system will automatically extract locations, create pins on the map, and generate a structured itinerary.

## Architecture

### Components

1. **Frontend UI** (`app/itineraries/add-itineraries/ai/page.tsx`)
   - User interface for entering prompts or video links
   - Real-time error handling and success feedback
   - Loading states with progress indicators

2. **API Route** (`app/api/itineraries/create-ai/route.ts`)
   - Processes user prompts using Groq AI
   - Extracts structured itinerary data
   - Geocodes locations using Mapbox
   - Creates itinerary and pins in database

3. **AI Prompt Engineering** (`lib/ai/itinerary-prompt.ts`)
   - System prompts optimized for travel itinerary extraction
   - JSON parsing and validation
   - Structured data format

4. **Geocoding Utility** (`lib/geocoding.ts`)
   - Mapbox Geocoding API integration
   - Batch geocoding support
   - Error handling for failed geocodes

## Workflow

```
User Input (Prompt)
    ↓
Groq AI Processing (llama-3.1-8b-instant)
    ↓
Structured JSON Extraction
    ↓
Location Geocoding (Mapbox)
    ↓
Database Creation (Itinerary + Pins)
    ↓
Success Response
```

## Key Features

### 1. AI Prompt Processing
- Uses Groq's `llama-3.1-8b-instant` model (same as chat API)
- Extracts:
  - Title and description
  - Duration (in days)
  - Locations with coordinates
  - Activities and tips per location
  - Budget and season information

### 2. Geocoding
- Automatically converts location names to coordinates
- Uses Mapbox Geocoding API
- Focuses on India by default (configurable)
- Handles failed geocodes gracefully

### 3. Pin Creation
- Creates pins with proper types (HOTEL, FOOD, ATTRACTION, etc.)
- Assigns appropriate icons
- Includes rich descriptions with activities and tips
- Orders pins by day and sequence
- Stores AI metadata in `meta_json` field

### 4. Error Handling
- Validates user input
- Handles AI parsing failures
- Manages geocoding errors
- Provides user-friendly error messages

## Database Schema

### Current Schema
The existing schema supports AI-generated itineraries:
- `Itinerary` table: stores title, description, created_by, is_public
- `ItineraryPin` table: stores location data with coordinates, descriptions, types, and metadata

### Suggested Enhancements
See `SCHEMA_IMPROVEMENTS.md` for recommendations on:
- Tracking itinerary source (AI_PROMPT, VIDEO_LINK, MANUAL)
- Generation status tracking
- AI confidence scores

## API Endpoint

### POST `/api/itineraries/create-ai`

**Request Body:**
```json
{
  "prompt": "5-day trip to Kerala with backwaters and local food",
  "videoLink": null, // Optional, not yet implemented
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itinerary": { ... },
    "pins": [ ... ],
    "stats": {
      "totalLocations": 5,
      "geocodedLocations": 5,
      "failedGeocodes": 0
    }
  }
}
```

## Environment Variables Required

- `GROQ_API_KEY` - Groq API key for AI processing
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox token for geocoding

## Usage Example

1. User navigates to `/itineraries/add-itineraries/ai`
2. Enters prompt: "I want a 3-day weekend trip to Jaipur focusing on heritage palaces and local street food"
3. Clicks "Generate Itinerary"
4. System processes:
   - AI extracts: Jaipur, City Palace, Hawa Mahal, local food spots
   - Geocodes each location
   - Creates itinerary with pins
5. Redirects to `/itineraries` page

## Future Enhancements

1. **Video Link Processing**
   - Extract transcript from YouTube/Instagram videos
   - Process video content with AI
   - Extract locations from video descriptions and captions

2. **Enhanced AI Prompting**
   - Multi-turn conversations for refinement
   - Context-aware suggestions based on user preferences
   - Budget and time optimization

3. **Better Geocoding**
   - Fallback to Google Places API if Mapbox fails
   - Place details enrichment
   - Photo fetching for locations

4. **User Experience**
   - Preview itinerary before saving
   - Edit AI-generated content
   - Regenerate with different parameters

## Testing

### Test Cases
1. Simple prompt: "3-day trip to Goa"
2. Detailed prompt: "5-day luxury Kerala tour with backwaters, spa, and ayurveda"
3. Complex prompt: "Weekend adventure in Manali with trekking and snow activities"
4. Error handling: Invalid location names, network failures

### Example Prompts to Test
- "I want a 5-day trip to Kerala focused on backwaters, local food, and heritage sites. Budget-friendly options preferred."
- "3-day weekend in Jaipur with heritage palaces and local street food"
- "Adventure trip to Manali for 4 days with trekking and snow activities"
- "Luxury 7-day Kerala backwaters tour with spa and ayurveda"

## Best Practices

1. **Prompt Engineering**
   - Be specific about locations (include city/state)
   - Mention duration, interests, and budget
   - Use natural language

2. **Error Handling**
   - Always validate AI responses
   - Provide fallback for failed geocodes
   - Log errors for debugging

3. **Performance**
   - Batch geocode locations in parallel
   - Cache geocoding results if possible
   - Optimize AI prompt length

4. **User Experience**
   - Show clear loading states
   - Provide helpful error messages
   - Allow users to refine prompts

## Notes

- The implementation follows professional software development practices
- Code is modular and maintainable
- Error handling is comprehensive
- TypeScript ensures type safety
- Follows Next.js 14 App Router conventions

