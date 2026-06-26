import { Link } from "@tanstack/react-router";
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
  MessageCircle,
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
        label: "Cover Letter Generator",
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

                const content = (
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/50 ${
                      !isLast ? "border-b border-border/40" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}
                    >
                      <Icon className="h-4.5 w-4.5 h-5 w-5" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
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

                return (
                  <Link key={item.label} to={item.to as any}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
