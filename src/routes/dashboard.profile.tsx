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
import { Calendar, FileText, Target, TrendingUp, CheckCircle2, Upload, Clock, Loader2, Pencil, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysesFromDB } from "@/lib/supabase/analysis-db";
import { PRESET_AVATARS } from "@/lib/avatars";
import { INDIAN_UNIVERSITIES } from "@/lib/universities";
import { DEGREES, type Degree } from "@/lib/degrees";
import { BRANCHES } from "@/lib/branches";
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
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [collegeHighlightedIndex, setCollegeHighlightedIndex] = useState(-1);
  const [degreeHighlightedIndex, setDegreeHighlightedIndex] = useState(-1);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const [yearHighlightedIndex, setYearHighlightedIndex] = useState(-1);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  const degreeInputRef = useRef<HTMLButtonElement>(null);
  const branchInputRef = useRef<HTMLButtonElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const degreeDropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  
  const collegeSuggestions = useMemo(() => {
    const searchTerm = editAcademic.college.toLowerCase();
    const baseSuggestions = INDIAN_UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(searchTerm)
    );
    if (searchTerm.length > 0) {
      return ["College not listed? Enter manually", ...baseSuggestions];
    }
    return baseSuggestions;
  }, [editAcademic.college]);
  
  const graduationYears = useMemo(() => {
    const years = [];
    for (let year = 2026; year <= 2100; year++) {
      years.push(year.toString());
    }
    return years;
  }, []);
  
  const filteredGraduationYears = useMemo(() => {
    const searchTerm = editAcademic.graduationYear;
    if (!searchTerm) return graduationYears;
    return graduationYears.filter((year) => year.includes(searchTerm));
  }, [editAcademic.graduationYear, graduationYears]);
  
  const availableBranches = useMemo(() => {
    const degree = editAcademic.degree as Degree;
    if (BRANCHES[degree]) {
      return [...BRANCHES[degree], "Other"];
    }
    return ["Other"];
  }, [editAcademic.degree]);
  
  // Reset highlighted indices when suggestions change
  useEffect(() => {
    setCollegeHighlightedIndex(-1);
  }, [collegeSuggestions]);
  
  useEffect(() => {
    const degreeIndex = DEGREES.findIndex(deg => deg === editAcademic.degree);
    setDegreeHighlightedIndex(degreeIndex >= 0 ? degreeIndex : -1);
  }, [showDegreeDropdown, editAcademic.degree]);
  
  useEffect(() => {
    const branchIndex = availableBranches.findIndex(br => br === editAcademic.branch);
    setBranchHighlightedIndex(branchIndex >= 0 ? branchIndex : -1);
  }, [showBranchDropdown, editAcademic.branch, availableBranches]);
  
  useEffect(() => {
    setYearHighlightedIndex(-1);
  }, [filteredGraduationYears]);
  
  // Scroll highlighted item into view
  useEffect(() => {
    if (showCollegeDropdown && collegeHighlightedIndex >= 0 && collegeDropdownRef.current) {
      const item = collegeDropdownRef.current.children[collegeHighlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [showCollegeDropdown, collegeHighlightedIndex]);
  
  useEffect(() => {
    if (showDegreeDropdown && degreeHighlightedIndex >= 0 && degreeDropdownRef.current) {
      const item = degreeDropdownRef.current.children[degreeHighlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [showDegreeDropdown, degreeHighlightedIndex]);
  
  useEffect(() => {
    if (showBranchDropdown && branchHighlightedIndex >= 0 && branchDropdownRef.current) {
      const item = branchDropdownRef.current.children[branchHighlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [showBranchDropdown, branchHighlightedIndex]);
  
  useEffect(() => {
    if (showYearDropdown && yearHighlightedIndex >= 0 && yearDropdownRef.current) {
      const item = yearDropdownRef.current.children[yearHighlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [showYearDropdown, yearHighlightedIndex]);

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
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (showCollegeDropdown && !target.closest('.college-dropdown-wrapper')) {
        setShowCollegeDropdown(false);
      }
      
      if (showDegreeDropdown && !target.closest('.degree-dropdown-wrapper')) {
        setShowDegreeDropdown(false);
      }
      
      if (showBranchDropdown && !target.closest('.branch-dropdown-wrapper')) {
        setShowBranchDropdown(false);
      }
      
      if (showYearDropdown && !target.closest('.year-dropdown-wrapper')) {
        setShowYearDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showCollegeDropdown, showDegreeDropdown, showBranchDropdown, showYearDropdown]);

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
  const isProfileSet = profile?.profile_confirmed === true;
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
    const firstUploadDate = analyses.length > 0 ? new Date(analyses[analyses.length - 1].created_at) : null;
    const daysActive = (firstUploadDate && lastUploadDate) 
      ? Math.ceil(Math.abs(lastUploadDate.getTime() - firstUploadDate.getTime()) / (1000 * 60 * 60 * 24)) 
      : null;
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
      firstUploadDate,
      daysActive,
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
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.lastUploadDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Upload Date</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.firstUploadDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">First Upload Date</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.avgImprovement !== null ? `${stats.avgImprovement >= 0 ? "+" : ""}${stats.avgImprovement}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Average Improvement</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">
                      {stats.daysActive !== null ? `${stats.daysActive} day${stats.daysActive === 1 ? "" : "s"}` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Days Active</p>
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
        <DialogContent className="max-w-[750px] overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Edit Academic Information</DialogTitle>
            <DialogDescription>
              Update your college, degree, branch, and graduation year.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-x-hidden">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {/* College Autocomplete */}
              <div className="space-y-1.5 college-dropdown-wrapper">
                <Label>College</Label>
                <div className="relative">
                  <Input
                    ref={collegeInputRef}
                    placeholder="e.g., NIT Trichy"
                    value={editAcademic.college}
                    onChange={(e) => {
                      setEditAcademic(prev => ({ ...prev, college: e.target.value }));
                      if (!showCollegeDropdown) setShowCollegeDropdown(true);
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    onClick={() => setShowCollegeDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowCollegeDropdown(false);
                        setCollegeHighlightedIndex(-1);
                        return;
                      }
                      
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!showCollegeDropdown) {
                          setShowCollegeDropdown(true);
                        } else {
                          setCollegeHighlightedIndex(prev => Math.min(prev + 1, collegeSuggestions.length - 1));
                        }
                        return;
                      }
                      
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setCollegeHighlightedIndex(prev => Math.max(prev - 1, 0));
                        return;
                      }
                      
                      if (e.key === "Enter" && showCollegeDropdown && collegeHighlightedIndex >= 0) {
                        e.preventDefault();
                        const selected = collegeSuggestions[collegeHighlightedIndex];
                        if (selected === "College not listed? Enter manually") {
                          setShowCollegeDropdown(false);
                          setCollegeHighlightedIndex(-1);
                        } else {
                          setEditAcademic(prev => ({ ...prev, college: selected }));
                          setShowCollegeDropdown(false);
                          setCollegeHighlightedIndex(-1);
                        }
                        return;
                      }
                      
                      if (e.key === "Tab" && showCollegeDropdown && collegeHighlightedIndex >= 0) {
                        const selected = collegeSuggestions[collegeHighlightedIndex];
                        if (selected !== "College not listed? Enter manually") {
                          setEditAcademic(prev => ({ ...prev, college: selected }));
                        }
                        setShowCollegeDropdown(false);
                        setCollegeHighlightedIndex(-1);
                      }
                    }}
                  />
                  {showCollegeDropdown && (
                    <div 
                      ref={collegeDropdownRef}
                      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-background shadow-xl"
                    >
                      <div className="py-1">
                        {collegeSuggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              if (suggestion === "College not listed? Enter manually") {
                                setShowCollegeDropdown(false);
                                setCollegeHighlightedIndex(-1);
                                return;
                              }
                              setEditAcademic(prev => ({ ...prev, college: suggestion }));
                              setShowCollegeDropdown(false);
                              setCollegeHighlightedIndex(-1);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              collegeHighlightedIndex === index
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Degree Dropdown */}
              <div className="space-y-1.5 degree-dropdown-wrapper">
                <Label>Degree</Label>
                <div className="relative">
                  <Button
                    ref={degreeInputRef}
                    variant="secondary"
                    className="w-full justify-between overflow-hidden"
                    onClick={() => setShowDegreeDropdown(!showDegreeDropdown)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowDegreeDropdown(false);
                        setDegreeHighlightedIndex(-1);
                        return;
                      }
                      
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!showDegreeDropdown) {
                          setShowDegreeDropdown(true);
                        } else {
                          setDegreeHighlightedIndex(prev => Math.min(prev + 1, DEGREES.length - 1));
                        }
                        return;
                      }
                      
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setDegreeHighlightedIndex(prev => Math.max(prev - 1, 0));
                        return;
                      }
                      
                      if (e.key === "Enter" && showDegreeDropdown && degreeHighlightedIndex >= 0) {
                        e.preventDefault();
                        const selected = DEGREES[degreeHighlightedIndex];
                        setEditAcademic(prev => ({
                          ...prev,
                          degree: selected,
                          branch: ""
                        }));
                        setShowDegreeDropdown(false);
                        return;
                      }
                      
                      if (e.key === "Tab" && showDegreeDropdown && degreeHighlightedIndex >= 0) {
                        const selected = DEGREES[degreeHighlightedIndex];
                        setEditAcademic(prev => ({
                          ...prev,
                          degree: selected,
                          branch: ""
                        }));
                        setShowDegreeDropdown(false);
                      }
                    }}
                  >
                    <span className="truncate">
                      {editAcademic.degree || "Select Degree"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                  {showDegreeDropdown && (
                    <div 
                      ref={degreeDropdownRef}
                      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-background shadow-xl"
                    >
                      <div className="py-1">
                        {DEGREES.map((degree, index) => (
                          <button
                            key={degree}
                            type="button"
                            onClick={() => {
                              setEditAcademic(prev => ({
                                ...prev,
                                degree,
                                branch: ""
                              }));
                              setShowDegreeDropdown(false);
                              setDegreeHighlightedIndex(-1);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              degreeHighlightedIndex === index
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {degree}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Branch Dropdown (Dynamic) */}
              <div className="space-y-1.5 branch-dropdown-wrapper">
                <Label>Branch</Label>
                <div className="relative">
                  {availableBranches.length > 1 && availableBranches[availableBranches.length - 1] === "Other" && editAcademic.degree !== "Other" ? (
                    <>
                      <Button
                        ref={branchInputRef}
                        variant="secondary"
                        className="w-full justify-between overflow-hidden"
                        onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setShowBranchDropdown(false);
                            setBranchHighlightedIndex(-1);
                            return;
                          }
                          
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (!showBranchDropdown) {
                              setShowBranchDropdown(true);
                            } else {
                              setBranchHighlightedIndex(prev => Math.min(prev + 1, availableBranches.length - 1));
                            }
                            return;
                          }
                          
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setBranchHighlightedIndex(prev => Math.max(prev - 1, 0));
                            return;
                          }
                          
                          if (e.key === "Enter" && showBranchDropdown && branchHighlightedIndex >= 0) {
                            e.preventDefault();
                            const selected = availableBranches[branchHighlightedIndex];
                            setEditAcademic(prev => ({ ...prev, branch: selected }));
                            setShowBranchDropdown(false);
                            setBranchHighlightedIndex(-1);
                            return;
                          }
                          
                          if (e.key === "Tab" && showBranchDropdown && branchHighlightedIndex >= 0) {
                            const selected = availableBranches[branchHighlightedIndex];
                            setEditAcademic(prev => ({ ...prev, branch: selected }));
                            setShowBranchDropdown(false);
                          }
                        }}
                      >
                        <span className="truncate">
                          {editAcademic.branch || "Select Branch"}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </Button>
                      {showBranchDropdown && (
                        <div 
                          ref={branchDropdownRef}
                          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-background shadow-xl"
                        >
                          <div className="py-1">
                            {availableBranches.map((branch, index) => (
                              <button
                                key={branch}
                                type="button"
                                onClick={() => {
                                  setEditAcademic(prev => ({ ...prev, branch }));
                                  setShowBranchDropdown(false);
                                  setBranchHighlightedIndex(-1);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                  branchHighlightedIndex === index
                                    ? "bg-accent text-accent-foreground"
                                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                {branch}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Input
                      placeholder="e.g., Computer Science"
                      value={editAcademic.branch}
                      onChange={(e) => setEditAcademic(prev => ({ ...prev, branch: e.target.value }))}
                    />
                  )}
                </div>
              </div>
              
              {/* Graduation Year Searchable Dropdown */}
              <div className="space-y-1.5 year-dropdown-wrapper">
                <Label>Graduation Year</Label>
                <div className="relative">
                  <Input
                    ref={yearInputRef}
                    placeholder="e.g., 2027"
                    value={editAcademic.graduationYear}
                    onChange={(e) => {
                      setEditAcademic(prev => ({ ...prev, graduationYear: e.target.value }));
                      if (!showYearDropdown) setShowYearDropdown(true);
                    }}
                    onFocus={() => setShowYearDropdown(true)}
                    onClick={() => setShowYearDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowYearDropdown(false);
                        setYearHighlightedIndex(-1);
                        return;
                      }
                      
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!showYearDropdown) {
                          setShowYearDropdown(true);
                        } else {
                          setYearHighlightedIndex(prev => Math.min(prev + 1, filteredGraduationYears.length - 1));
                        }
                        return;
                      }
                      
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setYearHighlightedIndex(prev => Math.max(prev - 1, 0));
                        return;
                      }
                      
                      if (e.key === "Enter" && showYearDropdown && yearHighlightedIndex >= 0) {
                        e.preventDefault();
                        const selected = filteredGraduationYears[yearHighlightedIndex];
                        setEditAcademic(prev => ({ ...prev, graduationYear: selected }));
                        setShowYearDropdown(false);
                        setYearHighlightedIndex(-1);
                        return;
                      }
                      
                      if (e.key === "Tab" && showYearDropdown && yearHighlightedIndex >= 0) {
                        const selected = filteredGraduationYears[yearHighlightedIndex];
                        setEditAcademic(prev => ({ ...prev, graduationYear: selected }));
                        setShowYearDropdown(false);
                      }
                    }}
                  />
                  {showYearDropdown && (
                    <div 
                      ref={yearDropdownRef}
                      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-background shadow-xl"
                    >
                      <div className="py-1">
                        {filteredGraduationYears.map((year, index) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              setEditAcademic(prev => ({ ...prev, graduationYear: year }));
                              setShowYearDropdown(false);
                              setYearHighlightedIndex(-1);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              yearHighlightedIndex === index
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
