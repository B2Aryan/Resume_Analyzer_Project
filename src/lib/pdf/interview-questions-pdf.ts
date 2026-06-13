
import { jsPDF } from "jspdf";
import type { InterviewQuestionsResponse } from "@/lib/ats/interview-questions";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 12;

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "interview-questions";
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date());
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > FOOTER_Y - 4) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawHeader(doc: jsPDF, role: string): number {
  let y = MARGIN;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_WIDTH, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ResumePilot Interview Preparation Kit", MARGIN, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Role: ${role}`, MARGIN, 22);
  doc.text(`Generated: ${formatGeneratedDate()}`, MARGIN, 28);

  doc.setTextColor(30, 41, 59);
  return 44;
}

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  y = ensureSpace(doc, y, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);
  return y + 8;
}

function drawNumberedList(doc: jsPDF, y: number, items: string[]): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const lines = doc.splitTextToSize(`${i + 1}. ${item}`, CONTENT_WIDTH - 4);
    const blockHeight = lines.length * 4.2 + 2;
    y = ensureSpace(doc, y, blockHeight);
    doc.text(lines, MARGIN + 2, y);
    y += blockHeight;
  }

  return y + 4;
}

function drawBulletList(doc: jsPDF, y: number, items: string[]): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, CONTENT_WIDTH - 4);
    const blockHeight = lines.length * 4.2 + 2;
    y = ensureSpace(doc, y, blockHeight);
    doc.text(lines, MARGIN + 2, y);
    y += blockHeight;
  }

  return y + 2;
}

function drawFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ResumePilot · Page ${i} of ${pages}`,
      PAGE_WIDTH / 2,
      FOOTER_Y,
      { align: "center" },
    );
  }
}

export function downloadInterviewQuestionsPdf(
  questions: InterviewQuestionsResponse,
  role: string,
): void {
  console.log("[downloadInterviewQuestionsPdf] Starting PDF generation...");
  console.log("[downloadInterviewQuestionsPdf] Questions data:", JSON.stringify(questions, null, 2));
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = drawHeader(doc, role);

    // Project Questions
    if (questions.project_questions.length > 0) {
      y = drawSectionTitle(doc, y, "Project Questions");
      y = drawNumberedList(doc, y, questions.project_questions);
    }

    // Technical Questions
    if (questions.technical_questions.length > 0) {
      y = drawSectionTitle(doc, y, "Technical Questions");
      const technicalQuestionTexts = questions.technical_questions.map(q => q.question);
      y = drawNumberedList(doc, y, technicalQuestionTexts);
      
      // Add expected answer points for each technical question
      for (let i = 0; i < questions.technical_questions.length; i++) {
        const techQ = questions.technical_questions[i];
        if (techQ.expectedAnswerPoints.length > 0) {
          const lines = doc.splitTextToSize(`   Expected Points: ${techQ.expectedAnswerPoints.join(", ")}`, CONTENT_WIDTH - 4);
          const blockHeight = lines.length * 4.2 + 2;
          y = ensureSpace(doc, y, blockHeight);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(75, 85, 99);
          doc.text(lines, MARGIN + 2, y);
          y += blockHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
        }
      }
    }

    // Behavioral Questions
    if (questions.behavioral_questions.length > 0) {
      y = drawSectionTitle(doc, y, "Behavioral Questions");
      y = drawNumberedList(doc, y, questions.behavioral_questions);
    }

    // System Design Questions
    if (questions.system_design_questions.length > 0) {
      y = drawSectionTitle(doc, y, "System Design Questions");
      y = drawNumberedList(doc, y, questions.system_design_questions);
    }

    // Follow-up Questions
    if (questions.follow_up_questions.length > 0) {
      y = drawSectionTitle(doc, y, "Follow-Up Questions");
      y = drawNumberedList(doc, y, questions.follow_up_questions);
    }

    // Interview Tips
    y = drawSectionTitle(doc, y, "Interview Tips");
    y = drawBulletList(doc, y, [
      "Review your projects before answering.",
      "Use the STAR method for behavioral questions.",
      "Be ready to explain technical decisions from your resume.",
      "Prepare examples of challenges, failures, and lessons learned.",
      "Be able to justify the technologies used in your projects.",
      "Practice explaining your projects in under 2 minutes.",
    ]);

    drawFooter(doc);
    const roleSlug = sanitizeFileName(role);
    doc.save(`Interview_Questions_${roleSlug}.pdf`);
    console.log("[downloadInterviewQuestionsPdf] PDF generated successfully!");
  } catch (error) {
    console.error("[downloadInterviewQuestionsPdf] Error generating PDF:", error);
    if (error instanceof Error) {
      console.error("[downloadInterviewQuestionsPdf] Error message:", error.message);
      console.error("[downloadInterviewQuestionsPdf] Error stack:", error.stack);
    }
    throw error;
  }
}

