import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ChevronLeft, Trash2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/data-deletion")({
  head: () => ({
    meta: [
      { title: "Data Deletion Request — ResumePilot" },
      { name: "description", content: "How to request deletion of your ResumePilot account and data." },
    ],
  }),
  component: DataDeletionPage,
});

function DataDeletionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteRequest = () => {
    const email = user?.email || "";
    const subject = encodeURIComponent("Data Deletion Request");
    const body = encodeURIComponent(`Account Email: ${email}\nReason: `);
    window.location.href = `mailto:support@resumepilot.site?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:block">
        <MarketingLayout>
          <section className="hero-ambient py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Data Deletion Request</h1>
              <Card className="mt-8 border-border/60 bg-background/80">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Users can request deletion of their ResumePilot account and associated data by emailing:
                    </p>
                    <p>
                      <a href="mailto:aryan639244@gmail.com" className="font-semibold text-primary">
                        aryan639244@gmail.com
                      </a>
                    </p>
                    <p>
                      Include the email address associated with the account.
                    </p>
                    <p>
                      Data will be deleted within a reasonable time after verification.
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
              <h1 className="font-display text-xl font-bold">Data Deletion</h1>
            </div>

            {/* Content card */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <div className="flex items-center gap-3 mb-3 text-red-400">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Account Deletion & Data Rights</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  At ResumePilot, you have complete control over your personal data. You can request the permanent deletion of your account, previous ATS resume analyses, and saved reports.
                </p>
              </div>

              {/* Data types card */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  What will be deleted?
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-400 text-xs font-bold">1</div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Delete Account</p>
                      <p className="text-[11px] text-muted-foreground">Permanent removal of your email profile, credentials, and settings.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-400 text-xs font-bold">2</div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Delete Analyses</p>
                      <p className="text-[11px] text-muted-foreground">Wiping your entire analysis versions and history records from our system.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-400 text-xs font-bold">3</div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Delete Reports</p>
                      <p className="text-[11px] text-muted-foreground">Removing bookmarked resumes, matched keywords, and job descriptions from the Vault.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 text-center space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click below to send an automated deletion request email. We will process your deletion request after identity verification.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={handleDeleteRequest}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Request Data Deletion</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileShell>
      </div>
    </>
  );
}
