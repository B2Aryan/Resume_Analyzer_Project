import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

type PdfTextContent = Awaited<ReturnType<pdfjsLib.PDFPageProxy["getTextContent"]>>;
type PdfTextContentItem = PdfTextContent["items"][number];
type PdfTextItem = PdfTextContentItem & { str: string };

function isPdfTextItem(item: PdfTextContentItem): item is PdfTextItem {
  return "str" in item;
}

function textFromPdfItem(item: PdfTextContentItem): string {
  return isPdfTextItem(item) ? item.str : "";
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(textFromPdfItem).join(" ");
      fullText += pageText + "\n";
    }

    if (!fullText.trim()) {
      const error = new Error("SCANNED_PDF_DETECTED");
      error.name = "SCANNED_PDF_DETECTED";
      throw error;
    }

    return fullText;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse PDF file");
  }
}
