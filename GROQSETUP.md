# Groq AI Setup Guide

This guide will help you set up Groq AI for the Wander AI chat functionality.

## 🎯 Overview

Wander AI uses [Groq](https://groq.com/) to power the conversational AI assistant that helps users with travel planning. Groq provides fast, low-latency AI inference using open-source language models.

## 📋 Prerequisites

- A Groq account (free tier available)
- Node.js 18+ installed
- The `groq-sdk` package (already included in dependencies)

## 🚀 Step-by-Step Setup

### Step 1: Create a Groq Account

1. Visit [Groq's website](https://groq.com/)
2. Sign up for a free account
3. Complete the registration process

### Step 2: Get Your API Key

1. Log in to your Groq account
2. Navigate to the [API Keys](https://console.groq.com/keys) section in the console
3. Click "Create API Key"
4. Copy your API key (you'll only see it once, so save it securely!)

### Step 3: Add API Key to Environment Variables

1. Open or create your `.env.local` file in the project root
2. Add the following line:

```env
GROQ_API_KEY=your_groq_api_key_here
```

3. Replace `your_groq_api_key_here` with your actual API key from Step 2
4. **Important:** Never commit `.env.local` to git! It's already in `.gitignore`

### Step 4: Verify Installation

1. Check that `groq-sdk` is installed:

```bash
npm list groq-sdk
```

2. If it's not installed, install it:

```bash
npm install groq-sdk
```

### Step 5: Test the Integration

1. Start your development server:

```bash
npm run dev
```

2. Navigate to the chat page in your application
3. Send a test message to verify the AI is responding

## 🔧 Current Configuration

The Groq integration is configured in `app/api/chat/route.ts`:

- **Model:** `llama3-8b-8192` (8 billion parameter Llama 3 model)
- **System Prompt:** "You are Wander AI, a helpful travel assistant."
- **Max Tokens:** 8192 (default for this model)

### Code Location

```typescript
// app/api/chat/route.ts

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const completion = await groq.chat.completions.create({
  model: "llama3-8b-8192",
  messages: [
    { role: "system", content: "You are Wander AI, a helpful travel assistant." },
    { role: "user", content: message },
  ],
});
```

## 📊 Available Models

Groq offers several models. Currently using:
- `llama3-8b-8192` - Fast, efficient 8B parameter model

Other available models you can try:
- `llama3-70b-8192` - More powerful 70B parameter model
- `mixtral-8x7b-32768` - Mixtral model with longer context
- `gemma-7b-it` - Google's Gemma model

To change the model, update line 54 in `app/api/chat/route.ts`:

```typescript
model: "llama3-70b-8192", // or any other model name
```

## 💰 Pricing & Limits

**Free Tier:**
- 14,400 requests per day
- Fast inference speeds
- No credit card required

**Pro Tier:**
- Higher rate limits
- Priority support
- See [Groq Pricing](https://groq.com/pricing) for details

## 🛠️ Advanced Configuration

### Customizing System Prompt

Edit the system message in `app/api/chat/route.ts`:

```typescript
{ role: "system", content: "You are Wander AI, a helpful travel assistant specialized in [your customization]." },
```

### Adding Conversation History

To maintain conversation context, you can modify the messages array:

```typescript
messages: [
  { role: "system", content: "You are Wander AI, a helpful travel assistant." },
  ...previousMessages, // Add conversation history here
  { role: "user", content: message },
],
```

### Temperature & Other Parameters

You can add additional parameters for more control:

```typescript
const completion = await groq.chat.completions.create({
  model: "llama3-8b-8192",
  messages: [...],
  temperature: 0.7,      // 0.0 (deterministic) to 2.0 (creative)
  max_tokens: 2048,      // Maximum tokens in response
  top_p: 1.0,            // Nucleus sampling parameter
  stream: false,         // Set to true for streaming responses
});
```

## 🆘 Troubleshooting

### Error: "API key is required"

**Solution:** Make sure `GROQ_API_KEY` is set in your `.env.local` file and restart your development server.

### Error: "Invalid API key"

**Solution:** 
- Verify your API key is correct in `.env.local`
- Check that you copied the entire key (no spaces or newlines)
- Regenerate your API key if needed

### Error: "Rate limit exceeded"

**Solution:**
- You've hit the free tier rate limit (14,400 requests/day)
- Wait 24 hours for the limit to reset
- Consider upgrading to Pro tier if needed

### Slow Responses

**Solution:**
- Groq is typically very fast. If slow, check:
  - Your internet connection
  - Groq service status
  - Try a different model (some are faster than others)

## 📚 Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Groq API Reference](https://console.groq.com/docs/quickstart)
- [Groq Console](https://console.groq.com/)
- [Groq Models](https://console.groq.com/docs/models)

## ✅ Verification Checklist

- [ ] Created Groq account
- [ ] Generated API key
- [ ] Added `GROQ_API_KEY` to `.env.local`
- [ ] Verified `groq-sdk` is installed
- [ ] Tested chat functionality in the app
- [ ] AI responses are working correctly

---

**Note:** Always keep your API keys secure and never commit them to version control!

