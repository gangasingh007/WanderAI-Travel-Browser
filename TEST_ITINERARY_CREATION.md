# Testing Manual Itinerary Creation

This guide explains how to test the manual itinerary creation functionality.

## Overview

The manual itinerary creation feature allows users to:
1. Add a title and description for the itinerary
2. Place pins on the map by dragging markers
3. Edit pin details (title, description)
4. Save the itinerary to the database

## Components

### 1. API Route: `/api/itineraries/create`
- **Location**: `app/api/itineraries/create/route.ts`
- **Method**: POST
- **Authentication**: Required (Supabase auth)
- **Request Body**:
  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "isPublic": "boolean (default: false)",
    "pins": [
      {
        "latitude": "number (required)",
        "longitude": "number (required)",
        "title": "string (required)",
        "description": "string (optional)",
        "type": "string (optional)",
        "icon": "string (optional)",
        "orderIndex": "number (optional)"
      }
    ]
  }
  ```

### 2. Manual Page: `/itineraries/add-itineraries/manual`
- **Location**: `app/itineraries/add-itineraries/manual/page.tsx`
- **Features**:
  - Form for itinerary title and description
  - Map with pin placement
  - Save functionality

### 3. MapCanvas Component
- **Location**: `components/map/MapCanvas.tsx`
- **Updates**: Now tracks pins with full details and exposes them via `onPinsChange` callback

## Testing Steps

### Manual Testing in Browser

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Log in to your application**:
   - Navigate to `/login`
   - Sign in with your credentials

3. **Navigate to manual itinerary creation**:
   - Go to `/itineraries/add-itineraries/manual`

4. **Create an itinerary**:
   - Enter a title (e.g., "Weekend in Paris")
   - Optionally add a description
   - Drag marker icons from the palette onto the map
   - Click on each marker to add title and description
   - Click "Save Itinerary"

5. **Verify the save**:
   - Check for success message
   - Check browser console for any errors
   - Verify data in database (check `itineraries` and `itinerary_pins` tables)

### Testing with Test Script

1. **Install dependencies** (if not already installed):
   ```bash
   npm install tsx --save-dev
   ```

2. **Run the test script**:
   ```bash
   npx tsx scripts/test-itinerary-creation.ts
   ```

3. **Expected output**:
   - Tests validation logic (missing title, missing pins, invalid coordinates)
   - Tests data type validation
   - Note: Authentication tests will fail unless you provide auth token

### Database Verification

After saving an itinerary, verify in your database:

```sql
-- Check itinerary
SELECT * FROM itineraries WHERE title = 'Your Itinerary Title';

-- Check pins
SELECT ip.* 
FROM itinerary_pins ip
JOIN itineraries i ON ip.itinerary_id = i.id
WHERE i.title = 'Your Itinerary Title'
ORDER BY ip.order_index;
```

## Common Issues and Solutions

### Issue: "Unauthorized" error when saving
**Solution**: Make sure you're logged in. The API requires authentication.

### Issue: "Title is required" error
**Solution**: Enter a title in the itinerary form before saving.

### Issue: "Please add at least one pin" error
**Solution**: Drag at least one marker onto the map before saving.

### Issue: "All pins must have a title" error
**Solution**: Click on each pin marker and add a title in the sidebar.

### Issue: Pins not saving
**Solution**: 
- Check browser console for errors
- Verify database connection
- Check API route logs
- Ensure all pins have titles

## Validation Rules

1. **Itinerary**:
   - Title is required (must not be empty)
   - Description is optional
   - isPublic defaults to false

2. **Pins**:
   - At least one pin is required
   - Each pin must have:
     - Valid latitude (number)
     - Valid longitude (number)
     - Title (non-empty string)
   - Description is optional for pins

## Testing Checklist

- [ ] Can create itinerary with title only
- [ ] Can create itinerary with title and description
- [ ] Cannot save without title (validation works)
- [ ] Cannot save without pins (validation works)
- [ ] Can add pins to map by dragging markers
- [ ] Can edit pin titles and descriptions
- [ ] Can save itinerary successfully
- [ ] Success message appears after save
- [ ] Form resets after successful save
- [ ] Data persists in database
- [ ] Authentication is required (401 without auth)

## Debugging

### Enable Debug Logging

Add console logs in:
- `app/api/itineraries/create/route.ts` - API route
- `app/itineraries/add-itineraries/manual/page.tsx` - Frontend save logic
- `components/map/MapCanvas.tsx` - Pin tracking

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try saving an itinerary
4. Check the POST request to `/api/itineraries/create`
5. Verify request payload and response

### Database Logs

Check Prisma logs (already enabled in `lib/prisma.ts`):
- Query logs show database operations
- Error logs show any database errors

## Next Steps

After testing, you may want to:
- Add ability to edit existing itineraries
- Add ability to delete pins
- Add photo/video upload for pins
- Add date/day scheduling
- Add route visualization

