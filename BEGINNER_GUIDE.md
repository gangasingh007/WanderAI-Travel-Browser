# 🎓 Beginner's Guide to Wander AI Project

Welcome! This guide explains every file in your project in simple language so you can understand and contribute to it.

---

## 📁 Understanding Your Project Structure

Your project is a **travel planning app** called **Wander AI** that lets people:
- Chat with AI about travel
- Create travel itineraries (trip plans)
- See trips on a map
- Follow travel creators
- Discover new destinations

Think of it like a **smart travel browser** - similar to how you browse websites, but for travel planning!

---

## 🔧 Configuration Files (Project Setup)

### `package.json` 📦
**What it does:** This is your project's "shopping list" - it lists all the tools (libraries) your app needs to work.

**Key parts:**
- **dependencies:** Tools needed to run the app (like React, Next.js, Supabase)
- **devDependencies:** Tools only needed during development (like TypeScript, ESLint)
- **scripts:** Short commands you can run:
  - `npm run dev` → Start the app locally
  - `npm run build` → Prepare app for production
  - `npm run db:generate` → Generate database tools
  - `npm run db:push` → Update your database

**How to edit:** Add new libraries here when you need them (e.g., a map library, an AI library).

---

### `tsconfig.json` ⚙️
**What it does:** Configures TypeScript (the programming language that helps catch errors).

**What it tells TypeScript:**
- How strict to be with type checking
- Where to find files (the `paths` section)
- What JavaScript features to support

**When to edit:** Usually you won't need to touch this unless adding new TypeScript features.

---

### `next.config.ts` 🔄
**What it does:** Settings for Next.js (the framework building your app).

**Current status:** Mostly empty (just basic config).

**When to edit:** When you need to:
- Add external image domains
- Configure environment variables
- Set up redirects
- Add plugins

---

### `eslint.config.mjs` 🔍
**What it does:** Code quality checker - finds mistakes and style issues.

**When to edit:** When you want to change coding rules or add new linting rules.

---

### `postcss.config.mjs` 🎨
**What it does:** Processes your CSS styles (especially TailwindCSS).

**When to edit:** Rarely - only if you need custom CSS processing.

---

## 📚 Documentation Files (Understanding the Project)

### `README.md` 📖
**What it does:** The main guide that explains:
- What the project is
- How to set it up
- How to run it
- What technologies are used

**Read this first!** It's like the instruction manual.

---

### `PRD.md` 📋
**What it does:** Product Requirements Document - the "blueprint" of what the app should do.

**Contains:**
- The vision for the app
- All features planned
- How each page should work
- Design philosophy

**When to read:** When you need to understand what feature you're building.

---

### `PLAN.md` 🗺️
**What it does:** Development roadmap - step-by-step plan for building the app.

**Contains:**
- Phases of development
- What to build in each phase
- Tasks checklist

**When to read:** To see what's next to build or what has been completed.

---

### `AUTH_SETUP.md` 🔐
**What it does:** Guide for setting up authentication (login/signup).

**Contains:**
- What authentication features are ready
- How to test login/signup
- Troubleshooting tips

**When to read:** When setting up the project or debugging login issues.

---

### `SUPABASE_SETUP.md` 🗄️
**What it does:** Instructions for connecting to Supabase (your database).

**Contains:**
- How to create a Supabase account
- How to get API keys
- How to set up environment variables

**When to read:** When first setting up the project.

---

### `env.local.example` 📝
**What it does:** Template showing what environment variables you need.

**What it shows:**
- Database connection URL
- Supabase API keys
- Other secrets

**How to use:**
1. Copy this file
2. Rename to `.env.local`
3. Fill in your actual values
4. **Never commit this file** (it has secrets!)

---

## 🎨 App Files (The Actual Application)

### `app/layout.tsx` 🏗️
**What it does:** The "wrapper" around every page - like the frame of a house.

**Contains:**
- Fonts (Geist Sans & Mono)
- Global CSS imports
- Metadata (title, description for SEO)

**When to edit:**
- To change fonts
- To add global navigation
- To change page title
- To add analytics scripts

---

### `app/page.tsx` 🏠
**What it does:** The **landing page** (homepage) - the first thing visitors see.

**Features:**
- Hero section with tagline
- Login/Sign Up buttons
- Auto-redirects logged-in users to `/chat`
- Beautiful animations using Framer Motion

**When to edit:**
- To change the homepage design
- To update the tagline
- To add new sections
- To modify the hero content

---

### `app/login/page.tsx` 🔑
**What it does:** Login page where users enter email/password.

