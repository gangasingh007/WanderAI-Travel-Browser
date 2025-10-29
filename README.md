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
│   │   └── users/create/route.ts      # Server upsert to public.users
│   ├── auth/
│   │   └── callback/route.ts          # OAuth callback handler
│   ├── chat/page.tsx                  # Main app (with sidebar)
│   ├── map/page.tsx                   # Map view placeholder (with sidebar)
│   ├── explore/page.tsx               # Explore placeholder (with sidebar)
│   ├── following/page.tsx             # Following placeholder (with sidebar)
│   ├── marketplace/page.tsx           # Marketplace placeholder (with sidebar)
│   ├── profile/page.tsx               # Profile placeholder (with sidebar)
│   ├── login/page.tsx                 # Login
│   ├── signup/page.tsx                # Signup
│   ├── page.tsx                       # Landing
│   └── layout.tsx                     # Root layout
├── components/
│   └── sidebar/Sidebar.tsx            # Collapsible sidebar
├── lib/
│   ├── prisma.ts                      # Prisma client singleton
│   ├── auth.ts                        # Auth helpers
│   └── supabase/
│       ├── client.ts                  # Browser Supabase client
│       └── server.ts                  # Server Supabase client
├── prisma/
│   └── schema.prisma                  # Database schema
├── PLAN.md                            # Development plan
├── PRD.md                             # Product requirements document
├── SUPABASE_SETUP.md                  # Supabase setup guide
└── README.md
```

## 🎨 Design Philosophy

- **Minimal, Premium UI** - Clean white background with black text
- **Typography-First** - Elegant typography hierarchy
- **Subtle Depth** - Soft shadows and transitions
- **Consistent Spacing** - Following Apple/Notion design principles

## 📝 Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [PLAN.md](./PLAN.md) - Development Plan

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with Next.js and TailwindCSS

---

Made with ❤️ by the Wander AI team
