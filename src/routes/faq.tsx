import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { createSeoHead, ORGANIZATION_SCHEMA } from "@/lib/seo";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileFAQ } from "@/components/mobile/MobileFAQ";

export const Route = createFileRoute("/faq")({
  head: () => createSeoHead({
    title: "FAQ",
    description: "Answers to common questions about resume analysis, pricing and privacy.",
    path: "/faq",
    schema: {
      "@context": "https://schema.org",
      "@graph": [ORGANIZATION_SCHEMA],
    },
  }),
  component: FAQPage,
});

const groups = [
  {
    title: "Getting started",
    items: [
      { q: "How do I run my first scan?", a: "Click 'Upload Resume' from any page, drop your PDF or paste your text, add a target role, and hit Analyze. Results take under 10 seconds." },
      { q: "Do I need to sign up?", a: "No, you can run a scan without an account. Sign up only if you want to save history and reports." },
    ],
  },
  {
    title: "Analysis",
    items: [
      { q: "How accurate is the ATS score?", a: "Our scoring mirrors the most common ATS parsers. It's a strong proxy that catches the issues recruiters' tools care about." },
      { q: "Why are my keywords marked missing if they're in my resume?", a: "We check naturalness and context, not just presence. A skill listed in a wall of text often gets weighted lower than one tied to a project." },
      { q: "Can I tailor results to a specific job?", a: "Yes. Paste the full job description in the target role field for the most relevant keyword and section feedback." },
    ],
  },
  {
    title: "Plans & pricing",
    items: [
      { q: "Is the free plan really enough?", a: "For most students preparing 1-2 resumes, yes. Pro is for power users running many tailored scans across roles." },
      { q: "Can I cancel Pro anytime?", a: "Yes, cancel from your profile in one click — you keep access until the end of the billing period." },
    ],
  },
  {
    title: "Privacy",
    items: [
      { q: "What happens to my resume?", a: "It's processed for analysis and stored only if you save it. We never sell your data or use it to train models." },
      { q: "Can I delete my data?", a: "Yes, you can delete any analysis or your full account from your profile at any time." },
    ],
  },
];

function FAQPage() {
  return (
    <>
      <div className="hidden lg:block">
        <MarketingLayout>
          <section className="hero-ambient py-16">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Frequently asked questions</h1>
              <p className="mt-3 text-muted-foreground">Everything you need to know about ResumePilot.</p>
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
            <div className="space-y-10">
              {groups.map((g) => (
                <div key={g.title}>
                  <h2 className="font-display text-xl font-bold">{g.title}</h2>
                  <Accordion type="single" collapsible className="mt-3">
                    {g.items.map((it, i) => (
                      <AccordionItem key={i} value={`${g.title}-${i}`}>
                        <AccordionTrigger className="text-left">{it.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-semibold">Still have questions?</p>
              <p className="mt-1 text-sm text-muted-foreground">Drop us a note from your profile after signing up.</p>
              <Button asChild variant="hero" className="mt-5"><Link to="/upload">Try a free scan</Link></Button>
            </div>
          </section>
        </MarketingLayout>
      </div>

      <div className="block lg:hidden">
        <MobileShell>
          <MobileFAQ />
        </MobileShell>
      </div>
    </>
  );
}
