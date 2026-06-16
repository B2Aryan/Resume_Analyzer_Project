import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
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
  );
}
