import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, FileText, Target, TrendingUp, CheckCircle2, Upload, Clock, Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { PRESET_AVATARS } from "@/lib/avatars";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — ResumePilot" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for profile edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAvatarId, setEditAvatarId] = useState<number | undefined>(undefined);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // State for academic edit modal
  const [isAcademicEditModalOpen, setIsAcademicEditModalOpen] = useState(false);
  const [editAcademic, setEditAcademic] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
  });
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);

  // Fetch analyses
  const { data: analyses = [], isLoading: isAnalysesLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: () => user ? fetchAnalysesFromDB(user) : [],
    enabled: !!user,
  });

  // Format joined date
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  // Get current avatar URL
  const getCurrentAvatarUrl = () => {
    if (profile?.avatar_id) {
      const avatar = PRESET_AVATARS.find(a => a.id === profile.avatar_id);
      return avatar?.url;
    }
    return user?.user_metadata?.avatar_url;
  };

  // Get display name
  const getDisplayName = () => {
    return profile?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  // Get user initials
  const getUserInitials = () => {
    const fullName = getDisplayName();
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Set up edit states from profile
  useEffect(() => {
    setIsLoading(false);
  }, [profile]);

  // Open profile edit modal
  const handleOpenEditModal = () => {
    setEditUsername(getDisplayName());
    setEditAvatarId(profile?.avatar_id);
    setIsEditModalOpen(true);
  };

  // Save profile edit modal
  const handleSaveEditModal = async () => {
    setIsSavingEdit(true);
    try {
      await updateProfile({
        username: editUsername,
        avatar_id: editAvatarId,
      });
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open academic edit modal
  const handleOpenAcademicEditModal = () => {
    setEditAcademic({
      college: profile?.college || "",
      degree: profile?.degree || "",
      branch: profile?.branch || "",
      graduationYear: profile?.graduation_year || "",
    });
    setIsAcademicEditModalOpen(true);
  };

  // Save academic edit modal
  const handleSaveAcademicModal = async () => {
    setIsSavingAcademic(true);
    try {
      await updateProfile({
        college: editAcademic.college,
        degree: editAcademic.degree,
        branch: editAcademic.branch,
        graduation_year: editAcademic.graduationYear,
      });
      toast.success("Academic information updated!");
      setIsAcademicEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update academic information");
    } finally {
      setIsSavingAcademic(false);
    }
  };

  // Calculate completion milestones
  const isProfileSet = !!profile?.username && !!profile?.avatar_id;
  const isAcademicSet = !!profile?.college && !!profile?.degree && !!profile?.branch && !!profile?.graduation_year;
  const hasFirstAnalysis = analyses.length > 0;

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    if (isProfileSet) completed += 1;
    if (isAcademicSet) completed += 1;
    if (hasFirstAnalysis) completed += 1;
    
    if (completed === 0) return 0;
    if (completed === 1) return 33;
    if (completed === 2) return 66;
    return 100;
  };
  const profileCompletion = calculateProfileCompletion();

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
              <div className="flex flex-wrap items-start gap-4">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={getCurrentAvatarUrl()} />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold font-display truncate">
                      {getDisplayName()}
                    </h1>
                    <Button variant="ghost" size="icon" onClick={handleOpenEditModal}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinedDate}
                  </p>
                </div>
              </div>
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
                  <p className="text-sm font-medium">{profileCompletion}% Complete</p>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${isProfileSet ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm">Profile Set</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${isAcademicSet ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm">Academic Information</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${hasFirstAnalysis ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm">First Resume Analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Read-Only Academic Information Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Academic Information</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleOpenAcademicEditModal}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="text-base font-medium">{profile?.college || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="text-base font-medium">{profile?.degree || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="text-base font-medium">{profile?.branch || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Graduation Year</p>
                  <p className="text-base font-medium">{profile?.graduation_year || "Not provided"}</p>
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
                      {stats.avgImprovement !== null ? `${stats.avgImprovement >= 0 ? "+" : ""}${stats.avgImprovement}%` : "—"}
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
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your display name and profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setEditAvatarId(avatar.id)}
                    className={`rounded-lg p-1 border-2 ${
                      editAvatarId === avatar.id
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar.url} />
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSavingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditModal}
              disabled={isSavingEdit}
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Academic Information Modal */}
      <Dialog open={isAcademicEditModalOpen} onOpenChange={setIsAcademicEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Information</DialogTitle>
            <DialogDescription>
              Update your college, degree, branch, and graduation year.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>College</Label>
                <Input
                  placeholder="e.g., NIT Trichy"
                  value={editAcademic.college}
                  onChange={(e) => setEditAcademic(prev => ({ ...prev, college: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Degree</Label>
                <Input
                  placeholder="e.g., B.Tech"
                  value={editAcademic.degree}
                  onChange={(e) => setEditAcademic(prev => ({ ...prev, degree: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Branch</Label>
                <Input
                  placeholder="e.g., Computer Science"
                  value={editAcademic.branch}
                  onChange={(e) => setEditAcademic(prev => ({ ...prev, branch: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Graduation Year</Label>
                <Input
                  placeholder="e.g., 2027"
                  value={editAcademic.graduationYear}
                  onChange={(e) => setEditAcademic(prev => ({ ...prev, graduationYear: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAcademicEditModalOpen(false)}
              disabled={isSavingAcademic}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAcademicModal}
              disabled={isSavingAcademic}
            >
              {isSavingAcademic ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
