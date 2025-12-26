import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  generateMealsParamsSchema,
  generateMealsResponseSchema,
} from "@/lib/validation";
import { GenerateMealsParams } from "@/types";
import { getRegionalConfig } from "@/lib/geolocation";
import { rateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic();

/**
 * Sanitizes user input to prevent prompt injection
 * Removes control characters and limits length
 */
function sanitizeInput(input: string, maxLength: number = 100): string {
  return input
    .replace(/[\n\r\t]/g, " ") // Remove newlines and tabs
    .replace(/[^\w\s,.-]/g, "") // Keep only alphanumeric, spaces, commas, dots, dashes
    .trim()
    .slice(0, maxLength);
}

function buildPrompt(params: GenerateMealsParams): string {
  const {
    season,
    mealTypes,
    budget,
    householdSize,
    dietaryRequirements = [],
    excludeIngredients = [],
    countryCode,
    city,
    region,
    latitude,
    longitude,
  } = params;

  // Get regional configuration based on country
  const regionalConfig = getRegionalConfig(countryCode);

  // Build precise location name with sanitized inputs
  let locationName = regionalConfig.displayName;
  if (city && region) {
    locationName = `${sanitizeInput(city)}, ${sanitizeInput(region)}`;
  } else if (city) {
    locationName = sanitizeInput(city);
  } else if (region) {
    locationName = sanitizeInput(region);
  }

  // Add coordinate information for hyper-local context (validate coordinates)
  const coordinateContext =
    latitude &&
    longitude &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
      ? `\n- User location coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (use this for hyper-local ingredient availability)`
      : "";

  const budgetDescriptions = {
    1: "economic (budget-friendly ingredients, keeping costs low)",
    2: "mid-range (good quality everyday ingredients, balanced cost)",
    3: "fancy (premium ingredients, special occasion worthy)",
  };

  // Sanitize user-provided arrays
  const safeDietaryRequirements = dietaryRequirements.map((req) =>
    sanitizeInput(req, 50)
  );
  const safeExcludeIngredients = excludeIngredients.map((ing) =>
    sanitizeInput(ing, 50)
  );

  return `Generate exactly 10 delicious meal suggestions for home cooks in ${locationName}. These should be the kind of trusted recipes passed between friends - tried, tested, and absolutely tasty.

CONTEXT:
- Current season: ${season}
- Meal types needed: ${mealTypes.join(", ")}
- Budget level: ${budgetDescriptions[budget]}
- Servings per meal: ${householdSize}
- Dietary requirements: ${safeDietaryRequirements.length > 0 ? safeDietaryRequirements.join(", ") : "none"}
- Ingredients to avoid: ${safeExcludeIngredients.length > 0 ? safeExcludeIngredients.join(", ") : "none"}${coordinateContext}

SEASONAL INGREDIENTS TO PRIORITISE FOR ${season.toUpperCase()}:
${regionalConfig.seasonalIngredients[season]}

REQUIREMENTS:
1. Make these recipes TASTY - don't hold back on flavour! Use herbs, spices, garlic, ginger, and aromatics generously
2. Use fresh, seasonal produce from ${locationName} as the base, but enhance with spices and flavourings from anywhere
3. Base ingredients should be available in local supermarkets (${regionalConfig.supermarkets})
4. Match the budget level exactly - be realistic about costs
5. Include a good mix of the requested meal types (${mealTypes.join(", ")})
6. Vary the cuisines and cooking styles - make it exciting!
7. Give recipes warm, friendly names (not overly fancy or clinical)
8. Write descriptions that sound inviting and personal, like recommending them to a friend
9. Be realistic about prep times for home cooks
10. Make instructions clear and encouraging - this should feel achievable and fun to cook

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "meals": [
    {
      "name": "string",
      "description": "string (1-2 sentences describing the dish)",
      "mealType": "breakfast" | "lunch" | "dinner",
      "priceLevel": 1 | 2 | 3,
      "prepTime": number (total time in minutes including cooking),
      "servings": ${householdSize},
      "seasons": ["${season}"],
      "ingredients": [
        {
          "name": "ingredient name",
          "quantity": "amount with unit (e.g., '2 medium', '200g', '1 tbsp')",
          "category": "produce" | "dairy" | "meat" | "fish" | "storecupboard" | "frozen" | "bakery"
        }
      ],
      "instructions": ["step 1", "step 2", "step 3", ...]
    }
  ]
}`;
}

export async function POST(request: Request) {
  try {
    // Check auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 requests per hour per user
    const rateLimitResult = rateLimit(user.id, 10, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset);
      return Response.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the maximum of ${rateLimitResult.limit} meal generations per hour. Please try again after ${resetDate.toLocaleTimeString()}.`,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Validate request body
    const body = await request.json();
    const parseResult = generateMealsParamsSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const params = parseResult.data;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildPrompt(params),
        },
      ],
    });

    // Extract text response
    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    // Parse and validate response
    let mealsData;
    try {
      mealsData = JSON.parse(content.text);
    } catch {
      console.error("Failed to parse Claude response:", content.text);
      return Response.json(
        { error: "Failed to parse meal suggestions" },
        { status: 500 }
      );
    }

    const validationResult = generateMealsResponseSchema.safeParse(mealsData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return Response.json(
        { error: "Invalid meal data received" },
        { status: 500 }
      );
    }

    // Add unique IDs to meals
    const mealsWithIds = validationResult.data.meals.map((meal, index) => ({
      ...meal,
      id: `meal-${Date.now()}-${index}`,
    }));

    return Response.json(
      { meals: mealsWithIds },
      {
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error generating meals:", error);
    return Response.json(
      { error: "Failed to generate meals" },
      { status: 500 }
    );
  }
}
