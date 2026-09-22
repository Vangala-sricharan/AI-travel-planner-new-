import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// Configurable model with safe default and fallback chain
const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

const DEPRECATED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
  "gemini-pro"
]);

function isModelNotFoundError(error: any): boolean {
  if (!error) return false;
  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    (error.response && error.response.status);
  if (status === 404 || status === "NOT_FOUND") return true;

  const msg = String(error.message || error.statusText || error).toLowerCase();
  return (
    msg.includes("404") ||
    msg.includes("not_found") ||
    msg.includes("no longer available") ||
    msg.includes("not found") ||
    msg.includes("is not supported") ||
    msg.includes("unknown model")
  );
}

function isQuotaExceededError(error: any): boolean {
  if (!error) return false;
  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    (error.response && error.response.status);
  if (status === 429 || status === "RESOURCE_EXHAUSTED") return true;

  const msg = String(error.message || error.statusText || error).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota exceeded") ||
    msg.includes("rate limit")
  );
}

function isRetryableGeminiError(error: any): boolean {
  if (!error) return false;
  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    (error.response && error.response.status);

  if (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    status === "DEADLINE_EXCEEDED"
  ) {
    return true;
  }

  const msg = String(error.message || error.statusText || error).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("resource_exhausted") ||
    msg.includes("high demand") ||
    msg.includes("spikes in demand") ||
    msg.includes("temporarily") ||
    msg.includes("busy") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("try again later") ||
    msg.includes("socket hang up") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout")
  );
}

function formatGeminiError(error: any): { error: string; code: string; details: string; retryable: boolean; statusCode: number } {
  const retryable = isRetryableGeminiError(error);
  const msg = String(error?.message || error || "");
  const lowerMsg = msg.toLowerCase();

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let title = "Failed to modify travel plan.";
  let details = msg;

  if (
    lowerMsg.includes("api key") ||
    lowerMsg.includes("gemini_api_key") ||
    lowerMsg.includes("unauthenticated")
  ) {
    statusCode = 401;
    code = "INVALID_API_KEY";
    title = "Gemini API key is invalid or unauthenticated.";
    details = "Please verify your GEMINI_API_KEY environment variable.";
  } else if (
    lowerMsg.includes("503") ||
    lowerMsg.includes("unavailable") ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("spikes in demand")
  ) {
    statusCode = 503;
    code = "GEMINI_UNAVAILABLE";
    title = "Gemini is temporarily unavailable.";
    details = "The model is currently experiencing high demand. Spikes in demand are usually temporary. Please retry in a few moments.";
  } else if (
    lowerMsg.includes("429") ||
    lowerMsg.includes("resource_exhausted") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("rate limit")
  ) {
    statusCode = 429;
    code = "RATE_LIMITED";
    title = "Gemini rate limit or quota reached.";
    details = "The request rate limit was reached. Please wait a moment before trying again.";
  } else if (isModelNotFoundError(error)) {
    statusCode = 502;
    code = "MODEL_UNAVAILABLE";
    title = "Gemini model is unavailable.";
    details = "The requested Gemini model is discontinued or not found.";
  }

  return {
    error: title,
    code,
    details: details || "An error occurred while contacting the Gemini model.",
    retryable,
    statusCode,
  };
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  options: { maxRetries?: number; initialDelayMs?: number } = {}
): Promise<any> {
  const maxRetriesPerModel = options.maxRetries ?? 1;
  let delayMs = options.initialDelayMs ?? 1000;

  let rawModel = (params.model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();

  if (DEPRECATED_MODELS.has(rawModel)) {
    console.warn(`[Gemini API] Model "${rawModel}" is deprecated. Automatically upgrading to "${DEFAULT_GEMINI_MODEL}".`);
    rawModel = DEFAULT_GEMINI_MODEL;
  }

  const fallbackChain = [
    DEFAULT_GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest"
  ];

  const candidateModels = [
    rawModel,
    ...fallbackChain,
  ].filter((m, idx, arr) => m && !DEPRECATED_MODELS.has(m) && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
    const currentModel = candidateModels[mIdx];
    const isLastModel = mIdx === candidateModels.length - 1;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: currentModel,
        });

        if (response && response.text) {
          return response;
        }
        throw new Error("No response content received from Gemini model.");
      } catch (err: any) {
        lastError = err;
        const modelNotFound = isModelNotFoundError(err);
        const quotaExceeded = isQuotaExceededError(err);
        const retryable = isRetryableGeminiError(err);

        console.warn(
          `[Gemini API] Model "${currentModel}" attempt ${attempt + 1}/${maxRetriesPerModel + 1} failed:`,
          err?.message || err
        );

        if (modelNotFound) {
          if (!isLastModel) {
            console.warn(`[Gemini API] Model "${currentModel}" unavailable (404). Trying next fallback: "${candidateModels[mIdx + 1]}"...`);
            break;
          }
          throw err;
        }

        if (quotaExceeded) {
          if (!isLastModel) {
            console.warn(`[Gemini API] Model "${currentModel}" quota reached (429). Trying next fallback: "${candidateModels[mIdx + 1]}"...`);
            break;
          }
        }

        if (attempt < maxRetriesPerModel && retryable && !quotaExceeded) {
          const jitter = Math.random() * 200;
          await new Promise((r) => setTimeout(r, delayMs + jitter));
          delayMs = Math.min(delayMs * 1.5, 4000);
        } else {
          if (retryable && !isLastModel) {
            console.warn(`[Gemini API] Switching to next fallback model: "${candidateModels[mIdx + 1]}"...`);
            break;
          }
          throw err;
        }
      }
    }
  }

  throw lastError;
}

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
      code: formatted.code,
      details: formatted.details,
      retryable: formatted.retryable
    });
  }
}
