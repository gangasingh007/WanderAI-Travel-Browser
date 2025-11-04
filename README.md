# Wander AI - Travel Browser

A next-gen, map-first travel discovery and planning platform that transforms travel discovery into a browser-like experience.

**Live Demo:** Coming Soon

## 🎯 Project Overview

Wander AI combines a ChatGPT-style conversational interface, a map canvas for visual exploration, and a creator community hub for authentic, data-rich itineraries. Users can discover, remix, and personalize travel content sourced from creators into interactive itineraries pinned on a map.

## ✨ Features

- **Clean Landing Page** - Minimal, premium UI inspired by Apple, Notion, and Linear
- **Authentication Flow** - Login and Sign Up pages with Creator/Traveler selection
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Works seamlessly on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-browser.git
cd travel-browser
```

2. Install dependencies:
```bash
npm install
```

3. **Set up Supabase Database:**
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a `.env.local` file (use `env.local.example` as template)
   - Run database setup:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Create and run migrations
npm run db:migrate
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS v4
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **Language:** TypeScript
- **Deployment:** Vercel (coming soon)

## 📁 Project Structure (updated)

```text
travel-browser/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts               # Chat API endpoint
│   │   ├── chats/
│   │   │   ├── [chatId]/
│   │   │   │   └── route.ts           # Individual chat API
│   │   │   └── route.ts               # Chats list API
│   │   ├── itineraries/
│   │   │   └── create/
│   │   │       └── route.ts           # Create itinerary API
│   │   ├── olamaps/
│   │   │   └── directions/            # OLA Maps directions API
│   │   └── users/
│   │       └── create/
│   │           └── route.ts           # Server upsert to public.users
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts               # OAuth callback handler
│   ├── chat/
│   │   ├── [chatId]/
│   │   │   └── page.tsx               # Individual chat page
│   │   └── page.tsx                   # Main chat page (with sidebar)
│   ├── explore/
│   │   └── page.tsx                   # Explore placeholder (with sidebar)
│   ├── following/
│   │   └── page.tsx                   # Following placeholder (with sidebar)
│   ├── itineraries/
│   │   ├── add-itineraries/
│   │   │   ├── ai/
│   │   │   │   └── page.tsx           # AI-powered itinerary creation
│   │   │   └── manual/
│   │   │       └── page.tsx           # Manual itinerary creation
│   │   └── page.tsx                   # Itineraries list page
│   ├── map/
│   │   └── page.tsx                   # Map view placeholder (with sidebar)
│   ├── marketplace/
│   │   └── page.tsx                   # Marketplace placeholder (with sidebar)
│   ├── profile/
│   │   └── page.tsx                   # Profile placeholder (with sidebar)
│   ├── login/
│   │   └── page.tsx                   # Login
│   ├── signup/
│   │   └── page.tsx                   # Signup
│   ├── globals.css                    # Global styles
│   ├── favicon.ico                    # Favicon
│   ├── icon.svg                       # App icon
│   ├── page.tsx                       # Landing
│   └── layout.tsx                     # Root layout
├── components/
│   ├── chat/
│   │   ├── ChatBubble.tsx             # Chat message bubble component
│   │   ├── ChatIndicator.tsx          # Chat indicator component
│   │   └── ItenaryMenu.tsx            # Itinerary menu component
│   ├── map/
│   │   ├── MapCanvas.tsx              # Main map canvas component
│   │   ├── MapSearchBar.tsx           # Map search bar component
│   │   ├── MarkerPalette.tsx          # Marker palette component
│   │   └── SampleItineraries.tsx      # Sample itineraries component
│   ├── sidebar/
│   │   └── Sidebar.tsx                # Collapsible sidebar
│   └── GlassCarousel.tsx              # Glass carousel component
├── lib/
│   ├── prisma.ts                      # Prisma client singleton
│   ├── auth.ts                        # Auth helpers
│   └── supabase/
│       ├── client.ts                  # Browser Supabase client
│       └── server.ts                  # Server Supabase client
├── types/
│   └── supabase.ts                    # Supabase TypeScript types
├── scripts/
│   └── test-itinerary-creation.ts     # Test script for itinerary creation
├── prisma/
│   └── schema.prisma                  # Database schema
├── public/
│   ├── icons/
│   │   └── flaticon/                  # Flaticon icons in SVG format
│   ├── CoverPhoto.png                 # Cover photo
│   ├── Logo.svg                       # Logo
│   ├── LogoWander.svg                 # Wander logo
│   ├── Plane.png                      # Plane image
│   ├── Verified.svg                   # Verified icon
│   └── [other assets]                 # Other public assets
├── AUTH_SETUP.md                      # Authentication setup guide
├── GROQSETUP.md                       # GROQ AI setup guide
├── MAP_PLAN.md                        # Map implementation plan
├── PLAN.md                            # Development plan
├── PRD.md                             # Product requirements document
├── SUPABASE_SETUP.md                  # Supabase setup guide
├── TEST_ITINERARY_CREATION.md         # Itinerary creation testing guide
└── README.md
```

## 🗺️ Map Implementation Steps (MVP)

1) Prepare environment
   - Create `.env.local`: add `NEXT_PUBLIC_MAPBOX_TOKEN` and `GOOGLE_MAPS_API_KEY`
   - Do NOT expose Google key on client; use server routes for Places API

2) Install map dependencies
```bash
npm install mapbox-gl
```

3) Initialize map
   - In `components/map/MapCanvas.tsx` (already scaffolded), dynamically import `mapbox-gl` in `useEffect`
   - Set style `mapbox://styles/mapbox/light-v11`, enable subtle 3D buildings

4) Marker palette → drag & drop
   - `components/map/MarkerPalette.tsx` emits drag payload `{ id, type }`
   - Handle `dragover`/`drop` in `MapCanvas` to convert screen → `lngLat`
   - Create a new marker object and persist

5) Persist markers (server)
   - Add CRUD API routes for `itinerary_pins` (create/update/delete/list)
   - Use `type`, `icon`, `google_place_id`, `meta_json`, `order_index`

6) Sidebar details
   - On marker click: open right sidebar (reuse existing top-level layout)
   - Sections: Details, Reviews, FAQs, Creator Notes

7) Google Places integration (server)
   - Create `/api/places/details?placeId=...` that calls Google Places
   - Cache in `public.place_cache` by `place_id` (TTL-based reuse)

8) Marketplace hook
   - For hotel markers, render CTA to `/marketplace` with query params

9) Performance & polish
   - Cluster at low zoom levels, lazy fetch place details, debounced saves


## 🎨 Design Philosophy

- **Minimal, Premium UI** - Clean white background with black text
- **Typography-First** - Elegant typography hierarchy
- **Subtle Depth** - Soft shadows and transitions
- **Consistent Spacing** - Following Apple/Notion design principles

## 📝 Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [PLAN.md](./PLAN.md) - Development Plan
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase setup guide
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication setup guide
- [GROQSETUP.md](./GROQSETUP.md) - GROQ AI setup guide
- [MAP_PLAN.md](./MAP_PLAN.md) - Map implementation plan
- [TEST_ITINERARY_CREATION.md](./TEST_ITINERARY_CREATION.md) - Itinerary creation testing guide

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with Next.js and TailwindCSS

---

Made with ❤️ by the Wander AI team
