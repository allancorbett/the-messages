# The Messages 🛒

Seasonal meal planning based on your location. Get the messages sorted.

## What is this?

A meal planning app that:
- Suggests meals based on seasonal local ingredients (auto-detects your region)
- Lets you filter by breakfast/lunch/dinner and budget (economic/mid-range/fancy)
- Generates aggregated shopping lists from your selected meals
- Saves your favourite meals for later

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel (recommended)

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/allancorbett/the-messages.git
cd the-messages
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a new Supabase project at [supabase.com](https://supabase.com), then run the database migration:

1. Go to your Supabase SQL Editor: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql`
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it

This creates the tables for user preferences, saved meals, and shopping lists.

### 4. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials (get these from Supabase Dashboard → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-meals/    # Claude API integration
│   ├── auth/
│   │   └── callback/          # Supabase auth callback
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── plan/                  # Main meal planning page
│   ├── saved/                 # Saved meals page
│   ├── shopping-list/         # Shopping list page
│   ├── actions/               # Server actions
│   └── page.tsx               # Landing page
├── components/
│   ├── meals/                 # Meal-related components
│   ├── shopping/              # Shopping list components
│   └── Header.tsx             # Navigation header
├── lib/
│   ├── supabase/              # Supabase client setup
│   ├── utils.ts               # Helper functions
│   └── validation.ts          # Zod schemas
└── types/
    └── index.ts               # TypeScript types
```

## Features

### Meal Generation
- Location-aware seasonal ingredients (UK, Ireland, US, Canada, France, Germany, Australia, New Zealand, and more)
- Budget levels: Economic (under £2/serving), Mid (£2-5), Fancy (£5+)
- Breakfast, lunch, dinner options
- Configurable serving sizes

### Shopping List
- Aggregated ingredients from selected meals
- Grouped by supermarket section
- Tick items off as you shop
- Copy to clipboard

### User Accounts
- Email/password auth via Supabase
- Save favourite meals
- Persistent preferences

## API Costs

Claude API (Sonnet):
- ~$0.01 per meal generation (3 meals)
- 100 generations/month ≈ $1

## Licence

MIT
