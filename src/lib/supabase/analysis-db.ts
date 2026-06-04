import { getSupabaseClient } from "@/lib/supabase";
import type { ATSAnalysisResult } from "@/lib/ats/types";
import type { User } from "@supabase/supabase-js";

// Type for the database analyses table
export interface DBAnalysis {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  file_name: string;
  resume_text: string | null;
  job_description: string | null;
  analysis_result: ATSAnalysisResult;
  is_saved: boolean;
}

// Save a new analysis to Supabase
export async function saveAnalysisToDB({
  user,
  role,
  fileName,
  resumeText,
  jobDescription,
  analysisResult,
}: {
  user: User;
  role: string;
  fileName: string;
  resumeText?: string;
  jobDescription?: string;
  analysisResult: ATSAnalysisResult;
}): Promise<DBAnalysis | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      role,
      file_name: fileName,
      resume_text: resumeText || null,
      job_description: jobDescription || null,
      analysis_result: analysisResult,
      is_saved: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save analysis:", error);
    return null;
  }
  return data as DBAnalysis;
}

// Fetch all analyses for a user
export async function fetchAnalysesFromDB(
  user: User
): Promise<DBAnalysis[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch analyses:", error);
    return [];
  }
  return data as DBAnalysis[];
}

// Fetch saved reports only
export async function fetchSavedReportsFromDB(
  user: User
): Promise<DBAnalysis[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch saved reports:", error);
    return [];
  }
  return data as DBAnalysis[];
}

// Toggle save status of an analysis
export async function toggleSaveAnalysis(
  analysisId: string,
  shouldSave: boolean
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from("analyses")
    .update({ is_saved: shouldSave })
    .eq("id", analysisId);
}

// Fetch a single analysis by ID
export async function fetchAnalysisById(
  analysisId: string
): Promise<DBAnalysis | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (error) {
    console.error("Failed to fetch analysis:", error);
    return null;
  }
  return data as DBAnalysis;
}
