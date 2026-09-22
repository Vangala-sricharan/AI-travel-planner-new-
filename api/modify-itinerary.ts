import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { generateContentWithRetry, formatGeminiError, DEFAULT_GEMINI_MODEL } from "./gemini-client.ts";

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
      return res.status(401).json({
        error: "API key is missing.",
        details: "Please provide either GEMINI_API_KEY or VITE_GEMINI_API_KEY in your environment variables.",
        retryable: false
      });
    }

    const { currentPlan, instruction, inputs } = req.body;
    if (!currentPlan || !instruction) {
      return res.status(400).json({
        error: "Missing parameters.",
        details: "Both currentPlan and instruction are required to modify an itinerary.",
        retryable: false
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const prompt = `
      You are an expert travel consultant. Modify the following travel plan according to this user instruction: "${instruction}".
      
      Original travel parameters from user form (for context):
      - Style: ${inputs?.travelStyle || "Balanced"}
      - Budget: ₹${inputs?.budget || "Standard"} (Indian Rupees / INR)
      - Travelers: ${inputs?.travelers || "1 person"}
      - Mode: ${inputs?.transportation || "Any"}
      - Accommodations: ${inputs?.accommodation || "Comfortable"}

      IMPORTANT CURRENCY REQUIREMENT:
      All costs, ticket prices, accommodation, food, activities, and budget items MUST be calculated and stated strictly in Indian Rupees (INR / ₹). Store all ticket prices and cost values in INR. Never use US Dollars.

      Current Travel Plan:
      ${JSON.stringify(currentPlan)}

      Provide the updated travel plan as a strict JSON object satisfying the exact same schema. 
      Adjust the itinerary activities, weather, budget breakdown, packing checklist, or map pins as requested by the user, and keep all unchanged elements intact. Ensure any new key coordinates added to mapPins have highly accurate latitude and longitude.
    `;

    // Strict JSON schema matching the travel plan structure
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
            rainfallChance: { type: Type.STRING },
            packingAdvice: { type: Type.STRING }
          },
          required: ["forecast", "temperature", "rainfallChance", "packingAdvice"]
        },
        budgetBreakdown: {
          type: Type.OBJECT,
          properties: {
            accommodation: { type: Type.NUMBER, description: "Total budget for accommodation in Indian Rupees (₹)" },
            food: { type: Type.NUMBER, description: "Total budget for food in Indian Rupees (₹)" },
            travel: { type: Type.NUMBER, description: "Total budget for transportation in Indian Rupees (₹)" },
            activities: { type: Type.NUMBER, description: "Total budget for activities in Indian Rupees (₹)" },
            shopping: { type: Type.NUMBER, description: "Total budget for shopping/souvenirs in Indian Rupees (₹)" },
            emergency: { type: Type.NUMBER, description: "Emergency fund in Indian Rupees (₹)" },
            taxes: { type: Type.NUMBER, description: "Local taxes/fees in Indian Rupees (₹)" },
            total: { type: Type.NUMBER, description: "Sum of all cost categories in Indian Rupees (₹)" }
          },
          required: [
            "accommodation",
            "food",
            "travel",
            "activities",
            "shopping",
            "emergency",
            "taxes",
            "total"
          ]
        },
        packingList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              item: { type: Type.STRING },
              category: { type: Type.STRING },
              completed: { type: Type.BOOLEAN }
            },
            required: ["id", "item", "category", "completed"]
          }
        },
        mapPins: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              type: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["id", "name", "lat", "lng", "type", "description"]
          }
        },
        itinerary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              theme: { type: Type.STRING },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    travelTime: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER, description: "Estimated activity cost in Indian Rupees (₹)" },
                    period: { type: Type.STRING }
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

    const selectedModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    const response = await generateContentWithRetry(ai, {
      model: selectedModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert travel consultant and AI assistant. Your task is to update the provided travel plan strictly according to the user's modifications while maintaining the identical JSON schema. Only modify what is requested. Keep everything else intact. All costs and prices must remain in Indian Rupees (INR/₹). Never return conversational text. Return only the updated JSON object."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini.");
    }

    const modifiedPlan = JSON.parse(text);
    return res.status(200).json(modifiedPlan);
  } catch (error: any) {
    console.error("Gemini API modification error:", error);
    const formatted = formatGeminiError(error);
    return res.status(formatted.statusCode).json({
      error: formatted.error,
      details: formatted.details,
      retryable: formatted.retryable
    });
  }
}
