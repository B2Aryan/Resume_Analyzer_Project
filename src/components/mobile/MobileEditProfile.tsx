import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { ChevronLeft, ChevronDown, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DEGREES, type Degree } from "@/lib/degrees";
import { BRANCHES } from "@/lib/branches";
import { INDIAN_UNIVERSITIES } from "@/lib/universities";
import { PRESET_AVATARS } from "@/lib/avatars";

export function MobileEditProfile() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Basic info states (stored in profiles table)
  const [username, setUsername] = useState(profile?.username || user?.user_metadata?.full_name || "");
  const [avatarId, setAvatarId] = useState<number | undefined>(profile?.avatar_id);
  const [college, setCollege] = useState(profile?.college || "");
  const [degree, setDegree] = useState(profile?.degree || "");
  const [branch, setBranch] = useState(profile?.branch || "");
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year || "");

  // Metadata states (stored in auth.user_metadata)
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [targetRole, setTargetRole] = useState(user?.user_metadata?.target_role || "");
  const [experienceLevel, setExperienceLevel] = useState(user?.user_metadata?.experience_level || "");
  const [preferredIndustry, setPreferredIndustry] = useState(user?.user_metadata?.preferred_industry || "");
  const [bio, setBio] = useState(user?.user_metadata?.bio || "");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarDrawerOpen, setIsAvatarDrawerOpen] = useState(false);
  
  // Dropdown UI states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  // Autocomplete for College
  const collegeSuggestions = useMemo(() => {
    const term = college.toLowerCase().trim();
    if (!term) return [];
    return INDIAN_UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [college]);

  // Graduation Years (2026 to 2100)
  const graduationYears = useMemo(() => {
    const years = [];
    for (let year = 2026; year <= 2100; year++) {
      years.push(year.toString());
    }
    return years;
  }, []);

  // Available Branches based on Degree
  const availableBranches = useMemo(() => {
    const deg = degree as Degree;
    if (BRANCHES[deg]) {
      return [...BRANCHES[deg], "Other"];
    }
    return ["Other"];
  }, [degree]);

  const handleBack = () => {
    navigate({ to: "/dashboard/profile" });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Full Name cannot be empty");
      return;
    }
    if (bio.length > 250) {
      toast.error("Bio cannot exceed 250 characters");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update core fields in Profiles table
      await updateProfile({
        username,
        avatar_id: avatarId,
        college,
        degree,
        branch,
        graduation_year: graduationYear,
      });

      // 2. Update metadata fields in Supabase auth.users
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: {
            phone,
            target_role: targetRole,
            experience_level: experienceLevel,
            preferred_industry: preferredIndustry,
            bio,
          },
        });
        if (metaError) throw metaError;
      }

      toast.success("Profile saved successfully!");
      navigate({ to: "/dashboard/profile" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get current avatar URL
  const selectedAvatarUrl = avatarId
    ? PRESET_AVATARS.find((a) => a.id === avatarId)?.url
    : user?.user_metadata?.avatar_url;

  // Get display initials
  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-4 border-b border-border/20 bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold">Edit Profile</h1>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="rounded-xl px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 h-9"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 pl-1">
          Manage your personal information.
        </p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* SECTION 1: Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsAvatarDrawerOpen(true)}
              className="relative group transition-transform active:scale-95"
            >
              <Avatar className="h-24 w-24 rounded-full border-2 border-border/60 shadow-sm bg-card">
                <AvatarImage src={selectedAvatarUrl} />
                <AvatarFallback className="rounded-full text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md border-2 border-background active:bg-primary/80 transition-colors">
                <Camera className="h-4 w-4" />
              </div>
            </button>
          </div>
          <span className="text-xs text-muted-foreground mt-2 font-medium">Tap to change avatar</span>
        </div>

        {/* SECTION 2: Personal Information */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Personal Information
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Full Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={handleFocus}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider pl-1">
                Email (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full rounded-xl border border-border/20 bg-muted/40 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={handleFocus}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Academic Information */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Academic Information
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
            {/* College Autocomplete */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                College
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setActiveDropdown("college");
                }}
                onFocus={(e) => {
                  handleFocus(e);
                  setActiveDropdown("college");
                }}
                placeholder="e.g. NIT Trichy"
                className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {activeDropdown === "college" && collegeSuggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {collegeSuggestions.map((uni) => (
                    <button
                      key={uni}
                      type="button"
                      onClick={() => {
                        setCollege(uni);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium border-b border-border/10 last:border-0 hover:bg-muted/50 active:bg-muted"
                    >
                      {uni}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Degree Select */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Degree
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("degree")}
                className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/30"
              >
                <span>{degree || "Select Degree"}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    activeDropdown === "degree" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "degree" && (
                <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {DEGREES.map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        setDegree(deg);
                        setBranch(""); // Reset branch when degree changes
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-3.5 text-left text-xs font-medium border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 active:bg-muted/80",
                        degree === deg ? "text-primary bg-primary/5" : "text-foreground"
                      )}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Branch Select */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Branch
              </label>
              {availableBranches.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("branch")}
                    className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/30"
                  >
                    <span>{branch || "Select Branch"}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        activeDropdown === "branch" && "rotate-180"
                      )}
                    />
                  </button>
                  {activeDropdown === "branch" && (
                    <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                      {availableBranches.map((br) => (
                        <button
                          key={br}
                          type="button"
                          onClick={() => {
                            setBranch(br);
                            setActiveDropdown(null);
                          }}
                          className={cn(
                            "flex w-full items-center px-4 py-3.5 text-left text-xs font-medium border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 active:bg-muted/80",
                            branch === br ? "text-primary bg-primary/5" : "text-foreground"
                          )}
                        >
                          {br}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  onFocus={handleFocus}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              )}
            </div>

            {/* Graduation Year Select */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Graduation Year
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("year")}
                className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/30"
              >
                <span>{graduationYear || "Select Year"}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    activeDropdown === "year" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "year" && (
                <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {graduationYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setGraduationYear(year);
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-3.5 text-left text-xs font-medium border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 active:bg-muted/80",
                        graduationYear === year ? "text-primary bg-primary/5" : "text-foreground"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Career Information */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Career Information
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                onFocus={handleFocus}
                placeholder="e.g. Software Engineer"
                className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Experience Level Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Experience Level
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("experience")}
                className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/30"
              >
                <span>{experienceLevel || "Select Experience Level"}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    activeDropdown === "experience" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "experience" && (
                <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {["Intern", "Entry Level", "Mid Level", "Senior", "Lead / Executive"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setExperienceLevel(level);
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-3.5 text-left text-xs font-medium border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 active:bg-muted/80",
                        experienceLevel === level ? "text-primary bg-primary/5" : "text-foreground"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Industry Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Preferred Industry
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown("industry")}
                className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors active:bg-muted/30"
              >
                <span>{preferredIndustry || "Select Industry"}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    activeDropdown === "industry" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "industry" && (
                <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {["Technology / Software", "Finance / Banking", "Healthcare / Biotech", "Education / EdTech", "Consulting / Business", "Other"].map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => {
                        setPreferredIndustry(ind);
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-3.5 text-left text-xs font-medium border-b border-border/10 last:border-0 transition-colors hover:bg-muted/50 active:bg-muted/80",
                        preferredIndustry === ind ? "text-primary bg-primary/5" : "text-foreground"
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: About (Bio) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            About
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Short Bio
                </label>
                <span className={cn(
                  "text-[10px] font-semibold",
                  bio.length > 250 ? "text-red-500 font-bold" : "text-muted-foreground"
                )}>
                  {bio.length}/250
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onFocus={handleFocus}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={250}
                className="w-full rounded-xl border border-border/40 bg-muted/20 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Presets Drawer */}
      <Drawer open={isAvatarDrawerOpen} onOpenChange={setIsAvatarDrawerOpen}>
        <DrawerContent className="rounded-t-[24px] border-t border-border/40 bg-background pb-8">
          <div className="mx-auto px-4 max-w-md w-full">
            <DrawerHeader className="px-0 pt-4 pb-2 text-left">
              <DrawerTitle className="font-display text-xl font-bold">Choose Avatar</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Select one of our preset profile avatars.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-4 gap-3 py-4 max-h-64 overflow-y-auto">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setAvatarId(preset.id);
                    setIsAvatarDrawerOpen(false);
                  }}
                  className={cn(
                    "rounded-xl p-1 border-2 transition-all active:scale-95 bg-muted/20",
                    avatarId === preset.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border"
                  )}
                  aria-label={`Select Avatar preset ${preset.id}`}
                >
                  <Avatar className="h-16 w-16 mx-auto rounded-xl">
                    <AvatarImage src={preset.url} />
                    <AvatarFallback className="rounded-xl font-bold bg-primary/10 text-primary">
                      {preset.id}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
