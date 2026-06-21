import Groq from "groq-sdk";

/**
 * Groq AI Client Configuration with Multi-Key Failover
 *
 * Provides Groq client instances with automatic failover between primary and secondary API keys.
 * Failover chain: Primary Key → Secondary Key → Gemini (handled in analyzer.ts)
 *
 * Features:
 * - Automatic retry with secondary key on primary key failure
 * - Detailed logging of key usage and failures
 * - Backward compatibility with single key setup
 */

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
 * Groq API key type indicator
 */
export type GroqKeyType = "primary" | "secondary";

/**
 * Configuration for Groq API keys
 */
interface GroqKeyConfig {
  primary: string | null;
  secondary: string | null;
  hasPrimary: boolean;
  hasSecondary: boolean;
}

/**
 * Validates and retrieves Groq API keys from environment variables
 * Supports both new (PRIMARY/SECONDARY) and legacy (single key) configurations
 */
function getGroqKeyConfig(): GroqKeyConfig {
  // New configuration format
  const primary = import.meta.env.VITE_GROQ_API_KEY_PRIMARY?.trim() || null;
  const secondary = import.meta.env.VITE_GROQ_API_KEY_SECONDARY?.trim() || null;
  
  // Legacy configuration format (backward compatibility)
  const legacy = import.meta.env.VITE_GROQ_API_KEY?.trim() || null;
  
  // If no PRIMARY key, fall back to legacy key
  const primaryKey = primary || legacy;
  
  return {
    primary: primaryKey,
    secondary: secondary,
    hasPrimary: Boolean(primaryKey),
    hasSecondary: Boolean(secondary),
  };
}

/**
 * Validates that at least one Groq API key is configured
 * @throws {GroqError} If no API keys are configured
 */
function validateApiKeys(): void {
  const config = getGroqKeyConfig();
  if (!config.hasPrimary) {
    throw new GroqError(
      "Groq API key is not configured. Please set VITE_GROQ_API_KEY_PRIMARY (or VITE_GROQ_API_KEY for legacy) in your .env file."
    );
  }
}

// Client instances cache
let primaryClient: Groq | null = null;
let secondaryClient: Groq | null = null;

/**
 * Get a Groq AI client instance for the specified key type
 * @param keyType - Which key to use ("primary" or "secondary")
 * @returns {Groq | null} Configured Groq client or null if key not available
 */
export function getGroqClient(keyType: GroqKeyType = "primary"): Groq | null {
  const config = getGroqKeyConfig();
  
  if (keyType === "primary") {
    if (!config.hasPrimary) {
      console.warn("[Groq] Primary key not configured");
      return null;
    }
    
    if (!primaryClient) {
      console.log("[Groq] Initializing Primary Key client");
      primaryClient = new Groq({
        apiKey: config.primary!,
        dangerouslyAllowBrowser: true,
      });
    }
    return primaryClient;
  }
  
  if (keyType === "secondary") {
    if (!config.hasSecondary) {
      console.warn("[Groq] Secondary key not configured");
      return null;
    }
    
    if (!secondaryClient) {
      console.log("[Groq] Initializing Secondary Key client");
      secondaryClient = new Groq({
        apiKey: config.secondary!,
        dangerouslyAllowBrowser: true,
      });
    }
    return secondaryClient;
  }
  
  return null;
}

/**
 * Check if secondary Groq key is available
 */
export function hasSecondaryGroqKey(): boolean {
  const config = getGroqKeyConfig();
  return config.hasSecondary;
}

/**
 * Legacy function for backward compatibility
 * Returns the primary Groq client
 */
export default function getGroqClientLegacy(): Groq {
  validateApiKeys();
  const client = getGroqClient("primary");
  if (!client) {
    throw new GroqError("Failed to initialize Groq client");
  }
  return client;
}