**Features:**
- Email and password input
- Error messages
- Redirects to `/chat` after login

**When to edit:**
- To change the login form design
- To add social login buttons
- To add "Forgot password" feature

---

### `app/signup/page.tsx` ✍️
**What it does:** Sign up page for new users.

**Features:**
- Email, password, name, username inputs
- **Creator/Traveler selection** (important!)
- Error handling
- Redirects after signup

**When to edit:**
- To add more fields (like phone number)
- To change the user type selection UI
- To add terms & conditions checkbox

---

### `app/chat/page.tsx` 💬
**What it does:** The main chat interface (currently a placeholder).

**Current status:**
- Shows user info
- Protected route (must be logged in)
- Has sidebar navigation
- Placeholder for future chat UI

**When to edit:**
- To build the actual chat interface
- To add message bubbles
- To connect to AI (OpenAI)
- To add chat history

---

### `app/map/page.tsx` 🗺️
**What it does:** Map view showing all travel itineraries (currently placeholder).

**Future features:**
- Interactive map
- Pins for each location
- Click pin to see details
- Filter and search

**When to edit:**
- To integrate Google Maps or Mapbox
- To display itinerary pins
- To add map controls

---

### `app/explore/page.tsx` 🔍
**What it does:** Discovery page for trending travel content (currently placeholder).

**Future features:**
- Top creators
- Trending destinations
- Best itineraries
- Filter by category

**When to edit:**
- To build the explore feed
- To add filters
- To show content cards

---

### `app/following/page.tsx` 👥
**What it does:** Shows content from people you follow (currently placeholder).

**Future features:**
- Timeline of followed creators
- Saved itineraries
- Your groups

**When to edit:**
- To build the following feed
- To show follow/unfollow buttons
- To add saved items section

---

### `app/marketplace/page.tsx` 🛒
**What it does:** Travel booking marketplace (currently placeholder).

**Future features:**
- Flight bookings
- Hotel reservations
- Travel packages
- Coins system

**When to edit:**
- To add booking integrations
- To build the coins system
- To add payment processing

---

### `app/profile/page.tsx` 👤
**What it does:** User's profile page (currently placeholder).

**Future features:**
- Public profile view
- My itineraries
- Stats (views, saves)
- Settings

**When to edit:**
- To build profile sections
- To add edit profile form
- To show user stats

---

### `app/globals.css` 🎨
**What it does:** Global styles applied to the entire app.

**Contains:**
- TailwindCSS imports
- Custom CSS variables
- Base styles

**When to edit:**
- To add custom colors
- To change default fonts
- To add global animations
- To customize Tailwind config

---

### `app/favicon.ico` 🎯
**What it does:** The small icon shown in browser tabs.

**When to edit:** Replace with your app's logo.

---

## 🔌 API Routes (Backend Functions)

### `app/api/users/create/route.ts` ➕
**What it does:** Creates a new user in the database when someone signs up.

**How it works:**
1. Receives user data (email, username, etc.)
2. Uses Supabase service role key (special admin key)
3. Inserts/updates user in `users` table
4. Handles errors (like duplicate username)

**When to edit:**
- To add more user fields
- To add validation
- To send welcome emails
- To add profile pictures

---

### `app/auth/callback/route.ts` 🔄
**What it does:** Handles OAuth callbacks (like Google login redirects).

**How it works:**
1. User clicks "Sign in with Google"
2. Goes to Google
3. Google redirects back to this route
4. This route processes the authentication
5. Redirects to `/chat`

**When to edit:**
- To change redirect location
- To add more OAuth providers
- To handle errors better

---

## 🧩 Components (Reusable UI Pieces)

### `components/sidebar/Sidebar.tsx` 📑
**What it does:** The navigation sidebar on the left of the app.

**Features:**
- Navigation items (Chat, Map, Explore, etc.)
- Collapsible (can shrink to icons only)
- Shows active page
- Beautiful animations

**When to edit:**
- To add new navigation items
- To change icons
- To modify the design
- To add user menu

---

## 🔧 Library Files (Helper Functions)

### `lib/auth.ts` 🔐
**What it does:** Helper functions for authentication.

**Functions:**
- `signUp()` - Create new account
- `signIn()` - Login
- `signOut()` - Logout
- `getCurrentUser()` - Get logged-in user
- `signInWithGoogle()` - OAuth login

**When to edit:**
- To add password reset
- To add email verification
- To add more OAuth providers
- To modify user creation flow

---

