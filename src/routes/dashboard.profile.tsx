import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, FileText, Target, TrendingUp, CheckCircle2, ChevronDown, Upload, Clock, BookOpen, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — ResumePilot" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAcademicCollapsed, setIsAcademicCollapsed] = useState(true);
  const [profile, setProfile] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch analyses
  const { data: analyses = [], isLoading: isAnalysesLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => user ? fetchAnalysesFromDB(user) : [],
    enabled: !!user,
  });

  // Format joined date
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  // Get user initials
  const getUserInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate profile completion
  const profileCompletion = () => {
    let completed = 1; // User exists
    if (profile.college) completed++;
    if (profile.degree) completed++;
    if (profile.branch) completed++;
    if (profile.graduationYear) completed++;
    return Math.round((completed / 5) * 100);
  };

  // Calculate stats from analyses
  const stats = (() => {
    const totalAnalyses = analyses.length;
    const scores = analyses.map(a => a.analysis_result.score);
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const savedCount = analyses.filter(a => a.is_saved).length;
    const lastUploadDate = analyses.length > 0 ? new Date(analyses[0].created_at) : null;
    const avgImprovement = (() => {
      if (analyses.length < 2) return null;
      const first = analyses[analyses.length - 1].analysis_result.score;
      const last = analyses[0].analysis_result.score;
      return last - first;
    })();

    return {
      totalAnalyses,
      bestScore,
      averageScore,
      savedCount,
      lastUploadDate,
      avgImprovement
    };
  })();

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const supabase = getSupabaseClient();
      if (!supabase) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("college, degree, branch, graduation_year")
          .eq("id", user.id)
          .single();
        
        if (!error && data) {
          setProfile({
            college: data.college || "",
            degree: data.degree || "",
            branch: data.branch || "",
            graduationYear: data.graduation_year || "",
          });
        }
      } catch (e) {
        console.log("Profiles table may not exist yet, using default values");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSaving(true);
    try {
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          college: profile.college,
          degree: profile.degree,
          branch: profile.branch,
          graduation_year: profile.graduationYear,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      
      // Success (could use toast here)
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Profile" subtitle="Manage your account details.">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile" subtitle="Manage your account details.">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold font-display truncate">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinedDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Read-Only Academic Information Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="text-base font-medium">{profile.college || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="text-base font-medium">{profile.degree || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="text-base font-medium">{profile.branch || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Graduation Year</p>
                  <p className="text-base font-medium">{profile.graduationYear || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Statistics */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Resume Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xl font-bold">
                    {isAnalysesLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.totalAnalyses > 0 ? stats.totalAnalyses : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAnalyses > 0 ? "Total Analyses" : "No analyses yet"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xl font-bold">
                    {isAnalysesLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.bestScore !== null ? `${stats.bestScore}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.bestScore !== null ? "Best ATS Score" : "Waiting for first scan"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xl font-bold">
                    {isAnalysesLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.averageScore !== null ? `${stats.averageScore}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.averageScore !== null ? "Average Score" : "No data yet"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xl font-bold">
                    {isAnalysesLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.savedCount > 0 ? stats.savedCount : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.savedCount > 0 ? "Saved Reports" : "No saved reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Journey */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Resume Journey</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isAnalysesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : stats.totalAnalyses > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.totalAnalyses}</p>
                    <p className="text-xs text-muted-foreground">Total Analyses</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.bestScore}%</p>
                    <p className="text-xs text-muted-foreground">Best ATS Score</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.lastUploadDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Upload Date</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.avgImprovement !== null ? `${stats.avgImprovement >=0 ? "+" : ""}${stats.avgImprovement}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Average Improvement</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-semibold">Upload your first resume to start tracking your progress.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collapsible Academic Info */}
          <Collapsible open={!isAcademicCollapsed} onOpenChange={open => setIsAcademicCollapsed(!open)}>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <CardTitle className="text-lg font-display">Academic Information</CardTitle>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAcademicCollapsed ? "" : "rotate-180"}`} />
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="p-6 pt-0">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>College</Label>
                      <Input
                        placeholder="e.g., NIT Trichy"
                        value={profile.college}
                        onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Degree</Label>
                      <Input
                        placeholder="e.g., B.Tech"
                        value={profile.degree}
                        onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Branch</Label>
                      <Input
                        placeholder="e.g., Computer Science"
                        value={profile.branch}
                        onChange={(e) => setProfile(prev => ({ ...prev, branch: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Graduation Year</Label>
                      <Input
                        placeholder="e.g., 2027"
                        value={profile.graduationYear}
                        onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button variant="hero" className="mt-6" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save changes"}
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="border-border/60 bg-gradient-card">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Plan</p>
              <p className="mt-1 font-display text-2xl font-bold">Free Plan</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Monthly Usage</span>
                    <span>{stats.totalAnalyses} / 3 scans used</span>
                  </div>
                  <Progress value={(stats.totalAnalyses / 3) * 100} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Scans</span>
                  <span className="font-medium">{Math.max(3 - stats.totalAnalyses, 0)} scans remaining</span>
                </div>
              </div>
              
              <Button variant="outline" className="mt-6 w-full">Upgrade to Pro</Button>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">{profileCompletion()}% Complete</p>
                </div>
                <Progress value={profileCompletion()} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${profile.college && profile.degree && profile.branch && profile.graduationYear ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm">Academic Information</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.college && profile.degree && profile.branch && profile.graduationYear ? "Completed" : "Add details"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${stats.totalAnalyses > 0 ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm">Resume Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalAnalyses > 0 ? "Completed" : "Upload your first resume"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">Analysis History</p>
                    <p className="text-xs text-muted-foreground">Run your first analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start gap-3">
                  <Link to="/upload">
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3">
                  <Link to="/dashboard/history">
                    <BookOpen className="h-4 w-4" />
                    View History
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3">
                  <Link to="/dashboard/saved">
                    <Save className="h-4 w-4" />
                    Saved Reports
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
