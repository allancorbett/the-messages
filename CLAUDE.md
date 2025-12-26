# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Messages is a location-aware seasonal meal planning app that uses Claude AI to generate meal suggestions based on seasonal local ingredients, budget levels, and dietary preferences. The app auto-detects the user's location via IP geolocation and provides regionally-appropriate seasonal ingredients. Users can save meals, generate shopping lists, and manage their preferences through Supabase authentication.

## Content Guidelines

**British English**: All user-facing text, UI copy, and AI-generated content must use British English spelling and conventions:
- Use "personalised" not "personalized"
- Use "flavour" not "flavor"
- Use "colour" not "color"
- Use "organised" not "organized"
- Use "centre" not "center"
- And so on for all British English variants

This applies to:
- All React component text and labels
- AI prompts in `src/app/api/generate-meals/route.ts`
- Loading messages, error messages, and user feedback
- Documentation and help text

**Tone**: Recipe content should be friendly and inviting, like trusted recipes passed between friends. Avoid using personal pronouns ("my", "me", "your") in AI-generated recipes to prevent implying user-submitted content.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Supabase Integration Pattern

The app uses three distinct Supabase client implementations:

- **Browser Client** (`src/lib/supabase/client.ts`): Use in Client Components
- **Server Client** (`src/lib/supabase/server.ts`): Use in Server Components, Route Handlers, and Server Actions
- **Middleware Client** (`src/lib/supabase/middleware.ts`): Handles session refresh on every request

Always use the appropriate client based on execution context. The server client handles cookie management differently to work within React's Server Component constraints.

### AI Meal Generation Flow

1. User submits preferences via `/plan` page
2. Request sent to `/api/generate-meals` route handler
3. Route handler authenticates user, validates input with Zod schemas
4. Prompt constructed with seasonal ingredients, budget constraints, and dietary requirements
5. Claude API (Sonnet 4) generates structured JSON with 10 meals
6. Response validated against `generateMealsResponseSchema` before returning to client
7. Each meal gets a unique ID: `meal-${Date.now()}-${index}`

The prompt in `src/app/api/generate-meals/route.ts` dynamically includes seasonal ingredient mappings based on the user's detected location (via `src/lib/geolocation.ts`) and budget descriptions that guide Claude's output. Regional configurations exist for UK, Ireland, US, Canada, France, Germany, Australia, New Zealand, with a fallback for other regions.

### Type System

Central types defined in `src/types/index.ts`:
- `Meal`: Core meal structure with ingredients, instructions, price level
- `Ingredient`: Has name, quantity, and category (for shopping list grouping)
- `GenerateMealsParams`: Input to AI generation (validated by Zod)
- `ShoppingListItem`: Extends Ingredient with checked state and source meal tracking

Ingredient categories (`produce`, `dairy`, `meat`, `fish`, `storecupboard`, `frozen`, `bakery`) correspond to supermarket sections for shopping list organization.

### Database Schema

Three main tables (see `supabase/migrations/001_initial_schema.sql`):

1. **user_preferences**: Stores household_size, dietary_requirements (text[]), default_budget
2. **saved_meals**: All generated and manually saved meals with ingredients as JSONB, instructions as text[]
   - Generated meals are automatically saved here when AI creates them
   - Users can delete meals from their collection
3. **shopping_lists**: Current shopping list for the user (one active list per user)
   - Stores meal_ids array and items as JSONB
   - Replaces previous list when new meals are selected
   - Items include checked status for tracking shopping progress

All tables have Row Level Security enabled with policies ensuring users can only access their own data via `auth.uid() = user_id`.

### Authentication Flow

- Sign up/sign in handled via Server Actions in `src/app/actions/auth.ts`
- Email confirmation required (redirects to `/auth/callback`)
- Middleware (`src/middleware.ts`) refreshes sessions on every request except static assets
- Protected routes should check auth using `getUser()` server action or `createClient().auth.getUser()`

### Server Actions

`src/app/actions/meals.ts` contains meal and shopping list operations:
- `saveGeneratedMeals()`: Auto-saves all AI-generated meals to database
- `saveShoppingList()`: Saves/replaces shopping list (deletes old, inserts new)
- `getShoppingList()`: Retrieves current shopping list from database
- `updateShoppingListItem()`: Updates checked status of individual items
- `clearShoppingList()`: Deletes user's shopping list from database

Shopping lists use sessionStorage as a temporary handoff between pages, then persist to database.

### Validation Strategy

All user input and AI output validated with Zod schemas in `src/lib/validation.ts`. API route handlers use `.safeParse()` and return formatted errors. Client-side forms should also validate before submission.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://eedyiwnbbljjglewdlpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
```

**REQUIRED for production:**
```
NEXT_PUBLIC_SITE_URL=https://the-messages.vercel.app
```
This is critical for authentication to work correctly. Without this, email confirmation links will redirect to localhost instead of your production domain, causing registration failures.

## Database Migrations

Run migrations manually in Supabase SQL Editor:
1. Go to https://supabase.com/dashboard/project/eedyiwnbbljjglewdlpt/sql
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the SQL

Do not use Supabase CLI for migrations in this project.

## Vercel Deployment

### Setting Environment Variables in Vercel

**Critical:** The app will fail authentication on production without proper environment variables.

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development** environments:

```
NEXT_PUBLIC_SUPABASE_URL=https://eedyiwnbbljjglewdlpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
NEXT_PUBLIC_SITE_URL=https://the-messages.vercel.app
```

4. After adding environment variables, **redeploy** the application for changes to take effect
5. Verify authentication works by testing user registration

### Supabase Authentication Configuration

Ensure your Supabase project has the correct redirect URLs configured:

1. Go to https://supabase.com/dashboard/project/eedyiwnbbljjglewdlpt/auth/url-configuration
2. Add the following to **Redirect URLs**:
   - `https://the-messages.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
3. Save changes

Without these redirect URLs configured, email confirmation links will fail.

## Key Dependencies

- **Next.js 15**: App Router with React Server Components
- **@anthropic-ai/sdk**: Claude API integration (currently using `claude-sonnet-4-20250514`)
- **@supabase/ssr**: SSR-compatible Supabase client with cookie management
- **Zod**: Runtime validation for API inputs/outputs
- **Tailwind CSS**: Utility-first styling
