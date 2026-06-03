import Groq from "groq-sdk";

/**
 * Groq AI Client Configuration
 *
 * Provides a reusable Groq client instance configured with the API key
 * from environment variables. Used as a fallback when Gemini is unavailable.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/** Preferred model for structured JSON resume analysis */
export const GROQ_ANALYSIS_MODEL = "llama-3.3-70b-versatile";

/**
 * Custom error class for Groq-related errors
 */
export class GroqError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "GroqError";
  }
}

/**
 * Validates that the Groq API key is configured
 * @throws {GroqError} If API key is missing
 */
function validateApiKey(): string {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === "") {
    throw new GroqError(
      "Groq API key is not configured. Please set VITE_GROQ_API_KEY in your .env file."
    );
  }
  return GROQ_API_KEY;
}

let groqClient: Groq | null = null;

/**
 * Get the Groq AI client instance
 * @returns {Groq} Configured Groq client
 * @throws {GroqError} If API key is not configured
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = validateApiKey();
    groqClient = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return groqClient;
}

export default getGroqClient;
