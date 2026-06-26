
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { InterviewFeedback } from "@/lib/ats/interview-evaluator";

// Type for a single interview response in JSONB
interface InterviewResponseItem {
  questionId: string;
  question: string;
  category: "technical" | "project" | "behavioral" | "system_design" | "follow_up";
  answer: string;
  feedback: InterviewFeedback;
}

// Type for the database mock_interviews table
export interface DBMockInterview {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  completeness_score: number;
  responses: InterviewResponseItem[];
}

// Save a new mock interview result to Supabase
export async function saveMockInterviewResult({
  user,
  role,
  overallScore,
  technicalScore,
  communicationScore,
  completenessScore,
  responses,
}: {
  user: User;
  role: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  completenessScore: number;
  responses: InterviewResponseItem[];
}): Promise<DBMockInterview | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("mock_interviews")
    .insert({
      user_id: user.id,
      role,
      overall_score: overallScore,
      technical_score: technicalScore,
      communication_score: communicationScore,
      completeness_score: completenessScore,
      responses,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save mock interview result:", error);
    return null;
  }
  return data as DBMockInterview;
}

// Fetch all mock interview results for a user
export async function fetchMockInterviewResults(
  user: User
): Promise<DBMockInterview[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("mock_interviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch mock interview results:", error);
    return [];
  }
  return data as DBMockInterview[];
}

// Fetch a single mock interview result by ID
export async function fetchMockInterviewResultById(
  interviewId: string
): Promise<DBMockInterview | null> {
  console.log("[fetchMockInterviewResultById] Requested ID:", interviewId);
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", interviewId)
    .single();

  console.log("[fetchMockInterviewResultById] Supabase Data:", data);
  if (error) {
    console.error("[fetchMockInterviewResultById] Supabase Error:", error);
    return null;
  }
  return data as DBMockInterview;
}

// Delete a mock interview result from Supabase
export async function deleteMockInterviewFromDB(interviewId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("mock_interviews")
    .delete()
    .eq("id", interviewId);

  if (error) {
    console.error("Failed to delete mock interview:", error);
    return false;
  }
  return true;
}


