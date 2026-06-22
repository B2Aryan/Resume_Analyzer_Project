/**
 * Razorpay Frontend Integration Hook
 * 
 * React hook for handling Razorpay checkout flow.
 * This runs on the client side and uses the public key ID.
 * 
 * SECURITY: Frontend NEVER updates premium status.
 * Premium activation happens on backend after payment verification.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

// Razorpay types (extended from window)
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  productId: string; // Product identifier (e.g., "premium_upgrade")
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
}

interface UseRazorpayReturn {
  isProcessing: boolean;
  initiatePayment: (options: RazorpayOptions, user: User) => Promise<boolean>;
  loadRazorpayScript: () => Promise<boolean>;
}

/**
 * Hook for Razorpay payment integration
 */
export function useRazorpay(): UseRazorpayReturn {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Load Razorpay checkout script dynamically
   */
  const loadRazorpayScript = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        console.log("[Razorpay] Checkout script loaded");
        resolve(true);
      };

      script.onerror = () => {
        console.error("[Razorpay] Failed to load checkout script");
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  /**
   * Initiate Razorpay payment flow
   */
  const initiatePayment = async (
    options: RazorpayOptions,
    user: User
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);

      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return false;
      }

      // Step 2: Create order on backend (backend defines price)
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: options.productId, // Send product ID, not amount
          currency: options.currency || "INR",
          notes: options.notes || {},
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success || !orderData.orderId) {
        toast.error(orderData.error || "Failed to create payment order");
        return false;
      }

      console.log("[Razorpay] Order created:", orderData.orderId);

      // Step 3: Get Razorpay Key ID from environment
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId || keyId === "YOUR_RAZORPAY_TEST_KEY_ID_HERE") {
        toast.error("Payment gateway not configured. Please contact support.");
        return false;
      }

      // Step 4: Open Razorpay checkout
      return new Promise((resolve) => {
        const razorpayOptions = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: options.name || "ResumePilot",
          description: options.description || "Premium Upgrade",
          order_id: orderData.orderId,
          prefill: options.prefill || {
            name: user.user_metadata?.full_name || "",
            email: user.email || "",
          },
          theme: options.theme || {
            color: "#3b82f6", // Primary blue
          },
          handler: async function (response: any) {
            console.log("[Razorpay] Payment successful:", response.razorpay_payment_id);

            // Step 5: Verify payment signature on backend
            // Backend will also activate premium status
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id, // Required for backend premium activation
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.verified && verifyData.premiumActivated) {
              // ✅ Premium activated by backend
              toast.success("Payment successful! You are now a Premium member.");
              resolve(true);
            } else if (verifyData.verified && !verifyData.premiumActivated) {
              // Payment verified but premium activation failed
              toast.error(
                "Payment successful but failed to activate premium. Please contact support with payment ID: " +
                  response.razorpay_payment_id
              );
              resolve(false);
            } else {
              // Payment verification failed
              toast.error("Payment verification failed. Please contact support.");
              resolve(false);
            }
          },
          modal: {
            ondismiss: function () {
              console.log("[Razorpay] Payment cancelled by user");
              toast.info("Payment cancelled");
              resolve(false);
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
      });
    } catch (error) {
      console.error("[Razorpay] Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    initiatePayment,
    loadRazorpayScript,
  };
}