### `lib/prisma.ts` 📊
**What it does:** Creates a database connection tool (Prisma Client).

**What it does:**
- Connects to your Supabase database
- Prevents multiple connections (good for performance)
- Used throughout the app to query the database

**When to edit:** Usually never - it's a setup file.

---

### `lib/supabase/client.ts` 🌐
**What it does:** Creates Supabase client for **browser** (client-side code).

**When it's used:**
- In React components
- For user authentication
- For real-time features

**When to edit:** Rarely - only if you need custom Supabase config.

---

### `lib/supabase/server.ts` 🔒
**What it does:** Creates Supabase client for **server** (API routes, server components).

**Difference from client.ts:**
- More secure (uses service role key)
- Can bypass Row Level Security
- Used in API routes

**When to edit:** Rarely - only if you need custom server config.

---

## 🗄️ Database Files

### `prisma/schema.prisma` 📋
**What it does:** Defines your database structure (tables and relationships).

**Models (Tables):**
- **User** - User profiles (travelers/creators)
- **Itinerary** - Travel plans
- **ItineraryPin** - Locations on map
- **Follow** - Who follows whom
- **SavedItinerary** - Bookmarked trips
- **ChatSession** - Chat conversations
- **ChatMessage** - Individual messages

**When to edit:**
- To add new tables
- To add new fields to existing tables
- To change relationships
- Then run `npm run db:push` to update database

---

## 🔐 Security & Middleware

### `middleware.ts` 🛡️
**What it does:** Runs on every request to:
- Check if user is logged in
- Refresh authentication tokens
- Protect routes

**When to edit:**
- To add route protection
- To add role-based access (creator vs traveler)
- To add rate limiting
- To modify session handling

---

## 📦 Type Definitions

### `types/supabase.ts` 📝
**What it does:** TypeScript types generated from your Supabase database.

**Purpose:** Makes your code safer by knowing what data structures exist.

**When to edit:**
- Usually auto-generated
- Can add custom types here

---

## 🖼️ Public Assets

### `public/` folder 🎨
**What it does:** Stores static files accessible to everyone.

**Files:**
- SVG icons
- Images
- Fonts
- Other static assets

**When to edit:**
- To add logos
- To add images
- To add icons

---

## 🎯 How to Contribute

### Step 1: Understand What You're Building
1. Read `PRD.md` to understand features
2. Read `PLAN.md` to see what's next
3. Look at existing code for patterns

### Step 2: Set Up Your Environment
1. Copy `env.local.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm install` to install dependencies
4. Run `npm run db:push` to set up database
5. Run `npm run dev` to start the app

### Step 3: Make Changes
1. Pick a feature from `PLAN.md`
2. Find the relevant file(s)
3. Make your changes
4. Test it locally (`npm run dev`)
5. Check for errors (`npm run lint`)

### Step 4: Common Tasks

**Adding a New Page:**
1. Create `app/your-page/page.tsx`
2. Add route to sidebar if needed
3. Test navigation

**Adding a Database Table:**
1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push`

**Adding Authentication:**
1. Use functions from `lib/auth.ts`
2. Check `AUTH_SETUP.md` for examples

**Styling:**
- Use TailwindCSS classes
- Edit `app/globals.css` for global styles
- Follow existing design patterns

---

## 🚨 Important Notes

1. **Never commit `.env.local`** - it has secrets!
2. **Always test locally** before pushing
3. **Follow existing code style** - check other files
4. **Ask questions** - look at similar files for examples
5. **Start small** - pick one feature at a time

---

## 🎓 Key Concepts to Learn

### Next.js App Router
- `app/` folder contains your pages
- `page.tsx` = a page
- `route.ts` = an API endpoint

### TypeScript
- Adds types to JavaScript
- Catches errors before runtime
- Makes code more readable

### React
- Component-based UI
- `"use client"` = runs in browser
- Hooks like `useState`, `useEffect`

### Supabase
- Database (PostgreSQL)
- Authentication
- Real-time features

### Prisma
- Database tool
- Generates safe database queries
- Manages database schema

---

## 📚 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Update database
npm run db:push

# View database (GUI)
npm run db:studio

# Check for errors
npm run lint

# Generate Prisma client
npm run db:generate
```

---

## 🎉 You're Ready!

You now understand every file in your project! Start with small changes and gradually work on bigger features. Remember:

- **Read existing code** to learn patterns
- **Start simple** - don't try to build everything at once
- **Test often** - make sure things work as you build
- **Ask for help** - we're all learning!

Good luck building Wander AI! 🌍✈️

