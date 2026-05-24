import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ResumeCheck AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <MarketingLayout>
      <section className="hero-ambient py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Free forever to start
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight">Land more interviews, starting today.</h1>
            <p className="mt-4 max-w-md text-muted-foreground">Sign in to save your analyses, track score trends, and run unlimited tailored scans.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ ATS score on every scan</li>
              <li>✓ Keyword match against the JD</li>
              <li>✓ Section-level rewrites</li>
            </ul>
          </div>

          <Card className="border-border/60 shadow-elegant">
            <CardContent className="p-7">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Log in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-5 space-y-4">
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@college.edu" /></div>
                  <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <Button asChild variant="hero" className="w-full" size="lg"><Link to="/dashboard">Log in <ArrowRight className="h-4 w-4" /></Link></Button>
                  <p className="text-center text-xs text-muted-foreground">Forgot password?</p>
                </TabsContent>

                <TabsContent value="signup" className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>First name</Label><Input placeholder="Aanya" /></div>
                    <div className="space-y-1.5"><Label>Last name</Label><Input placeholder="Sharma" /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@college.edu" /></div>
                  <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" /></div>
                  <Button asChild variant="hero" className="w-full" size="lg"><Link to="/dashboard">Create account <ArrowRight className="h-4 w-4" /></Link></Button>
                  <p className="text-center text-xs text-muted-foreground">By signing up you agree to our Terms.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
