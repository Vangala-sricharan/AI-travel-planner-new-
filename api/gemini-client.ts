import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

const DEPRECATED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
  "gemini-pro"
]);

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
 * Determines if an error is due to a deprecated, retired, or unfound model.
 */
export function isModelNotFoundError(error: any): boolean {
  if (!error) return false;

  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    (error.response && error.response.status);

  if (status === 404 || status === "NOT_FOUND") {
    return true;
  }

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

/**
 * Determines if an error is due to quota exhaustion or rate limits.
 */
export function isQuotaExceededError(error: any): boolean {
  if (!error) return false;

  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    (error.response && error.response.status);

  if (status === 429 || status === "RESOURCE_EXHAUSTED") {
    return true;
  }

  const msg = String(error.message || error.statusText || error).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota exceeded") ||
    msg.includes("rate limit")
  );
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
  } else if (isModelNotFoundError(error)) {
    statusCode = 502;
    title = "Gemini Model Unavailable";
    details =
      "The configured Gemini model is discontinued or unavailable. Using latest available models.";
  }

  return {
    error: title,
    details: details || "An error occurred while contacting the Gemini model.",
    retryable,
    statusCode,
  };
}

/**
 * Executes a Gemini generateContent request with smart retry and candidate model fallback.
 */
export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  options: GeminiCallConfig = {}
): Promise<any> {
  const maxRetriesPerModel = options.maxRetries ?? 1;
  let delayMs = options.initialDelayMs ?? 1000;

  // Use configured model from environment, or default to current recommended model
  let rawModel = (params.model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();

  // If a known deprecated model is passed, automatically upgrade to DEFAULT_GEMINI_MODEL
  if (DEPRECATED_MODELS.has(rawModel)) {
    console.warn(
      `[Gemini API] Model "${rawModel}" is deprecated. Automatically upgrading to "${DEFAULT_GEMINI_MODEL}".`
    );
    rawModel = DEFAULT_GEMINI_MODEL;
  }

  // Ordered fallback models: high availability & throughput
  const fallbackChain = [
    DEFAULT_GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest"
  ];

  // Build unique candidates list
  const candidateModels = [
    rawModel,
    ...(options.fallbackModels || fallbackChain),
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

        // Ensure text exists
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

        // If model retired/404, advance to next candidate model immediately without delay
        if (modelNotFound) {
          if (!isLastModel) {
            console.warn(
              `[Gemini API] Model "${currentModel}" unavailable (404). Trying next fallback: "${candidateModels[mIdx + 1]}"...`
            );
            break;
          }
          throw err;
        }

        // If per-model quota exceeded (429), advance to next candidate model immediately without waiting 60s
        if (quotaExceeded) {
          if (!isLastModel) {
            console.warn(
              `[Gemini API] Model "${currentModel}" hit per-model quota. Trying alternative model: "${candidateModels[mIdx + 1]}"...`
            );
            break;
          }
        }

        // If transient 503 / 500 error and retry attempts remain on this model, backoff briefly
        if (attempt < maxRetriesPerModel && retryable && !quotaExceeded) {
          const jitter = Math.random() * 200;
          await new Promise((r) => setTimeout(r, delayMs + jitter));
          delayMs = Math.min(delayMs * 1.5, 4000);
        } else {
          // If attempts exhausted on this model, try next candidate model
          if (retryable && !isLastModel) {
            console.warn(
              `[Gemini API] Switching to next fallback model: "${candidateModels[mIdx + 1]}"...`
            );
            break;
          }
          // Non-retryable error or no more candidates left, throw
          throw err;
        }
      }
    }
  }

  throw lastError;
}
