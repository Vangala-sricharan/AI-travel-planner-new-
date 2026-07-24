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

    const { currentPlan, instruction, inputs } = req.body;
    if (!currentPlan || !instruction) {
      return res.status(400).json({
        error: "Missing parameters.",
        details: "Both currentPlan and instruction are required to modify an itinerary."
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
      - Budget: ${inputs?.budget || "Standard"} USD
      - Travelers: ${inputs?.travelers || "1 person"}
      - Mode: ${inputs?.transportation || "Any"}
      - Accommodations: ${inputs?.accommodation || "Comfortable"}

      Current Travel Plan:
      ${JSON.stringify(currentPlan)}

      Provide the updated travel plan as a strict JSON object satisfying the exact same schema. 
      Adjust the itinerary activities, weather, budget breakdown, packing checklist, or map pins as requested by the user, and keep all unchanged elements intact. Ensure any new key coordinates added to mapPins have highly accurate latitude and longitude.
    `;

    // Use the same response schema to ensure exact structural typing
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
            accommodation: { type: Type.NUMBER },
            food: { type: Type.NUMBER },
            travel: { type: Type.NUMBER },
            activities: { type: Type.NUMBER },
            shopping: { type: Type.NUMBER },
            emergency: { type: Type.NUMBER },
            taxes: { type: Type.NUMBER },
            total: { type: Type.NUMBER }
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
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
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
                    estimatedCost: { type: Type.NUMBER },
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert travel consultant and AI assistant. Your task is to update the provided travel plan strictly according to the user's modifications while maintaining the identical JSON schema. Only modify what is requested. Keep everything else intact. Never return conversational text. Return only the updated JSON object."
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
    return res.status(500).json({
      error: "Failed to modify travel plan.",
      details: error.message || error.toString()
    });
  }
}
