# Database Schema Improvements for AI Itineraries

## Suggested Additions to Itinerary Model

### 1. Track Source of Itinerary
Add fields to track how the itinerary was created:
- `source` enum: `MANUAL`, `AI_PROMPT`, `VIDEO_LINK` 
- `source_url` (optional): For video links, store the original URL
- `ai_metadata` (JSON): Store AI generation details (model used, prompt snippets, confidence scores)

### 2. Track AI Generation Status
- `generation_status` enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
- `generation_error` (optional): Store error messages if generation fails

### 3. Enhanced Pin Metadata
The `ItineraryPin` already has `meta_json` which is good. Consider adding:
- `ai_generated` boolean: Flag to indicate if pin was AI-generated
- `confidence_score` float: AI confidence in location identification

## Example Schema Changes

```prisma
enum ItinerarySource {
  MANUAL
  AI_PROMPT
  VIDEO_LINK
}

enum GenerationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Itinerary {
  // ... existing fields
  source            ItinerarySource?  @default(MANUAL)
  source_url        String?
  ai_metadata       Json?
  generation_status GenerationStatus?
  generation_error  String?
  
  @@index([source])
  @@index([generation_status])
}

model ItineraryPin {
  // ... existing fields
  ai_generated      Boolean?  @default(false)
  confidence_score  Float?
}
```

## Benefits
1. **Analytics**: Track which method users prefer (manual vs AI)
2. **Error Handling**: Better debugging for failed AI generations
3. **Quality Control**: Confidence scores help filter low-quality AI suggestions
4. **User Experience**: Show status during generation process
5. **Future Features**: Enable re-generation, editing prompts, etc.

## Migration Strategy
These are optional enhancements. The current schema works, but these additions would improve:
- User experience (loading states)
- Debugging (error tracking)
- Analytics (usage patterns)
- Future features (AI refinement, re-generation)

