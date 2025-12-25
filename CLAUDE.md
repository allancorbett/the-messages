# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Messages is a seasonal meal planning app for Scotland that uses Claude AI to generate meal suggestions based on seasonal Scottish ingredients, budget levels, and dietary preferences. Users can save meals, generate shopping lists, and manage their preferences through Supabase authentication.

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

The prompt in `src/app/api/generate-meals/route.ts` includes seasonal ingredient mappings specific to Scotland and budget descriptions that guide Claude's output.

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
2. **saved_meals**: Stores user's saved meals with ingredients as JSONB, instructions as text[]
3. **shopping_lists**: Optional history tracking of generated shopping lists

All tables have Row Level Security enabled with policies ensuring users can only access their own data via `auth.uid() = user_id`.

### Authentication Flow

- Sign up/sign in handled via Server Actions in `src/app/actions/auth.ts`
- Email confirmation required (redirects to `/auth/callback`)
- Middleware (`src/middleware.ts`) refreshes sessions on every request except static assets
- Protected routes should check auth using `getUser()` server action or `createClient().auth.getUser()`

### Validation Strategy

All user input and AI output validated with Zod schemas in `src/lib/validation.ts`. API route handlers use `.safeParse()` and return formatted errors. Client-side forms should also validate before submission.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://eedyiwnbbljjglewdlpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
```

Optional for production:
```
NEXT_PUBLIC_SITE_URL=<production-url>  # Used for auth redirects
```

## Database Migrations

Run migrations manually in Supabase SQL Editor:
1. Go to https://supabase.com/dashboard/project/eedyiwnbbljjglewdlpt/sql
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the SQL

Do not use Supabase CLI for migrations in this project.

## Key Dependencies

- **Next.js 15**: App Router with React Server Components
- **@anthropic-ai/sdk**: Claude API integration (currently using `claude-sonnet-4-20250514`)
- **@supabase/ssr**: SSR-compatible Supabase client with cookie management
- **Zod**: Runtime validation for API inputs/outputs
- **Tailwind CSS**: Utility-first styling
