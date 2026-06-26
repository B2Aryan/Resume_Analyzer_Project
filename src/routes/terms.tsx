import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ChevronLeft, Scale } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ResumePilot" },
      { name: "description", content: "ResumePilot terms of service and usage conditions." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const termsSections = [
    {
      title: "1. Acceptance of Terms",
      content: "By creating an account, uploading documents, or utilizing ResumePilot services, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.",
    },
    {
      title: "2. User Responsibilities",
      content: "You are responsible for keeping your account credentials secure. You must ensure that any resume, job description, or text you upload is owned by you or you possess the appropriate licenses and permissions.",
    },
    {
      title: "3. Acceptable Use",
      content: "You agree not to upload malicious software, attempt to breach our security boundaries, scrape content, or automate resume scans in a way that generates excessive API load.",
    },
    {
      title: "4. AI Generated Results Disclaimer",
      content: "ResumePilot uses artificial intelligence to evaluate resumes and generate cover letters. These suggestions are automated opinions designed for self-improvement and do not guarantee interview placement, hiring outcomes, or career progression.",
    },
    {
      title: "5. Accuracy Disclaimer",
      content: "We do not guarantee 100% compliance with every Applicant Tracking System (ATS) used by corporate employers. Scoring algorithms are proxies built on standard ATS guidelines and parser logic.",
    },
    {
      title: "6. Intellectual Property",
      content: "All design assets, layout systems, logos, parsing code, and custom scoring methodologies are the exclusive intellectual property of ResumePilot. You may not copy or reuse them without prior written consent.",
    },
    {
      title: "7. Service Availability & Quotas",
      content: "We reserve the right to modify services, impose daily or monthly scan limits, restrict access to specific features, or alter free and premium tier allocations at any time without prior notice.",
    },
    {
      title: "8. Limitation of Liability",
      content: "ResumePilot and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, career placements, or employment opportunities.",
    },
    {
      title: "9. Updates to Terms",
      content: "We reserve the right to update these terms at any time. Continued use of ResumePilot after modifications are published constitutes your acceptance of the updated terms.",
    },
    {
      title: "10. Contact Information",
      content: "If you have questions regarding these terms, please contact support@resumepilot.site.",
    },
  ];

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:block">
        <MarketingLayout>
          <section className="hero-ambient py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Terms of Service</h1>
              <Card className="mt-8 border-border/60 bg-background/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
                    {termsSections.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <h3 className="font-display text-base font-bold text-foreground">
                          {section.title}
                        </h3>
                        <p>{section.content}</p>
                      </div>
                    ))}
                    <p className="text-xs pt-4 border-t border-border/40">
                      Last Updated: June 2026
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </MarketingLayout>
      </div>

      {/* Mobile Version */}
      <div className="block lg:hidden">
        <MobileShell>
          <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard/profile" })}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <h1 className="font-display text-xl font-bold">Terms of Service</h1>
            </div>

            {/* Content list */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <div className="flex items-center gap-3 mb-3 text-primary">
                  <Scale className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Terms & Conditions</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Please read our terms of service carefully. By using our platform, you agree to these conditions.
                </p>
              </div>

              {termsSections.map((section, idx) => (
                <div key={idx} className="rounded-2xl border border-border/40 bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="text-center pt-2">
                <p className="text-[10px] text-muted-foreground">Last Updated: June 2026</p>
              </div>
            </div>
          </div>
        </MobileShell>
      </div>
    </>
  );
}
