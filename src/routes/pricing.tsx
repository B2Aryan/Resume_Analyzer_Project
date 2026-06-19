import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, X } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSeoHead, ORGANIZATION_SCHEMA } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => createSeoHead({
    title: "Pricing",
    description: "Choose the best ResumePilot plan for ATS analysis, interview preparation, and career growth.",
    path: "/pricing",
    schema: {
      "@context": "https://schema.org",
      "@graph": [ORGANIZATION_SCHEMA],
    },
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free", price: "₹0", tag: "Best for students",
    desc: "Everything you need to fix your resume for placements.",
    cta: "Start free", href: "/upload", featured: false,
    features: ["3 resume scans / month", "ATS score & breakdown", "Keyword match", "Basic improvement tips", "PDF + paste text"],
    missing: ["Unlimited scans", "JD-tailored rewrites", "History export"],
  },
  {
    name: "Pro", price: "₹199", per: "/month", tag: "Most popular",
    desc: "For active job seekers running many tailored scans.",
    cta: "Go Pro", href: "/login", featured: true,
    features: ["Unlimited scans", "JD-tailored rewrites", "Project bullet rewrites", "History & saved reports export", "Priority analysis", "Email support"],
    missing: [],
  },
];

const compareRows = [
  ["Resume scans", "3 / month", "Unlimited"],
  ["ATS score", "✓", "✓"],
  ["Keyword match", "✓", "✓"],
  ["Section-by-section feedback", "✓", "✓"],
  ["JD-tailored rewrites", "—", "✓"],
  ["Project bullet rewrites", "—", "✓"],
  ["History export", "—", "✓"],
  ["Priority queue", "—", "✓"],
];

function PricingPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Free-first, always
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Simple pricing for students</h1>
          <p className="mt-3 text-muted-foreground">Start free. The free plan is enough for most students. Upgrade only when you need more scans.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <Card key={p.name} className={`relative border-border/60 ${p.featured ? "shadow-elegant ring-2 ring-primary" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                  {p.tag}
                </span>
              )}
              <CardContent className="p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{p.price}</span>
                  {p.per && <span className="text-muted-foreground">{p.per}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <Button asChild className="mt-5 w-full" variant={p.featured ? "hero" : "outline"} size="lg">
                  <Link to={p.href}>{p.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-success" />{f}</li>
                  ))}
                  {p.missing.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 shrink-0" />{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-border/60">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-4 text-left font-semibold">Compare features</th>
                  <th className="p-4 text-left font-semibold">Free</th>
                  <th className="p-4 text-left font-semibold text-primary">Pro</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([f, a, b]) => (
                  <tr key={f} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{f}</td>
                    <td className="p-4 text-muted-foreground">{a}</td>
                    <td className="p-4 font-medium">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </MarketingLayout>
  );
}
