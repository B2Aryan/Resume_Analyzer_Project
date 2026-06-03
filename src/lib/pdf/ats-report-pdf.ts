import { jsPDF } from "jspdf";
import type { ATSAnalysisResult, JDMatchResult } from "@/lib/ats/types";

export interface ATSReportPdfInput extends ATSAnalysisResult {
  role: string;
  fileName?: string;
  hasJobDescription?: boolean;
}

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 12;

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "report";
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
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
  doc.text("ResumePilot — ATS Analysis Report", MARGIN, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${formatGeneratedDate()}`, MARGIN, 22);
  doc.text(`Target role: ${role}`, MARGIN, 28);

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

function drawBodyText(doc: jsPDF, y: number, text: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  const blockHeight = lines.length * 4.2 + 4;
  y = ensureSpace(doc, y, blockHeight);
  doc.text(lines, MARGIN, y);
  return y + blockHeight;
}

function drawBulletList(doc: jsPDF, y: number, items: string[]): number {
  if (items.length === 0) {
    return drawBodyText(doc, y, "None identified.");
  }

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

function drawScoreHero(doc: jsPDF, y: number, score: number): number {
  y = ensureSpace(doc, y, 28);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(MARGIN, y - 6, CONTENT_WIDTH, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(`${score}`, MARGIN + 6, y + 8);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text("/ 100 Overall ATS Score", MARGIN + 22, y + 8);

  return y + 22;
}

function drawBreakdown(doc: jsPDF, y: number, data: ATSReportPdfInput): number {
  y = drawSectionTitle(doc, y, "Score Breakdown");

  const rows: [string, number][] = [
    ["ATS Compatibility", data.atsCompatibility],
    ["Keyword Match", data.keywordMatch],
    ["Skills Section", data.skillsScore],
    ["Project Section", data.projectScore],
  ];

  doc.setFontSize(9);
  for (const [label, value] of rows) {
    y = ensureSpace(doc, y, 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(label, MARGIN, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${value}/100`, PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 5.5;
  }

  return y + 4;
}

function drawJDMatchSection(doc: jsPDF, y: number, jd: JDMatchResult): number {
  y = drawSectionTitle(doc, y, "Job Description Match");

  const total = jd.matchedKeywords.length + jd.missingKeywords.length;
  y = ensureSpace(doc, y, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("JD Match Score", MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${jd.jdMatchScore}%`, PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 5.5;
  y = drawBodyText(
    doc,
    y,
    total > 0
      ? `Based on ${jd.matchedKeywords.length} of ${total} technical keywords from the job description found in your resume.`
      : "No scorable technical keywords were extracted from the job description.",
  );

  y = drawKeywordTags(doc, y, "Matched Keywords", jd.matchedKeywords);
  y = drawKeywordTags(doc, y, "Missing Keywords (JD)", jd.missingKeywords);
  y = drawSectionTitle(doc, y, "JD Summary");
  return drawBodyText(
    doc,
    y,
    jd.jdSummary.trim() !== "" ? jd.jdSummary : "No JD summary available.",
  );
}

function drawKeywordTags(doc: jsPDF, y: number, label: string, keywords: string[]): number {
  y = drawSectionTitle(doc, y, label);
  const text =
    keywords.length > 0 ? keywords.join(", ") : "None identified.";
  return drawBodyText(doc, y, text);
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

/**
 * Builds and triggers download of a professional ATS analysis PDF report.
 */
export function downloadATSReportPdf(data: ATSReportPdfInput): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = drawHeader(doc, data.role);
  y = drawScoreHero(doc, y, data.score);
  y = drawBreakdown(doc, y, data);

  if (data.hasJobDescription && data.jdMatch) {
    y = drawJDMatchSection(doc, y, data.jdMatch);
  }

  y = drawSectionTitle(doc, y, "Strengths");
  y = drawBulletList(doc, y, data.strengths);

  y = drawSectionTitle(doc, y, "Improvement Areas");
  y = drawBulletList(doc, y, data.suggestions);

  y = drawKeywordTags(doc, y, "Missing Keywords", data.missingKeywords);

  y = drawSectionTitle(doc, y, "AI Summary");
  y = drawBodyText(
    doc,
    y,
    data.summary.trim() !== "" ? data.summary : "No AI summary available.",
  );

  drawFooter(doc);

  const roleSlug = sanitizeFileName(data.role);
  const dateSlug = new Date().toISOString().slice(0, 10);
  const prefix = data.hasJobDescription && data.jdMatch ? "JD-Match-Report" : "ATS-Report";
  doc.save(`${prefix}-${roleSlug}-${dateSlug}.pdf`);
}
