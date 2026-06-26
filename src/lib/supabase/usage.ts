
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { DBProfile } from "./analysis-db";
import { hasPremiumAccess, logUserAccess, canGenerateCoverLetterAccess, canStartMockInterviewAccess } from "@/lib/access";

// Free tier limits
export const FREE_TIER_LIMITS = {
  analyses: 3,
  coverLetters: 3,
  interviews: 3,
};

// Helper to check if we need to reset usage for the month
function needsReset(resetDate: string | null): boolean {
  if (!resetDate) return true;
  const reset = new Date(resetDate);
  const now = new Date();
  // Reset if we're in a new month
  return now.getMonth() !== reset.getMonth() || now.getFullYear() !== reset.getFullYear();
}

// Get first day of current month
function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Fetch user's profile
export async function fetchUserProfile(user: User): Promise<DBProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
  return data as DBProfile;
}

// Check if user can run an analysis
export async function canRunAnalysis(user: User): Promise<{ 
  canRun: boolean; 
  remaining: number; 
  profile: DBProfile;
}> {
  const profile = await fetchUserProfile(user);
  if (!profile) return { 
    canRun: false, 
    remaining: 0, 
    profile: {} as DBProfile
  };

  // Log access state in development for verification
  logUserAccess(profile);

  // Admins and premium users bypass all usage limits
  if (hasPremiumAccess(profile)) {
    return { 
      canRun: true, 
      remaining: Infinity, 
      profile
    };
  }

  // Check account limit
  let updatedProfile = profile;
  if (needsReset(profile.analyses_reset_date)) {
    updatedProfile = await updateUsageResetDate(user, "analyses");
  }

  // Calculate remaining: Monthly Free + Bonus Analyses
  const monthlyRemaining = FREE_TIER_LIMITS.analyses - updatedProfile.analyses_used;
  const bonusRemaining = updatedProfile.bonus_analyses || 0;
  const totalRemaining = monthlyRemaining + bonusRemaining;

  return { 
    canRun: totalRemaining > 0, 
    remaining: Math.max(0, totalRemaining), 
    profile: updatedProfile
  };
}

// Check if user can generate a cover letter
export async function canGenerateCoverLetter(user: User): Promise<{ canRun: boolean; remaining: number; profile: DBProfile }> {
  const profile = await fetchUserProfile(user);
  if (!profile) return { canRun: false, remaining: 0, profile: {} as DBProfile };

  let updatedProfile = profile;
  if (needsReset(profile.cover_letters_reset_date)) {
    updatedProfile = await updateUsageResetDate(user, "cover_letters");
  }

  const canRun = canGenerateCoverLetterAccess(updatedProfile, updatedProfile.cover_letters_used);
  const remaining = hasPremiumAccess(updatedProfile) ? Infinity : Math.max(0, FREE_TIER_LIMITS.coverLetters - updatedProfile.cover_letters_used);
  return { canRun, remaining, profile: updatedProfile };
}

// Check if user can run a mock interview
export async function canRunMockInterview(user: User): Promise<{ canRun: boolean; remaining: number; profile: DBProfile }> {
  const profile = await fetchUserProfile(user);
  if (!profile) return { canRun: false, remaining: 0, profile: {} as DBProfile };

  const canRun = canStartMockInterviewAccess(profile);
  const remaining = canRun ? Infinity : 0;
  return { canRun, remaining, profile };
}

// Update reset date for a specific usage type
async function updateUsageResetDate(user: User, type: "analyses" | "cover_letters" | "interviews"): Promise<DBProfile> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("No Supabase client");

  const resetDate = getFirstDayOfMonth().toISOString();
  const updateData: Record<string, unknown> = {
    [`${type}_used`]: 0,
    [`${type}_reset_date`]: resetDate,
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error(`Failed to update ${type} reset date:`, error);
    throw error;
  }
  return data as DBProfile;
}

// Increment analysis usage - consumes bonus analyses first, then monthly analyses
export async function incrementAnalysisUsage(user: User): Promise<DBProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const profile = await fetchUserProfile(user);
  if (!profile) return null;

  let updateData: Record<string, number> = {};

  // Consume bonus analyses first
  if (profile.bonus_analyses > 0) {
    updateData = { bonus_analyses: profile.bonus_analyses - 1 };
  } else {
    // Consume monthly analyses
    updateData = { analyses_used: profile.analyses_used + 1 };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to increment analysis usage:", error);
    return null;
  }

  return data as DBProfile;
}

// Increment cover letter usage
export async function incrementCoverLetterUsage(user: User): Promise<DBProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update({ cover_letters_used: (await fetchUserProfile(user))?.cover_letters_used + 1 })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to increment cover letter usage:", error);
    return null;
  }
  return data as DBProfile;
}

// Increment mock interview usage
export async function incrementMockInterviewUsage(user: User): Promise<DBProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update({ interviews_used: (await fetchUserProfile(user))?.interviews_used + 1 })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to increment interview usage:", error);
    return null;
  }
  return data as DBProfile;
}
