/**
 * Razorpay TypeScript Definitions
 * 
 * Type definitions for Razorpay SDK and Checkout integration
 */

declare module "razorpay" {
  export interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrderOptions {
    amount: number; // Amount in paise
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }

  export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    captured: boolean;
    email: string;
    contact: string;
    created_at: number;
  }

  export default class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
      all(options?: any): Promise<{ items: RazorpayOrder[] }>;
    };
    payments: {
      fetch(paymentId: string): Promise<RazorpayPayment>;
      all(options?: any): Promise<{ items: RazorpayPayment[] }>;
    };
  }
}
