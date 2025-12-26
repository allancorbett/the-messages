// Geolocation utilities for determining user location

export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  suburb?: string;
  postcode?: string;
}

export interface RegionalConfig {
  displayName: string;
  supermarkets: string;
  seasonalIngredients: {
    winter: string;
    spring: string;
    summer: string;
    autumn: string;
  };
}

// Regional configurations for different areas
export const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  // UK & Ireland
  UK: {
    displayName: "the UK",
    supermarkets: "Tesco, Sainsbury's, Aldi, Lidl, Co-op, Asda, Morrisons",
    seasonalIngredients: {
      winter: "Root vegetables (parsnips, carrots, swede, turnip, celeriac), brassicas (cabbage, kale, Brussels sprouts, cauliflower, broccoli), leeks, onions, potatoes, beetroot, beef, lamb, game (venison, pheasant), smoked fish (haddock, salmon), mussels, stored apples and pears",
      spring: "Early greens, spring onions, radishes, rhubarb, wild garlic, asparagus (late spring), lamb, trout, crab",
      summer: "Soft fruits (strawberries, raspberries, blackcurrants), broad beans, peas, courgettes, tomatoes, lettuce, cucumber, new potatoes, salmon, mackerel",
      autumn: "Apples, pears, plums, blackberries, squash, pumpkin, mushrooms, sweetcorn, game birds, venison, mussels",
    },
  },
  IE: {
    displayName: "Ireland",
    supermarkets: "SuperValu, Tesco, Lidl, Aldi, Dunnes Stores",
    seasonalIngredients: {
      winter: "Root vegetables (parsnips, carrots, turnip, celeriac), cabbage, kale, Brussels sprouts, cauliflower, leeks, potatoes, beetroot, Irish beef, lamb, game, smoked fish, mussels, apples",
      spring: "Early greens, spring onions, radishes, rhubarb, wild garlic, asparagus, lamb, salmon, crab",
      summer: "Strawberries, raspberries, broad beans, peas, courgettes, tomatoes, lettuce, new potatoes, salmon, mackerel",
      autumn: "Apples, blackberries, squash, pumpkin, mushrooms, sweetcorn, game birds, venison, mussels",
    },
  },
  // North America
  US: {
    displayName: "the US",
    supermarkets: "Whole Foods, Trader Joe's, Kroger, Safeway, Walmart, local farmers markets",
    seasonalIngredients: {
      winter: "Root vegetables (carrots, parsnips, turnips, sweet potatoes), winter squash, kale, Brussels sprouts, cabbage, citrus fruits (oranges, grapefruit), pomegranates, persimmons",
      spring: "Asparagus, peas, radishes, spring onions, strawberries, rhubarb, artichokes, fava beans, spring lamb",
      summer: "Tomatoes, corn, zucchini, bell peppers, eggplant, peaches, berries, melons, stone fruits, green beans, summer squash",
      autumn: "Apples, pears, pumpkins, winter squash, Brussels sprouts, sweet potatoes, cranberries, figs, grapes",
    },
  },
  CA: {
    displayName: "Canada",
    supermarkets: "Loblaws, Sobeys, Metro, Whole Foods, local farmers markets",
    seasonalIngredients: {
      winter: "Root vegetables (carrots, parsnips, turnips, beets), winter squash, cabbage, kale, stored apples, Canadian beef, pork, game meats",
      spring: "Asparagus, rhubarb, fiddleheads, spring greens, radishes, maple syrup (early spring), lamb",
      summer: "Berries (strawberries, blueberries, raspberries), tomatoes, corn, zucchini, bell peppers, peaches, cherries, green beans",
      autumn: "Apples, pears, pumpkins, squash, Brussels sprouts, cranberries, wild mushrooms, game meats",
    },
  },
  // Europe
  FR: {
    displayName: "France",
    supermarkets: "Carrefour, Auchan, Leclerc, Monoprix, local markets",
    seasonalIngredients: {
      winter: "Root vegetables (carrots, parsnips, turnips, celeriac), endive, leeks, cabbage, cauliflower, citrus, chestnuts, game meats, oysters",
      spring: "Asparagus, artichokes, radishes, spring onions, peas, strawberries, lamb, spring greens",
      summer: "Tomatoes, zucchini, eggplant, peppers, melons, peaches, apricots, cherries, green beans, fresh herbs",
      autumn: "Mushrooms (cèpes, girolles), squash, grapes, figs, pears, chestnuts, game birds, shellfish",
    },
  },
  DE: {
    displayName: "Germany",
    supermarkets: "EDEKA, REWE, Aldi, Lidl, local markets",
    seasonalIngredients: {
      winter: "Root vegetables (carrots, parsnips, turnips, celeriac), cabbage (white, red, savoy), kale, Brussels sprouts, stored apples, pork, game meats",
      spring: "Asparagus (white and green), radishes, spring onions, rhubarb, new potatoes, strawberries, lamb",
      summer: "Tomatoes, cucumbers, peppers, zucchini, berries, stone fruits, new potatoes, fresh herbs",
      autumn: "Apples, pears, plums, pumpkins, mushrooms, grapes, cabbage, Brussels sprouts, game meats",
    },
  },
  // Australia & NZ (opposite seasons)
  AU: {
    displayName: "Australia",
    supermarkets: "Woolworths, Coles, IGA, local markets",
    seasonalIngredients: {
      winter: "Root vegetables, brassicas (broccoli, cauliflower), citrus fruits, stone fruits (in late winter), avocados, rhubarb",
      spring: "Asparagus, artichokes, peas, strawberries, cherries, lamb, spring greens",
      summer: "Tomatoes, stone fruits (peaches, nectarines, plums), berries, mangoes, melons, corn, zucchini, eggplant",
      autumn: "Apples, pears, figs, grapes, pumpkins, sweet potatoes, mushrooms, Brussels sprouts",
    },
  },
  NZ: {
    displayName: "New Zealand",
    supermarkets: "Countdown, New World, Pak'nSave, local markets",
    seasonalIngredients: {
      winter: "Root vegetables, citrus fruits, kiwifruit, feijoas, brassicas, New Zealand lamb, beef",
      spring: "Asparagus, spring lamb, strawberries, peas, artichokes, new potatoes",
      summer: "Stone fruits, berries, tomatoes, corn, zucchini, eggplant, peppers, cherries, apricots",
      autumn: "Apples, pears, figs, grapes, pumpkins, kumara (sweet potato), mushrooms, feijoas",
    },
  },
};

