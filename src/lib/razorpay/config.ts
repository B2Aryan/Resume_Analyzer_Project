/**
 * Razorpay Configuration
 * 
 * Backend configuration for Razorpay Test Mode integration.
 * IMPORTANT: This file runs ONLY on the server side.
 */

import Razorpay from "razorpay";

/**
 * Get Razorpay instance (server-side only)
 * Uses environment variables that are NOT exposed to the client
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials not configured. Please set VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Razorpay configuration constants
 */
export const RAZORPAY_CONFIG = {
  currency: "INR",
  // Test mode limits
  minAmount: 100, // ₹1.00 (in paise)
  maxAmount: 50000000, // ₹5,00,000 (in paise)
} as const;
