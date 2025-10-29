# Supabase Setup Guide for Wander AI

This guide will help you set up Supabase database and authentication for Wander AI.

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Project Name:** wander-ai
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**

## 🗄️ Step 2: Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Under **Connection string**, find **"URI"**
3. It will look like: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`
4. Copy this string

## 🔐 Step 3: Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://[ref].supabase.co`)
   - **anon/public key**
   - **service_role key** (keep this secret!)

## 📝 Step 4: Create .env.local File

1. Create a file named `.env.local` in the root of your project
2. Copy the contents from `.env.local.example`
3. Fill in your Supabase credentials:

```env
DATABASE_URL="your-connection-string-here"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

**⚠️ Security Note:** Never commit `.env.local` to Git! It's already in `.gitignore`.

## 🔄 Step 5: Push Prisma Schema to Supabase

After setting up your `.env.local`, run:

```bash
# Generate Prisma Client with your schema
npx prisma generate

# Push schema to Supabase database
npx prisma db push
```

This will create all the tables in your Supabase database according to your Prisma schema.

## ✅ Step 6: Verify Setup

1. Go to your Supabase dashboard → **Table Editor**
2. You should see all the tables created:
   - users
   - itineraries
   - itinerary_pins
   - follows
   - saved_itineraries
   - chat_sessions
   - chat_messages

## 🎯 Step 7: Enable Supabase Auth

Since we're using Supabase authentication, we don't need to create the `users` table manually - Supabase handles it via `auth.users`.

We'll modify the schema to work with Supabase Auth later.

## 📚 Next Steps

1. Install Supabase client library:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Create Supabase client in `lib/supabase.ts`

3. Start implementing authentication in login/signup pages

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🆘 Troubleshooting

### Problem: "Can't connect to database"
- Check your DATABASE_URL in `.env.local`
- Make sure your IP is allowed in Supabase dashboard (Settings → Database)

### Problem: "Schema not found"
- Run `npx prisma generate` to generate Prisma Client
- Then run `npx prisma db push`

### Problem: "Connection pool error"
- Supabase has connection limits on free tier
- Consider using connection pooling for production

---

Happy coding! 🚀

