import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysisById } from "@/lib/supabase/analysis-db";
import { ResultPage } from "./result";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/report/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Report — ResumePilot" },
      {
        name: "description",
        content: "View your ATS resume analysis report.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setResult, hasResult } = useAnalysisStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (!id) {
        setError("Invalid report ID");
        setIsLoading(false);
        return;
      }

      try {
        const analysis = await fetchAnalysisById(id);
        if (!analysis) {
          setError("Report not found");
          setIsLoading(false);
          return;
        }

        // Set the result in store
        setResult(
        analysis.analysis_result,
        analysis.role,
        analysis.file_name,
        analysis.resume_text || "",
        analysis.job_description ?? undefined,
        {
          animateEntry: false,
          analysisId: analysis.id,
          isSaved: analysis.is_saved,
          isPublic: analysis.is_public,
          interviewQuestions: analysis.interview_questions || undefined,
        }
      );
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load report:", err);
        setError("Failed to load report");
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id, setResult]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mt-3 font-semibold">{error}</p>
            <button
              onClick={() => navigate({ to: "/upload" })}
              className="mt-4 text-sm text-primary underline"
            >
              Upload a new resume
            </button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (hasResult) {
    return <ResultPage />;
  }

  return null;
}
