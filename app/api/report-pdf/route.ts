import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { NextResponse } from "next/server";

import type { MedicalAnalysis, ReportPdfRequest } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 20;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMedicalAnalysis(value: unknown): value is MedicalAnalysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MedicalAnalysis>;
  return (
    typeof candidate.summary === "string" &&
    isStringArray(candidate.importantFindings) &&
    Array.isArray(candidate.abnormalValues) &&
    isStringArray(candidate.lifestyleSuggestions) &&
    isStringArray(candidate.questionsForDoctor) &&
    Boolean(candidate.severity) &&
    typeof candidate.severity?.label === "string" &&
    typeof candidate.severity?.description === "string"
  );
}

function textOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() ? value.trim() : fallback;
}

function ensureSectionSpace(document: PDFKit.PDFDocument, minimumSpace = 96) {
  if (document.y > document.page.height - document.page.margins.bottom - minimumSpace) {
    document.addPage();
  }
}

function addSection(document: PDFKit.PDFDocument, title: string, body: string | string[]) {
  ensureSectionSpace(document);
  document.moveDown(1);
  document.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text(title);
  document.moveDown(0.4);
  document.font("Helvetica").fontSize(10.5).fillColor("#334155");

  if (Array.isArray(body)) {
    if (body.length === 0) {
      document.text("No items were highlighted for this section.");
      return;
    }

    body.forEach((item) => {
      document.text(`- ${item}`, {
        indent: 12,
        paragraphGap: 4
      });
    });
    return;
  }

  document.text(body, {
    lineGap: 3
  });
}

async function createPdfBuffer(payload: ReportPdfRequest) {
  const chunks: Buffer[] = [];
  const document = new PDFDocument({
    bufferPages: true,
    info: {
      Title: `${textOrFallback(payload.title, "MediTranslate AI Report")} - Analysis`,
      Author: "MediTranslate AI",
      Subject: "Patient-friendly medical report explanation"
    },
    margin: 48,
    size: "A4"
  });

  document.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const generatedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date());

  document.roundedRect(36, 32, 523, 92, 8).fill("#eff6ff");
  document.fillColor("#0b6fdc").font("Helvetica-Bold").fontSize(22).text("MediTranslate AI", 54, 50);
  document.fillColor("#0f172a").fontSize(13).text(textOrFallback(payload.title, "Medical Report Analysis"), 54, 78);
  document.fillColor("#475569").font("Helvetica").fontSize(9).text(`Generated ${generatedAt} UTC`, 54, 100);

  document.y = 150;
  document.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Source report");
  document.font("Helvetica").fontSize(10).fillColor("#475569").text(textOrFallback(payload.fileName, "Uploaded report"));

  addSection(document, "Plain English Summary", payload.analysis.summary);
  addSection(document, "Severity", `${payload.analysis.severity.label}: ${payload.analysis.severity.description}`);
  addSection(document, "Important Findings", payload.analysis.importantFindings);

  document.moveDown(1);
  document.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text("Abnormal Values");
  document.moveDown(0.4);
  if (payload.analysis.abnormalValues.length === 0) {
    document.font("Helvetica").fontSize(10.5).fillColor("#334155").text("No abnormal values were highlighted.");
  } else {
    payload.analysis.abnormalValues.forEach((value) => {
      document.font("Helvetica-Bold").fontSize(10.5).fillColor("#0f172a").text(`${value.label}: ${value.value}`);
      document.font("Helvetica").fontSize(10).fillColor("#475569").text(`Reference: ${value.reference}`);
      document.font("Helvetica").fontSize(10).fillColor("#334155").text(value.note, { paragraphGap: 6 });
    });
  }

  addSection(document, "Lifestyle Recommendations", payload.analysis.lifestyleSuggestions);
  addSection(document, "Questions for Doctor", payload.analysis.questionsForDoctor);

  if (payload.simpleExplanation?.trim()) {
    addSection(document, "Explain Like I'm 12", payload.simpleExplanation);
  }

  addSection(
    document,
    "Medical Disclaimer",
    "This report is for education only. It does not diagnose conditions, prescribe treatment, or replace care from a licensed clinician. Review the original report and this explanation with your doctor."
  );

  const range = document.bufferedPageRange();
  for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
    document.switchToPage(pageIndex);
    const footerY = document.page.height - document.page.margins.bottom - 12;

    document.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(`Page ${pageIndex + 1} of ${range.count}`, 48, footerY, {
      align: "center",
      lineBreak: false,
      width: 500
    });
  }

  document.end();
  return done;
}

export async function POST(request: Request) {
  try {
    let payload: ReportPdfRequest;

    try {
      payload = (await request.json()) as ReportPdfRequest;
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    if (!isMedicalAnalysis(payload.analysis)) {
      return NextResponse.json({ error: "A valid analysis is required to generate the report PDF." }, { status: 400 });
    }

    const pdfBuffer = await createPdfBuffer(payload);
    const safeTitle = textOrFallback(payload.title, "meditranslate-report")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${safeTitle || "meditranslate-report"}.pdf"`,
        "Content-Type": "application/pdf"
      }
    });
  } catch (error) {
    console.error("Report PDF generation failed:", error);
    return NextResponse.json({ error: "Could not generate the report PDF. Please try again." }, { status: 500 });
  }
}
