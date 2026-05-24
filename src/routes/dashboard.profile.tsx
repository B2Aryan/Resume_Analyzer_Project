import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — ResumeCheck AI" }] }),
  component: () => (
    <AppShell title="Profile" subtitle="Manage your account details.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>First name</Label><Input defaultValue="Aanya" /></div>
              <div className="space-y-1.5"><Label>Last name</Label><Input defaultValue="Sharma" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input defaultValue="aanya@college.edu" /></div>
              <div className="space-y-1.5"><Label>College</Label><Input placeholder="e.g. NIT Trichy" /></div>
              <div className="space-y-1.5"><Label>Graduation year</Label><Input placeholder="2027" /></div>
            </div>
            <Button variant="hero" className="mt-6">Save changes</Button>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-gradient-card">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</p>
            <p className="mt-1 font-display text-2xl font-bold">Free</p>
            <p className="mt-2 text-sm text-muted-foreground">3 scans / month included.</p>
            <Button variant="outline" className="mt-5 w-full">Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  ),
});
