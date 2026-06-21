/**
 * Access Control Utilities
 *
 * Single source of truth for premium/admin access checks.
 * Admin users bypass all usage limits and premium gates.
 *
 * Usage:
 *   import { hasPremiumAccess, logUserAccess } from "@/lib/access";
 *
 *   if (hasPremiumAccess(profile)) { ... }
 */

export interface AccessProfile {
  plan?: "free" | "premium" | string;
  is_admin?: boolean;
}

/**
 * Returns true if the user has premium access.
 * Admin users always have premium access regardless of their plan field.
 *
 * Replaces: profile.plan === "premium"
 * With:     hasPremiumAccess(profile)
 */
export function hasPremiumAccess(profile: AccessProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.is_admin === true || profile.plan === "premium";
}

/**
 * Returns true if the user is an admin.
 */
export function isAdmin(profile: AccessProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.is_admin === true;
}

/**
 * Dev-only logging helper.
 * Logs user access state to console so you can verify:
 *   { is_admin: true, plan: "premium", premiumAccess: true }
 * during development.
 */
export function logUserAccess(profile: AccessProfile | null | undefined): void {
  if (import.meta.env.DEV) {
    console.log("[ResumePilot] User Access:", {
      is_admin: profile?.is_admin ?? false,
      plan: profile?.plan ?? "unknown",
      premiumAccess: hasPremiumAccess(profile),
    });
  }
}
