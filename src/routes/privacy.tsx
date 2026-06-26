import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ChevronLeft, Shield, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ResumePilot" },
      { name: "description", content: "ResumePilot privacy policy and data handling practices." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const privacySections = [
    {
      title: "1. Information We Collect",
      content: "We collect user authentication information (email address) and contents of documents uploaded (resumes and job descriptions) for analysis purposes.",
    },
    {
      title: "2. How We Use Information",
      content: "We use the collected information solely to provide ATS analysis reports, generate cover letters, suggest keyword optimizations, and power mock interviews.",
    },
    {
      title: "3. Resume & Job Description Processing",
      content: "Uploaded resumes are parsed to extract textual content. This data is only used to compute analysis scores and matching metrics. We never sell, rent, or distribute your resume data to third parties.",
    },
    {
      title: "4. AI Analysis",
      content: "Our system uses advanced AI providers (Google Gemini and Groq) to evaluate resume content. Only the text required for evaluation is transmitted to these services, and it is processed in accordance with their privacy policies.",
    },
    {
      title: "5. Data Storage",
      content: "If you have an account, your analysis records and reports are stored securely in our database. Guest users' data is processed temporarily and saved in local storage on their device.",
    },
    {
      title: "6. Cookies",
      content: "We use essential cookies to maintain user authentication sessions and remember user preferences such as color theme settings.",
    },
    {
      title: "7. Third-Party Services",
      content: "We integrate with trusted third-party providers including Supabase (database storage), Razorpay (billing and premium upgrades), and AI platforms (Google and Groq).",
    },
    {
      title: "8. Data Security",
      content: "We implement industry-standard security measures, including database encryption and secure auth tokens, to protect your personal information from unauthorized access.",
    },
    {
      title: "9. Your Rights",
      content: "You have the right to access, edit, or request permanent deletion of your account and all associated analyses at any time through the profile menu.",
    },
    {
      title: "10. Contact Us",
      content: "For privacy questions or data concerns, please contact support@resumepilot.site.",
    },
  ];

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:block">
        <MarketingLayout>
          <section className="hero-ambient py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
              <Card className="mt-8 border-border/60 bg-background/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      ResumePilot collects user authentication information and uploaded resumes solely for providing ATS resume analysis services.
                    </p>
                    <p>
                      We do not sell user data.
                    </p>
                    <p>
                      Users may request deletion of their account and associated data by contacting:
                      <br />
                      <a href="mailto:aryan639244@gmail.com" className="font-semibold text-primary">
                        aryan639244@gmail.com
                      </a>
                    </p>
                    <p className="text-sm">
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
                onClick={() => {
                  if (search.from === "help") {
                    navigate({ to: "/dashboard/profile", search: { section: "help" } });
                  } else {
                    navigate({ to: "/dashboard/profile" });
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <h1 className="font-display text-xl font-bold">Privacy Policy</h1>
            </div>

            {/* Content list */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <div className="flex items-center gap-3 mb-3 text-primary">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Data Privacy Commitment</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ResumePilot is committed to protecting your personal data. Below is a detailed breakdown of how we collect, process, and secure your information.
                </p>
              </div>

              {privacySections.map((section, idx) => (
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
