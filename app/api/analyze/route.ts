import OpenAI from "openai";
import { NextResponse } from "next/server";

import { DEFAULT_OPENAI_MODEL, MAX_REPORT_TEXT_LENGTH } from "@/lib/constants";
import { buildReportSpecificAnalysis } from "@/lib/report-analysis";
import type { AbnormalValue, AnalysisSeverity, AnalyzeRequest, MedicalAnalysis } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

const severityLevels: AnalysisSeverity["level"][] = ["low", "moderate", "high"];

function hasConfiguredOpenAIKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key.startsWith("sk-"));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function normalizeSeverity(value: unknown, fallback: AnalysisSeverity): AnalysisSeverity {
  if (isPlainObject(value)) {
    const level =
      typeof value.level === "string" && severityLevels.includes(value.level.toLowerCase().trim() as AnalysisSeverity["level"])
        ? (value.level.toLowerCase().trim() as AnalysisSeverity["level"])
        : fallback.level;

    return {
      level,
      label: typeof value.label === "string" && value.label.trim() ? value.label.trim() : fallback.label,
      description:
        typeof value.description === "string" && value.description.trim()
          ? value.description.trim()
          : fallback.description
    };
  }

  return fallback;
}

function toAbnormalValues(value: unknown, fallback: AbnormalValue[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item): AbnormalValue | undefined => {
      if (typeof item === "string") {
        return {
          label: item,
          value: "See report",
          reference: "Review original report",
          note: "Discuss this item with your clinician."
        };
      }

      if (!isPlainObject(item)) {
        return undefined;
      }

      return {
        label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : "Report finding",
        value: typeof item.value === "string" && item.value.trim() ? item.value.trim() : "See report",
        reference:
          typeof item.reference === "string" && item.reference.trim() ? item.reference.trim() : "Review original report",
        note: typeof item.note === "string" && item.note.trim() ? item.note.trim() : "Discuss this with your clinician."
      };
    })
    .filter((item): item is AbnormalValue => Boolean(item));
}

function normalizeAnalysis(value: unknown, fallback: MedicalAnalysis): MedicalAnalysis {
  if (!isPlainObject(value)) {
    return fallback;
  }

  const summary =
    typeof value.summary === "string" && value.summary.trim().length > 0
      ? value.summary.trim()
      : fallback.summary;

  return {
    summary: summary.toLowerCase().includes("not a diagnosis")
      ? summary
      : `Disclaimer: This AI explanation is for general education only and is not a diagnosis. ${summary}`,
    importantFindings: toStringArray(value.importantFindings).length
      ? toStringArray(value.importantFindings)
      : fallback.importantFindings,
    abnormalValues: toAbnormalValues(value.abnormalValues, fallback.abnormalValues),
    lifestyleSuggestions: toStringArray(value.lifestyleSuggestions).length
      ? toStringArray(value.lifestyleSuggestions)
      : fallback.lifestyleSuggestions,
    questionsForDoctor: toStringArray(value.questionsForDoctor).length
      ? toStringArray(value.questionsForDoctor)
      : fallback.questionsForDoctor,
    severity: normalizeSeverity(value.severity, fallback.severity)
  };
}

function buildPrompt(reportText: string) {
  return [
    {
      role: "system" as const,
      content:
        "You explain medical reports in simple, patient-friendly English. You must not diagnose, prescribe treatment, or claim certainty. Always include a brief disclaimer that the explanation is educational and should be reviewed with a licensed doctor. Focus on the actual values and findings in the report. Return only valid JSON."
    },
    {
      role: "user" as const,
      content: `Analyze this extracted medical report text.

Return exactly this JSON shape:
{
  "summary": "",
  "importantFindings": [],
  "abnormalValues": [
    {
      "label": "",
      "value": "",
      "reference": "",
      "note": ""
    }
  ],
  "lifestyleSuggestions": [],
  "questionsForDoctor": [],
  "severity": {
    "level": "low",
    "label": "",
    "description": ""
  }
}

Rules:
- Use simple patient-friendly language.
- Avoid diagnosis claims.
- Use severity.level as one of: low, moderate, high.
- Put lab names, imaging findings, values, measurements, and reference ranges in abnormalValues when available.
- If values are normal, say so specifically in importantFindings instead of inventing abnormalities.
- If the report text is incomplete, say what is unclear and suggest asking a doctor.

Report text:
${reportText}`
    }
  ];
}

export async function POST(request: Request) {
  try {
    let body: AnalyzeRequest;

    try {
      body = (await request.json()) as AnalyzeRequest;
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const reportText = body.reportText?.trim();

    if (!reportText) {
      return NextResponse.json({ error: "Report text is required for analysis." }, { status: 400 });
    }

    if (reportText.length > MAX_REPORT_TEXT_LENGTH) {
      return NextResponse.json({ error: "Report text is too long. Please upload a shorter report." }, { status: 413 });
    }

    const fallbackAnalysis = buildReportSpecificAnalysis(reportText);

    if (!hasConfiguredOpenAIKey()) {
      return NextResponse.json(fallbackAnalysis);
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
        messages: buildPrompt(reportText),
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message.content;

      if (!content) {
        console.warn("AI analysis returned an empty response. Falling back to deterministic analysis.");
        return NextResponse.json(fallbackAnalysis);
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(content) as unknown;
      } catch {
        console.warn("AI analysis returned invalid JSON. Falling back to deterministic analysis.");
        return NextResponse.json(fallbackAnalysis);
      }

      return NextResponse.json(normalizeAnalysis(parsed, fallbackAnalysis));
    } catch (error) {
      console.error("OpenAI analysis failed. Falling back to deterministic analysis:", error);
      return NextResponse.json(fallbackAnalysis);
    }
  } catch (error) {
    console.error("AI analysis failed:", error);
    return NextResponse.json({ error: "AI analysis failed. Please try again in a moment." }, { status: 500 });
  }
}
