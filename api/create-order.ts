/**
 * Razorpay Order Creation API
 * 
 * Creates a Razorpay order for payment processing.
 * This runs on the backend and uses the secret key.
 * 
 * SECURITY: Pricing is defined server-side only. Frontend cannot manipulate prices.
 */

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = (await req.json()) as CreateOrderRequest;
    const { productId, currency = RAZORPAY_CONFIG.currency, receipt, notes } = body;

    // Validation: Check if product exists
    if (!productId || !(productId in PRICING)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid product" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get price from backend (user CANNOT manipulate this)
    const amount = PRICING[productId as ProductId];
    const amountInPaise = Math.round(amount * 100);

    // Validate amount limits (should never fail with backend pricing)
    if (amountInPaise < RAZORPAY_CONFIG.minAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Amount must be at least ₹${RAZORPAY_CONFIG.minAmount / 100}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (amountInPaise > RAZORPAY_CONFIG.maxAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Amount must not exceed ₹${RAZORPAY_CONFIG.maxAmount / 100}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Razorpay] Order creation failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
