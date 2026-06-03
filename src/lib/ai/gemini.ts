import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI Client Configuration
 * 
 * This module provides a reusable Gemini AI client instance
 * configured with the API key from environment variables.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Custom error class for Gemini-related errors
 */
export class GeminiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Validates that the Gemini API key is configured
 * @throws {GeminiError} If API key is missing
 */
function validateApiKey(): string {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new GeminiError(
      'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.'
    );
  }
  return GEMINI_API_KEY;
}

/**
 * Initialize and export the Gemini AI client
 * 
 * The client is lazily initialized on first access to allow
 * for proper error handling and avoid initialization errors
 * during module import.
 */
let geminiClient: GoogleGenAI | null = null;

/**
 * Get the Gemini AI client instance
 * @returns {GoogleGenAI} Configured Gemini AI client
 * @throws {GeminiError} If API key is not configured
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = validateApiKey();
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Response from Gemini API
 */
export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Test function to verify Gemini API connection
 * 
 * Sends a simple prompt to Gemini and returns the response.
 * This function is useful for testing the API configuration
 * and connection.
 * 
 * @returns {Promise<GeminiResponse>} Response containing the text "CONNECTED" or error
 * 
 * @example
 * ```typescript
 * const result = await testGemini();
 * if (result.success) {
 *   console.log('Gemini connected:', result.text);
 * } else {
 *   console.error('Connection failed:', result.error);
 * }
 * ```
 */
export async function testGemini(): Promise<GeminiResponse> {
  try {
    // Get the Gemini client instance
    const ai = getGeminiClient();

    // Send a simple test prompt
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with only the word CONNECTED',
    });

    const text = response.text || '';

    return {
      text: text.trim(),
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      text: '',
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Export the client getter as default
 */
export default getGeminiClient;
