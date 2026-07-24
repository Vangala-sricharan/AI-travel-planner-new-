import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      details: "Only POST requests are accepted."
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "API key is missing.",
        details: "Please provide either GEMINI_API_KEY or VITE_GEMINI_API_KEY in your environment variables."
      });
    }

    const {
      destination,
      currentLocation,
      budget,
      travelers,
      days,
      travelStyle,
      transportation,
      accommodation,
      foodPreference,
      weatherPreference,
      interests,
      accessibility,
      specialRequirements
    } = req.body;

    // Validate required inputs
    if (!destination || !days || !budget) {
      return res.status(400).json({
        error: "Missing fields.",
        details: "Destination, number of days, and budget are required fields."
      });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // Construct highly detailed prompt
    const prompt = `
      Create a comprehensive travel itinerary for:
      - Destination: ${destination}
      - Current Starting Location: ${currentLocation || "Not specified"}
      - Budget level or total allocation: ${budget} USD
      - Travelers: ${travelers || "1 person"}
      - Trip Duration: ${days} days
      - Travel Style: ${travelStyle || "Balanced"}
      - Mode of Transportation preferred: ${transportation || "Any"}
      - Accommodation type preference: ${accommodation || "Comfortable"}
      - Food Preference: ${foodPreference || "Local dishes"}
      - Weather preference: ${weatherPreference || "Any"}
      - Core Interests: ${interests ? interests.join(", ") : "Sightseeing, food, nature"}
      - Accessibility needs: ${accessibility || "None"}
      - Special requirements or constraints: ${specialRequirements || "None"}

      Generate the response as a strict JSON object that exactly satisfies the required schema. Ensure the geographic coordinates (lat and lng) for all hotels, restaurants, and attractions in mapPins are as accurate as possible for the actual city or region of ${destination}, and that the Day-by-Day itinerary activities represent a high-fidelity travel experience with reasonable prices and local recommendations.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        destination: { type: Type.STRING },
        currency: { type: Type.STRING },
        language: { type: Type.STRING },
        emergencyNumbers: {
          type: Type.OBJECT,
          properties: {
            police: { type: Type.STRING },
            medical: { type: Type.STRING },
            general: { type: Type.STRING }
          },
          required: ["police", "medical", "general"]
        },
        safetyAdvice: { type: Type.STRING },
        travelTips: { type: Type.STRING },
        weather: {
          type: Type.OBJECT,
          properties: {
            forecast: { type: Type.STRING },
            temperature: { type: Type.STRING },
            humidity: { type: Type.STRING },
            wind: { type: Type.STRING }
          },
          required: ["forecast", "temperature", "humidity", "wind"]
        },
        budgetBreakdown: {
          type: Type.OBJECT,
          properties: {
            accommodation: { type: Type.NUMBER, description: "Total budget for accommodation in USD" },
            food: { type: Type.NUMBER, description: "Total budget for food in USD" },
            travel: { type: Type.NUMBER, description: "Total budget for transportation in USD" },
            activities: { type: Type.NUMBER, description: "Total budget for activities in USD" },
            shopping: { type: Type.NUMBER, description: "Total budget for shopping/souvenirs in USD" },
            emergency: { type: Type.NUMBER, description: "Emergency fund in USD" },
            taxes: { type: Type.NUMBER, description: "Local taxes/fees in USD" },
            total: { type: Type.NUMBER, description: "Sum of all cost categories in USD" }
          },
          required: ["accommodation", "food", "travel", "activities", "shopping", "emergency", "taxes", "total"]
        },
        packingList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              item: { type: Type.STRING },
              category: { type: Type.STRING, description: "Category like 'Clothing', 'Electronics', 'Documents', etc." },
              completed: { type: Type.BOOLEAN, description: "Always start false" }
            },
            required: ["id", "item", "category", "completed"]
          }
        },
        mapPins: {
          type: Type.ARRAY,
          description: "A list of realistic key coordinates to pin on the map. Include at least 2 hotel suggestions, 3 restaurants, and 4 major attractions.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, description: "Must be 'hotel', 'restaurant', or 'attraction'" },
              lat: { type: Type.NUMBER, description: "Accurate latitude for this location" },
              lng: { type: Type.NUMBER, description: "Accurate longitude for this location" },
              description: { type: Type.STRING }
            },
            required: ["name", "type", "lat", "lng", "description"]
          }
        },
        itinerary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              theme: { type: Type.STRING, description: "Theme for the day, e.g., 'Historical Exploration'" },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "Estimated time, e.g., '09:00 AM'" },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    travelTime: { type: Type.STRING, description: "Time to travel here from previous stop, e.g., '15 mins walking'" },
                    estimatedCost: { type: Type.NUMBER, description: "Estimated activity cost in USD" },
                    period: { type: Type.STRING, description: "Must be 'morning', 'afternoon', 'evening', or 'night'" }
                  },
                  required: ["time", "description", "location", "travelTime", "estimatedCost", "period"]
                }
              }
            },
            required: ["day", "theme", "activities"]
          }
        }
      },
      required: [
        "destination",
        "currency",
        "language",
        "emergencyNumbers",
        "safetyAdvice",
        "travelTips",
        "weather",
        "budgetBreakdown",
        "packingList",
        "mapPins",
        "itinerary"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert travel consultant and geographer who helps plan highly personalized travel itineraries with accurate mapping data and packing suggestions. You generate valid and perfectly-formed JSON that perfectly conforms to the requested schema. You never invent fake coordinates; you look up realistic coordinates for the destination to ensure Leaflet can map them correctly."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini.");
    }

    const travelPlan = JSON.parse(text);
    return res.status(200).json(travelPlan);
  } catch (error: any) {
    console.error("Gemini API generation error:", error);
    return res.status(500).json({
      error: "Failed to generate travel plan.",
      details: error.message || error.toString()
    });
  }
}
