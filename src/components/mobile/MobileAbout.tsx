import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  FileCheck2,
  CheckCircle2,
  Mail,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
  Shield,
  FileText,
  Trash2,
  Heart,
} from "lucide-react";
import { DiscordIcon } from "@/components/DiscordIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MobileAbout() {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back to profile page
    navigate({ to: "/dashboard/profile" });
  };

  const features = [
    "ATS Resume Analysis",
    "AI Resume Suggestions",
    "Resume Optimization",
    "Resume History",
    "Saved Reports",
    "Mock Interviews",
  ];

  const socialLinks = [
    {
      label: "GitHub",
      icon: Github,
      url: "https://github.com/B2Aryan",
      color: "hover:text-foreground text-muted-foreground",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/in/b2aryan/",
      color: "hover:text-blue-400 text-muted-foreground",
    },
    {
      label: "Discord",
      icon: DiscordIcon,
      url: "https://discord.com/users/b2aryan",
      color: "hover:text-indigo-400 text-muted-foreground",
    },
  ];

  const legalLinks = [
    {
      label: "Privacy Policy",
      icon: Shield,
      to: "/privacy",
      iconColor: "bg-green-500/10 text-green-400",
    },
    {
      label: "Terms of Service",
      icon: FileText,
      to: "/terms",
      iconColor: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "Data Deletion",
      icon: Trash2,
      to: "/data-deletion",
      iconColor: "bg-red-500/10 text-red-400",
    },
  ];

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
          aria-label="Back to Profile"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-xl font-bold">About ResumePilot</h1>
      </div>

      <div className="space-y-6">
        {/* Top Card */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            ResumePilot
          </h2>
          <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
            v1.0.0
          </span>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed text-left">
            ResumePilot is an AI-powered resume analyzer built to help students, fresh graduates, and job seekers improve their resumes, increase ATS compatibility, and land more interviews with confidence.
          </p>
        </div>

        {/* Mission Section */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Our Mission
          </h3>
          <p className="text-xs text-foreground leading-relaxed">
            We believe everyone deserves access to professional career guidance. ResumePilot combines AI-powered resume analysis with practical insights to help users create stronger resumes, prepare for job applications, and build better careers.
          </p>
        </div>

        {/* Features List Section */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Key Features
          </h3>
          <ul className="grid gap-3 grid-cols-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-xs font-medium text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Founder Section */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Founder
          </h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl">
              <AvatarFallback className="rounded-xl text-sm font-bold bg-primary/10 text-primary">
                AG
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-sm font-bold text-foreground">
                Aryan Gupta
              </p>
              <p className="text-xs text-muted-foreground">Founder & Creator</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contact
          </h3>
          <div className="space-y-3">
            <a
              href="mailto:support@resumepilot.site"
              className="flex items-center gap-3 text-xs text-foreground transition-all hover:text-primary active:scale-[0.99]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Support</p>
                <p className="font-medium truncate">support@resumepilot.site</p>
              </div>
            </a>

            <a
              href="https://resumepilot.site"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-xs text-foreground transition-all hover:text-primary active:scale-[0.99]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Website</p>
                <p className="font-medium truncate">https://resumepilot.site</p>
              </div>
            </a>
          </div>
        </div>

        {/* Follow Us Section */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Follow Us
          </h3>
          <div className="flex justify-around">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-2 transition-transform active:scale-95 ${social.color}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-semibold">{social.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Legal Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Legal
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            {legalLinks.map((link, i) => {
              const Icon = link.icon;
              const isLast = i === legalLinks.length - 1;
              return (
                <Link
                  key={link.label}
                  to={link.to as any}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/50 ${
                    !isLast ? "border-b border-border/40" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${link.iconColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-xs font-medium">{link.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2 border-t border-border/20">
          <p className="text-xs text-muted-foreground">© 2026 ResumePilot</p>
          <p className="mt-1 text-[10px] text-muted-foreground/75 flex items-center justify-center gap-1">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" /> for students and job seekers.
          </p>
        </div>
      </div>
    </div>
  );
}
