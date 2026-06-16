import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
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
  );
}
