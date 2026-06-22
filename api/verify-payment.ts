/**
 * Razorpay Payment Verification API
 * 
 * Verifies the payment signature to ensure payment authenticity.
 * This runs on the backend and uses the secret key.
 * NEVER perform signature verification on the frontend.
 * 
 * SECURITY: Premium activation happens ONLY here after successful verification.
 * Frontend CANNOT upgrade users to premium.
 */

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string; // Required for premium activation
}

interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  premiumActivated?: boolean;
  error?: string;
  message?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = (await req.json()) as VerifyPaymentRequest;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing payment verification parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID required for premium activation" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Razorpay secret key from environment
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[Razorpay] Secret key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate expected signature
    // Razorpay signature = HMAC SHA256(order_id + "|" + payment_id, secret_key)
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare signatures (timing-safe comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      console.error("[Razorpay] Payment signature verification failed");
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          premiumActivated: false,
          error: "Payment signature verification failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Razorpay] Payment verified successfully:", razorpay_payment_id);

    // ✅ CRITICAL: Update premium status on BACKEND using Service Role Key
    // Service Role Key bypasses RLS, so frontend cannot manipulate this
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[Razorpay] Supabase credentials not configured");
      return new Response(
        JSON.stringify({
          success: false,
          verified: true,
          premiumActivated: false,
          error: "Payment verified but premium activation not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with Service Role Key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Update user's plan to premium
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ plan: "premium" })
      .eq("id", userId);

    if (updateError) {
      console.error("[Razorpay] Failed to activate premium:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          verified: true,
          premiumActivated: false,
          error: "Payment verified but failed to activate premium. Please contact support.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Razorpay] Premium activated for user:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        premiumActivated: true,
        message: "Payment verified and premium activated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Razorpay] Payment verification error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        premiumActivated: false,
        error: error instanceof Error ? error.message : "Payment verification failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
