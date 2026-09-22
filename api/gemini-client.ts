import { GoogleGenAI } from "@google/genai";

export interface GeminiCallConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  fallbackModels?: string[];
}

export interface StructuredGeminiError {
  error: string;
  details: string;
  retryable: boolean;
  statusCode: number;
}

/**
 * Determines if an error returned by Gemini or the network is transient/retryable.
 */
export function isRetryableGeminiError(error: any): boolean {
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

/**
 * Normalizes any caught error into a structured, user-friendly response.
 */
export function formatGeminiError(error: any): StructuredGeminiError {
  const retryable = isRetryableGeminiError(error);
  const msg = String(error?.message || error || "");
  const lowerMsg = msg.toLowerCase();

  let statusCode = 500;
  let title = "Failed to Generate Travel Plan";
  let details = msg;

  if (
    lowerMsg.includes("api key") ||
    lowerMsg.includes("gemini_api_key") ||
    lowerMsg.includes("unauthenticated")
  ) {
    statusCode = 401;
    title = "Gemini API Key Missing or Invalid";
    details =
      "Please configure your valid GEMINI_API_KEY in the environment settings to use AI trip planning.";
  } else if (
    lowerMsg.includes("503") ||
    lowerMsg.includes("unavailable") ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("spikes in demand")
  ) {
    statusCode = 503;
    title = "Gemini AI Temporarily Experiencing High Demand";
    details =
      "The Gemini model is currently experiencing peak demand spikes. Spikes in demand are usually temporary. Please retry in a few moments.";
  } else if (
    lowerMsg.includes("429") ||
    lowerMsg.includes("resource_exhausted") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("rate limit")
  ) {
    statusCode = 429;
    title = "Gemini Request Quota or Rate Limit Reached";
    details =
      "Request rate limit was reached. Please wait a moment before trying again.";
  }

  return {
    error: title,
    details: details || "An error occurred while contacting the Gemini model.",
    retryable,
    statusCode,
  };
}

/**
 * Executes a Gemini generateContent request with exponential backoff and optional model fallback.
 */
export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  options: GeminiCallConfig = {}
): Promise<any> {
  const maxRetries = options.maxRetries ?? 3;
  let delayMs = options.initialDelayMs ?? 1500;

  // Use configured model from environment, fallback to gemini-2.5-flash
  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const primaryModel = params.model || configuredModel;

  // Build candidate models list (starting with primary, then fallbacks if transient 503/429 occurs)
  const candidateModels = [
    primaryModel,
    ...(options.fallbackModels || ["gemini-2.5-flash", "gemini-flash-latest"]),
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
    const currentModel = candidateModels[mIdx];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: currentModel,
        });

        // Ensure text exists
        if (response && response.text) {
          return response;
        }
        throw new Error("No response content received from Gemini model.");
      } catch (err: any) {
        lastError = err;
        const retryable = isRetryableGeminiError(err);

        console.warn(
          `[Gemini API] Model "${currentModel}" attempt ${attempt + 1}/${maxRetries + 1} failed:`,
          err?.message || err
        );

        if (attempt < maxRetries && retryable) {
          // Exponential backoff with small random jitter
          const jitter = Math.random() * 300;
          await new Promise((r) => setTimeout(r, delayMs + jitter));
          delayMs = Math.min(delayMs * 1.8, 8000);
        } else {
          // If non-retryable error (e.g. invalid API key, invalid schema), abort immediately
          if (!retryable) {
            throw err;
          }
          // If retryable but exhausted attempts on this model, break to try next model in candidateModels
          break;
        }
      }
    }
  }

  throw lastError;
}
