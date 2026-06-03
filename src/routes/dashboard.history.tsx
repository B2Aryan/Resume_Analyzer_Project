import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search, FileX } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "History — ResumePilot" }] }),
  component: HistoryPage,
});

const items = [
  { name: "Aanya_Sharma_v3.pdf", role: "Frontend Intern", score: 82, date: "May 9, 2026" },
  { name: "Aanya_Sharma_v2.pdf", role: "Frontend Intern", score: 71, date: "May 8, 2026" },
  { name: "Aanya_Sharma_v1.pdf", role: "SDE Intern", score: 64, date: "May 6, 2026" },
  { name: "Internship_Resume.pdf", role: "Backend Engineer", score: 58, date: "May 2, 2026" },
];

function tone(score: number) {
  return score >= 80 ? "text-success bg-success/10" : score >= 60 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
}

function HistoryPage() {
  return (
    <AppShell title="Analysis history" subtitle="Every scan you've run, in one place.">
      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by file or role" className="pl-9" />
        </div>
        <Button asChild variant="hero"><Link to="/upload">New scan</Link></Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileX className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No scans yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Run your first analysis to see it here.</p>
            <Button asChild className="mt-5" variant="hero"><Link to="/upload">Upload Resume</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <Card key={it.name} className="border-border/60 transition-shadow hover:shadow-soft">
              <CardContent className="grid items-center gap-3 p-4 sm:grid-cols-[auto,1fr,auto,auto,auto]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.role}</p>
                </div>
                <span className="text-xs text-muted-foreground">{it.date}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(it.score)}`}>{it.score}/100</span>
                <Button asChild size="sm" variant="outline"><Link to="/result">View</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