// Fallback configuration for unknown regions
export const DEFAULT_CONFIG: RegionalConfig = {
  displayName: "your area",
  supermarkets: "your local supermarkets and farmers markets",
  seasonalIngredients: {
    winter: "Root vegetables, winter squash, brassicas (cabbage, kale, Brussels sprouts), citrus fruits, stored apples and pears, hearty greens",
    spring: "Asparagus, peas, radishes, spring greens, strawberries, rhubarb, new potatoes, spring lamb",
    summer: "Tomatoes, corn, zucchini, peppers, eggplant, berries, stone fruits, melons, cucumbers, fresh herbs",
    autumn: "Apples, pears, pumpkins, squash, mushrooms, grapes, root vegetables, Brussels sprouts",
  },
};

/**
 * Gets user's precise location using browser Geolocation API
 * Falls back to IP-based geolocation if permission denied or unavailable
 */
export async function getUserLocation(): Promise<LocationData | null> {
  // Try browser geolocation first (requires HTTPS and user permission)
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          });
        }
      );

      // Reverse geocode to get location details
      const locationData = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      if (locationData) {
        return locationData;
      }
    } catch (error) {
      console.warn("Browser geolocation failed, falling back to IP:", error);
    }
  }

  // Fallback to IP-based geolocation
  return getUserLocationFromIP();
}

/**
 * Reverse geocodes coordinates to location data using Nominatim (OpenStreetMap)
 */
async function reverseGeocode(
  lat: number,
  lon: number
): Promise<LocationData | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TheMessages-MealPlanner/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Reverse geocoding failed:", response.status);
      return null;
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      latitude: lat,
      longitude: lon,
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality,
      suburb: address.suburb || address.neighbourhood,
      region: address.state || address.county || address.region,
      country: address.country,
      countryCode: address.country_code?.toUpperCase() || "US",
      postcode: address.postcode,
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

/**
 * Fetches user location data from IP geolocation API
 * Uses ipapi.co free tier (no API key required)
 */
async function getUserLocationFromIP(): Promise<LocationData | null> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch location:", response.status);
      return null;
    }

    const data = await response.json();

    return {
      country: data.country_name || "Unknown",
      countryCode: data.country_code || "US",
      region: data.region || "",
      city: data.city,
      continent: data.continent_code,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}

/**
 * Gets regional configuration based on country code
 */
export function getRegionalConfig(countryCode?: string): RegionalConfig {
  if (!countryCode) return DEFAULT_CONFIG;

  const config = REGIONAL_CONFIGS[countryCode.toUpperCase()];
  return config || DEFAULT_CONFIG;
}

/**
 * Formats location for display
 */
export function formatLocation(location: LocationData | null): string {
  if (!location) return "your area";

  // Use precise location if available
  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  }

  if (location.city) {
    return location.city;
  }

  if (location.region) {
    return location.region;
  }

  const config = getRegionalConfig(location.countryCode);
  return config.displayName;
}
