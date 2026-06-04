import { jsPDF } from "jspdf";

const MARGIN = 25;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 15;

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "cover-letter";
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > FOOTER_Y - 4) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawCoverLetterText(doc: jsPDF, y: number, text: string): number {
  const paragraphs = text.split(/\n\n+/);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const lines = doc.splitTextToSize(trimmed, CONTENT_WIDTH);
    const blockHeight = lines.length * 5 + 6;
    y = ensureSpace(doc, y, blockHeight);
    doc.text(lines, MARGIN, y);
    y += blockHeight;
  }

  return y;
}

function drawFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
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
 * Builds and triggers download of a professional cover letter PDF.
 */
export function downloadCoverLetterPdf(
  coverLetter: string,
  targetRole: string,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN;
  y = drawCoverLetterText(doc, y, coverLetter);
  drawFooter(doc);

  const roleSlug = sanitizeFileName(targetRole);
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`Cover_Letter_${roleSlug}_${dateSlug}.pdf`);
}
