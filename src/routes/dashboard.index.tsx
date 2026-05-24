import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, FileText, Plus, Bookmark, Trophy, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ResumeCheck AI" }] }),
  component: DashboardHome,
});

const recent = [
  { name: "Aanya_Sharma_v3.pdf", role: "Frontend Intern", score: 82, date: "Today" },
  { name: "Aanya_Sharma_v2.pdf", role: "Frontend Intern", score: 71, date: "Yesterday" },
  { name: "Aanya_Sharma_v1.pdf", role: "SDE Intern", score: 64, date: "3 days ago" },
];

function DashboardHome() {
  return (
    <AppShell
      title="Welcome back, Aanya"
      subtitle="Here's how your resumes are performing this week."
      actions={<Button asChild variant="hero"><Link to="/upload"><Plus className="h-4 w-4" /> New Analysis</Link></Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Latest score", value: "82", icon: Trophy, tone: "text-success" },
          { label: "Total scans", value: "12", icon: FileText, tone: "text-primary" },
          { label: "Saved reports", value: "4", icon: Bookmark, tone: "text-warning" },
          { label: "Score trend", value: "+18", icon: TrendingUp, tone: "text-success" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-accent ${s.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent scans</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard/history">View all</Link></Button>
            </div>
            <div className="mt-4 divide-y divide-border">
              {recent.map((r) => (
                <Link to="/result" key={r.name} className="grid items-center gap-4 py-4 transition-colors hover:bg-muted/30 rounded-lg px-2 sm:grid-cols-[1fr,auto,auto,auto]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role}</p>
                    </div>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.date}</span>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold">{r.score}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ATS</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-card">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Score trend</h2>
            <p className="text-xs text-muted-foreground">Last 5 scans</p>
            <div className="mt-6 flex h-32 items-end gap-3">
              {[48, 56, 64, 71, 82].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-gradient-primary transition-all" style={{ height: `${v}%` }} />
                  <span className="text-[10px] text-muted-foreground">v{i+1}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">You've improved <span className="font-semibold text-success">+34 points</span> 🎉</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
