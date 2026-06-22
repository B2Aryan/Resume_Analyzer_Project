/**
 * Razorpay Order Creation API
 * 
 * Creates a Razorpay order for payment processing.
 * This runs on the backend and uses the secret key.
 * 
 * SECURITY: Pricing is defined server-side only. Frontend cannot manipulate prices.
 */

import { json } from "@tanstack/start";
import type { APIEvent } from "@tanstack/start";
import { getRazorpayInstance, RAZORPAY_CONFIG } from "@/lib/razorpay/config";

// Backend-only pricing table (NEVER exposed to frontend)
const PRICING = {
  premium_upgrade: 499, // ₹499 for lifetime premium access
} as const;

type ProductId = keyof typeof PRICING;

interface CreateOrderRequest {
  productId: string; // Product identifier, not amount
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export async function POST({ request }: APIEvent): Promise<Response> {
  try {
    const body = (await request.json()) as CreateOrderRequest;
    const { productId, currency = RAZORPAY_CONFIG.currency, receipt, notes } = body;

    // Validation: Check if product exists
    if (!productId || !(productId in PRICING)) {
      return json<CreateOrderResponse>(
        { success: false, error: "Invalid product" },
        { status: 400 }
      );
    }

    // Get price from backend (user CANNOT manipulate this)
    const amount = PRICING[productId as ProductId];
    const amountInPaise = Math.round(amount * 100);

    // Validate amount limits (should never fail with backend pricing)
    if (amountInPaise < RAZORPAY_CONFIG.minAmount) {
      return json<CreateOrderResponse>(
        {
          success: false,
          error: `Amount must be at least ₹${RAZORPAY_CONFIG.minAmount / 100}`,
        },
        { status: 400 }
      );
    }

    if (amountInPaise > RAZORPAY_CONFIG.maxAmount) {
      return json<CreateOrderResponse>(
        {
          success: false,
          error: `Amount must not exceed ₹${RAZORPAY_CONFIG.maxAmount / 100}`,
        },
        { status: 400 }
      );
    }

    // Get Razorpay instance (uses secret key from environment)
    const razorpay = getRazorpayInstance();

    // Create Razorpay order with backend-defined price
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        productId, // Store product ID for verification
        expectedAmount: amountInPaise.toString(), // Store expected amount
      },
    });

    console.log("[Razorpay] Order created:", order.id, "Product:", productId, "Amount:", amount);

    return json<CreateOrderResponse>({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("[Razorpay] Order creation failed:", error);

    return json<CreateOrderResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
