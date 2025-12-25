import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  generateMealsParamsSchema,
  generateMealsResponseSchema,
} from "@/lib/validation";
import { GenerateMealsParams } from "@/types";
import { getRegionalConfig } from "@/lib/geolocation";

const anthropic = new Anthropic();

function buildPrompt(params: GenerateMealsParams): string {
  const {
    season,
    mealTypes,
    budget,
    householdSize,
    dietaryRequirements = [],
    excludeIngredients = [],
    countryCode,
  } = params;

  // Get regional configuration based on country
  const regionalConfig = getRegionalConfig(countryCode);
  const locationName = regionalConfig.displayName;

  const budgetDescriptions = {
    1: "economic (budget-friendly ingredients, keeping costs low)",
    2: "mid-range (good quality everyday ingredients, balanced cost)",
    3: "fancy (premium ingredients, special occasion worthy)",
  };

  return `You are a local meal planning assistant. Generate exactly 10 meal suggestions that would appeal to home cooks in ${locationName}.

CONTEXT:
- Current season: ${season}
- Meal types needed: ${mealTypes.join(", ")}
- Budget level: ${budgetDescriptions[budget]}
- Servings per meal: ${householdSize}
- Dietary requirements: ${dietaryRequirements.length > 0 ? dietaryRequirements.join(", ") : "none"}
- Ingredients to avoid: ${excludeIngredients.length > 0 ? excludeIngredients.join(", ") : "none"}

SEASONAL INGREDIENTS TO PRIORITISE FOR ${season.toUpperCase()}:
${regionalConfig.seasonalIngredients[season]}

REQUIREMENTS:
1. Use ingredients commonly available in local supermarkets (${regionalConfig.supermarkets})
2. Prioritise seasonal produce for ${season} in ${locationName}
3. Match the budget level exactly - be realistic about costs
4. Include a good mix of the requested meal types (${mealTypes.join(", ")})
5. Vary the cuisines and cooking styles - don't make everything similar
6. Be realistic about prep times for home cooks
7. Make instructions clear and achievable for everyday cooking

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

    return Response.json({ meals: mealsWithIds });
  } catch (error) {
    console.error("Error generating meals:", error);
    return Response.json(
      { error: "Failed to generate meals" },
      { status: 500 }
    );
  }
}
