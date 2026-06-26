import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { canGenerateCoverLetter } from "@/lib/supabase/usage";
import { hasPremiumAccess } from "@/lib/access";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  ScanSearch,
  History,
  BarChart2,
  FileText,
  Copy,
  GitCompare,
  Briefcase,
  MessageSquare,
  BrainCircuit,
  Star,
  ArrowUpCircle,
  Lightbulb,
  FlaskConical,
  ChevronRight,
} from "lucide-react";

interface ToolItem {
  label: string;
  icon: React.ElementType;
  to?: string;
  comingSoon?: boolean;
  iconColor: string;
}

interface ToolSection {
  title: string;
  items: ToolItem[];
}

const sections: ToolSection[] = [
  {
    title: "AI Tools",
    items: [
      {
        label: "Resume Analyzer",
        icon: ScanSearch,
        to: "/upload",
        iconColor: "bg-blue-500/15 text-blue-400",
      },
      {
        label: "Resume History",
        icon: History,
        to: "/dashboard/history",
        iconColor: "bg-purple-500/15 text-purple-400",
      },
      {
        label: "ATS History",
        icon: BarChart2,
        to: "/dashboard/history",
        iconColor: "bg-indigo-500/15 text-indigo-400",
      },
    ],
  },
  {
    title: "Career Tools",
    items: [
      {
        label: "AI Cover Letter",
        icon: FileText,
        to: "/cover-letter",
        iconColor: "bg-cyan-500/15 text-cyan-400",
      },
      {
        label: "Resume Templates",
        icon: Copy,
        comingSoon: true,
        iconColor: "bg-teal-500/15 text-teal-400",
      },
      {
        label: "Resume Comparison",
        icon: GitCompare,
        comingSoon: true,
        iconColor: "bg-sky-500/15 text-sky-400",
      },
      {
        label: "Job Match Analyzer",
        icon: Briefcase,
        to: "/job-match",
        iconColor: "bg-blue-600/15 text-blue-500",
      },
    ],
  },
  {
    title: "Interview",
    items: [
      {
        label: "Mock Interview",
        icon: MessageSquare,
        to: "/dashboard/interviews",
        iconColor: "bg-green-500/15 text-green-400",
      },
      {
        label: "AI Career Coach",
        icon: BrainCircuit,
        comingSoon: true,
        iconColor: "bg-emerald-500/15 text-emerald-400",
      },
    ],
  },
  {
    title: "Premium",
    items: [
      {
        label: "Premium Features",
        icon: Star,
        to: "/coming-soon",
        iconColor: "bg-amber-500/15 text-amber-400",
      },
      {
        label: "Upgrade",
        icon: ArrowUpCircle,
        to: "/coming-soon",
        iconColor: "bg-orange-500/15 text-orange-400",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Request Feature",
        icon: Lightbulb,
        to: "/mobile/request-feature",
        iconColor: "bg-yellow-500/15 text-yellow-400",
      },
      {
        label: "Beta Program",
        icon: FlaskConical,
        to: "/mobile/beta-program",
        iconColor: "bg-violet-500/15 text-violet-400",
      },
    ],
  },
];

export function MobileTools() {
  const { user, profile } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("cover letter generations");

  // Fetch cover letter usage status
  const { data: usage } = useQuery({
    queryKey: ["coverLetterUsage", user?.id],
    queryFn: () => (user ? canGenerateCoverLetter(user) : null),
    enabled: !!user,
  });

  const isPremium = hasPremiumAccess(profile || usage?.profile);
  const isCoverLetterLimitReached = usage ? !usage.canRun : false;

  const getBadges = (label: string) => {
    if (label === "AI Cover Letter") {
      if (isPremium) {
        return [
          { text: "Unlimited", className: "bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" }
        ];
      }
      if (isCoverLetterLimitReached) {
        return [
          { text: "Premium", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full animate-pulse" }
        ];
      }
      return [
        { text: "FREE", className: "bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" },
        { text: "3 / Month", className: "bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" }
      ];
    }

    if (label === "Mock Interview") {
      return [
        { text: "Premium", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" },
        { text: "Unlimited", className: "bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" }
      ];
    }

    return null;
  };

  return (
    <div className="px-4 pt-12 lg:hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Tools</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Everything you need to land your dream job
        </p>
      </div>

      <div className="space-y-6 pb-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;
                const badges = getBadges(item.label);

                const content = (
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/50 ${
                      !isLast ? "border-b border-border/40" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    {/* Render dynamic badges if available */}
                    {badges && badges.length > 0 && (
                      <div className="flex gap-1.5 mr-2">
                        {badges.map((badge, i) => (
                          <span key={i} className={badge.className}>
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.comingSoon ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Soon
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                );

                if (item.comingSoon || !item.to) {
                  return (
                    <div key={item.label} className="opacity-70">
                      {content}
                    </div>
                  );
                }

                const handleItemClick = (e: React.MouseEvent) => {
                  if (item.label === "AI Cover Letter" && isCoverLetterLimitReached && !isPremium) {
                    e.preventDefault();
                    setUpgradeFeature("cover letter generations");
                    setUpgradeModalOpen(true);
                  }
                };

                return (
                  <Link key={item.label} to={item.to as any} onClick={handleItemClick}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} feature={upgradeFeature} />
    </div>
  );
}
