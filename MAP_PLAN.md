# Wander AI — Map Plan

Purpose: Define a crisp, execution-ready plan to build a beautiful, interactive, and hackathon-ready map experience that blends creator content with real-world place data.

## 1) Product Goals
- Map-first travel browser with a premium, smooth UX.
- Users can explore a 3D-feel map, drop custom markers (pins, cars, hotels, etc.), and open a right-side details panel.
- Details panel surfaces: creator info, photos, FAQs; for hotels/POIs: live details from Google Places with a CTA to book via Marketplace.
- Creators can design itineraries (markers, routes/paths, day-by-day), and publish for others to remix.

## 2) Core UX Flow (MVP)
1. Map loads (Mapbox GL JS) centered on last session or popular area.
2. Toolbar with a small “Marker Palette” (pin/hotel/food/car/etc.).
3. Drag an icon from the palette → drop on map → marker appears.
4. Click marker → opens right sidebar:
   - Header: icon + title + type (Hotel, Food, Attraction, Custom)
   - Tabs: Details | Reviews | FAQs | Creator Notes
   - For Hotels/POIs: fused Google Places info (name, rating, photos)
   - “Open in Marketplace” button when relevant
5. Save marker (creator) to itinerary; users can favorite/save.
6. Optional: draw path/route between markers for trip flow (next phase if time).

## 3) Tech Stack
- Map: Mapbox GL JS (vector tiles, style control, 3D buildings, smooth UX)
- Places Data: Google Places API (Place Details, Nearby Search)
- Framework: Next.js (App Router), TypeScript
- Styling: TailwindCSS v4, Framer Motion for micro-interactions
- Data: Supabase (Postgres) for markers, itineraries, creator content

## 4) Data Model (MVP)
- Itinerary
  - id, title, description, created_by, is_public, created_at/updated_at
- Marker
  - id, itinerary_id, lat, lng, type (hotel|food|attraction|custom|car|pin)
  - title, description
  - icon (enum or key: pin|car|hotel|food|attraction)
  - google_place_id (nullable)
  - meta_json (photos[], faqs[], tags[], rating, price_level)
  - order_index (int), day (nullable)
- Route (Phase 2)
  - id, itinerary_id, path_geojson (LineString), transport_type (car|walk|bike)

## 5) Components (Frontend)
- MapCanvas (client): initializes Mapbox, manages source/layers, handles drag/drop, marker events
- MarkerPalette: draggable icons (pin, car, hotel, food, attraction)
- MarkerLayer: renders markers (Mapbox image sprites or HTML markers)
- SidebarRight: detail panel with sections/tabs
- PlaceSearch (optional fast-follow): search box to add Google POIs directly
- MarketplaceCTA: simple button section for hotels

## 6) Interactions & Details
- Drag & Drop
  - Use a small overlay palette (absolute) → HTML5 drag events
  - On drop: convert screen coords → map lngLat and create marker
- Marker Icons
  - Start with a minimal set (SVGs mapped to Mapbox image sprites or HTML markers)
  - Keep sizes responsive to zoom level
- Sidebar
  - Sliding transition (Framer Motion)
  - Tabs: sticky header, scrollable content
  - Content priority: Title → Creator Notes → Google Info → Actions
- Google Places Integration
  - If marker has google_place_id: fetch Place Details
  - If not: search/attach via “Link a Place” in sidebar
  - Cache results per place_id to reduce API calls

## 7) API Integration (Server and Client)
- Server Route: `/api/places/details?placeId=...`
  - Uses Google API key (server-side), returns curated shape for UI
  - Caches in Supabase (table: `place_cache`) for fast re-use (TTL)
- Client: calls server route on sidebar open
- Security: Never expose Google API key on client

## 8) Mapbox Setup
- Load Mapbox GL JS in a client component only
- Style: light/clean base style, 3D buildings enabled at high zoom
- Sources & Layers
  - Marker source: GeoJSON source (FeatureCollection)
  - Marker layer: symbol layer using sprite icon per `marker.type`
  - Route layer (Phase 2): line layer with subtle gradient

## 9) Persistence
- On marker create: save immediately (optimistic UI)
- Updates via sidebar auto-save (debounced)
- Draft vs published itineraries
- Public itinerary read-only for users; creators can edit their own

## 10) Performance
- Cluster markers at low zoom levels
- Lazy load Google Place details (only when sidebar opens)
- Cache server responses (DB + edge headers if later on Vercel)
- Avoid re-creating map instance; manage layers/sources diff-only

## 11) Access & Auth
- Protect map routes for authenticated users (current app pattern)
- Allow viewing public itineraries without login (Phase 2)
- Rate-limit server routes (basic guard) to protect keys

## 12) Marketplace Hook (Hotels)
- Sidebar → “Book hotel” button
  - For hackathon: link to placeholder Marketplace page with passed params
  - Future: deep-link to partner APIs (MakeMyTrip, Goibibo) with tracking

## 13) Visual Design
- Minimal, white, typography-first
- Smooth panel transitions, subtle shadows, rounded corners
- Avoid clutter; clear hierarchy; sparse color palette; premium feel

## 14) MVP Scope (Hackathon)
Must-have
- Map renders (Mapbox GL JS), draggable marker palette, add marker
- Sidebar opens on marker click, editable title/notes
- Attach Google Place (search or paste place ID), fetch details server-side
- Save markers to DB, reload state on refresh
- Marketplace CTA for hotels
Nice-to-have (time permitting)
- Clustering, custom sprites, 3D buildings
- Route drawing between markers; day planning
- Import from Google Place search directly on the map

## 15) Execution Plan (High-level Steps)
1. Install Mapbox GL, create `MapCanvas` + token env
2. Marker palette with drag/drop; convert drop → lngLat
3. Marker model + CRUD API routes (create/update/delete/list by itinerary)
4. Sidebar UI with tabs; optimistic save
5. Google Places server route + cache; link/attach to a marker
6. Marketplace button for hotel marker types
7. Clustering + polish

## 16) Environment Variables
- `NEXT_PUBLIC_MAPBOX_TOKEN` (public)
- `GOOGLE_MAPS_API_KEY` (server-only)

## 17) Risks & Mitigations
- API quotas: cache responses, limit calls to sidebar-open
- Performance: cluster markers, debounced saves
- Security: server-only Google key, RLS enforced for marker ownership
- Time: slice scope to the above MVP; defer routes/paths if needed

## 18) Success Criteria (Hackathon)
- Live demo: drag marker → sidebar opens → attach Google place → save → refresh persists
- Visual polish: smooth interactions, premium feel
- Clear narrative: creators + real data + action (booking) in one map experience
