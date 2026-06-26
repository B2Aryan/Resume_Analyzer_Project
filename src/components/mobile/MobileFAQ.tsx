import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  q: string;
  a: string;
}

const faqItems: FAQItem[] = [
  {
    q: "What is ResumePilot?",
    a: "ResumePilot is an AI-powered resume analyzer designed to help job seekers, freshers, and graduates optimize their resumes for Applicant Tracking Systems (ATS) and land more interviews.",
  },
  {
    q: "Is ResumePilot free?",
    a: "Yes, we offer a generous free tier that allows you to run scans and analyze your resume without any cost. Premium options are available for advanced features and unlimited mock interviews.",
  },
  {
    q: "How does ATS analysis work?",
    a: "We parse your resume text, compare it against key industry standards or the job description you provide, and score it based on formatting, keyword match, and structural completeness.",
  },
  {
    q: "Is my resume stored?",
    a: "Your privacy is our priority. Your uploaded resumes are processed for analysis and are only stored on our secure servers if you choose to save the report to your profile history.",
  },
  {
    q: "Can I delete my data?",
    a: "Absolutely. You have full control over your data. You can delete individual reports, specific resumes, or your entire account at any time from your Profile settings.",
  },
  {
    q: "How do Saved Reports work?",
    a: "Once you save an analysis, it gets linked to your account. You can access it anytime from the 'Saved' tab on your dashboard to track your improvement history.",
  },
  {
    q: "Why did my ATS score change?",
    a: "If you modify your resume or analyze it against a different job description, the scoring algorithm will re-evaluate the keywords, format, and sections, which may adjust your overall score.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach our team anytime by sending an email to support@resumepilot.site. We aim to respond to all inquiries within 24–48 hours.",
  },
  {
    q: "Is AI always accurate?",
    a: "While our AI models provide highly accurate and context-aware resume insights, it's always best to review the suggestions to ensure they accurately reflect your professional experience.",
  },
  {
    q: "How can I improve my score?",
    a: "Review the detailed suggestions in your ATS analysis, resolve formatting errors, add missing keywords relevant to your target jobs, and format sections cleanly using standard headers.",
  },
];

export function MobileFAQ() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;

  const handleBack = () => {
    if (search.from === "help") {
      navigate({ to: "/dashboard/profile", search: { section: "help" } });
    } else {
      navigate({ to: "/dashboard/profile" });
    }
  };

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-12 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors active:bg-muted/70"
          aria-label="Back to Profile"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-xl font-bold">FAQ</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 pl-1">
        Frequently asked questions.
      </p>

      {/* Accordion Cards */}
      <Accordion type="single" collapsible className="space-y-3">
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="rounded-2xl border border-border/40 bg-card px-4 py-0 shadow-sm border-b-0"
          >
            <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline py-4">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-xs pb-4 leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
