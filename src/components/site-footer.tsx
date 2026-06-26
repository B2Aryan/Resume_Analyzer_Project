import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileCheck2, Linkedin, Github } from "lucide-react";
import { DiscordIcon } from "@/components/DiscordIcon";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback-modal";

export function SiteFooter() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <footer className="site-footer">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                <FileCheck2 className="h-5 w-5" />
              </span>
              ResumePilot
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              The free-first resume analyzer built for students and freshers. Beat the ATS and land your next interview.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Features</Link></li>
              <li><Link to="/coming-soon" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Coming Soon</Link></li>
              <li><Link to="/how-it-works" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">How it works</Link></li>
              <li><Link to="/upload" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Upload Resume</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">About</Link></li>
              <li><Link to="/faq" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">FAQ</Link></li>
              <li><Link to="/privacy" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/data-deletion" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Data Deletion</Link></li>
              <li><Link to="/login" className="inline-block transition-all hover:translate-x-0.5 hover:text-foreground">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Help Improve ResumePilot</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Found a bug, missing feature, or have an idea? We’d love to hear from you.
            </p>
            <Button
              onClick={() => setIsFeedbackModalOpen(true)}
              size="sm"
              variant="hero"
              className="mt-3 rounded-full px-4"
            >
              Send Feedback
            </Button>
          </div>
        </div>
        <div>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p>© {new Date().getFullYear()} ResumePilot. Built for students.</p>
            <div className="flex items-center gap-1">
              <a href="https://discord.com/users/b2aryan" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-foreground/5 hover:text-foreground">
                <DiscordIcon className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/b2aryan/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-foreground/5 hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://github.com/B2Aryan" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-foreground/5 hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
