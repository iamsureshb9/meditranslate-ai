import OpenAI from "openai";
import { NextResponse } from "next/server";

import { DEFAULT_OPENAI_MODEL, MAX_REPORT_TEXT_LENGTH } from "@/lib/constants";
import type { ExplainLike12Request, ExplainLike12Response } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

function hasConfiguredOpenAIKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key.startsWith("sk-"));
}

function buildExplainLike12Prompt(reportText: string, summary?: string) {
  return [
    {
      role: "system" as const,
      content:
        "You explain medical reports to a 12-year-old. Use very simple words, short sentences, and a friendly tone. Do not diagnose. Do not scare the patient. Explain what the results may mean and remind them to ask a doctor. Return only valid JSON."
    },
    {
      role: "user" as const,
      content: `Create an ultra-simple explanation of this medical report.

Return exactly this JSON shape:
{
  "explanation": ""
}

Rules:
- Write like you are kindly explaining this to a 12-year-old.
- Use short sentences.
- Avoid medical jargon when possible.
- If you mention a medical word, explain it simply.
- Do not say the patient has a disease.
- Include a gentle reminder to talk with a doctor.
- Keep it to 4-6 short sentences.

Normal summary, if available:
${summary ?? "Not provided"}

Extracted report text:
${reportText}`
    }
  ];
}

export async function POST(request: Request) {
  try {
    let body: ExplainLike12Request;

    try {
      body = (await request.json()) as ExplainLike12Request;
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const reportText = body.reportText?.trim();

    if (!reportText) {
      return NextResponse.json({ error: "Report text is required." }, { status: 400 });
    }

    if (reportText.length > MAX_REPORT_TEXT_LENGTH) {
      return NextResponse.json({ error: "Report text is too long. Please upload a shorter report." }, { status: 413 });
    }

    if (!hasConfiguredOpenAIKey()) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to use this mode with uploaded reports." },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      messages: buildExplainLike12Prompt(reportText, body.summary),
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json({ error: "The simple explanation came back empty." }, { status: 502 });
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content) as unknown;
    } catch {
      return NextResponse.json({ error: "The simple explanation returned invalid JSON." }, { status: 502 });
    }

    const explanation =
      parsed &&
      typeof parsed === "object" &&
      "explanation" in parsed &&
      typeof parsed.explanation === "string"
        ? parsed.explanation.trim()
        : "";

    if (!explanation) {
      return NextResponse.json({ error: "The simple explanation was missing from the AI response." }, { status: 502 });
    }

    const response: ExplainLike12Response = { explanation };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Explain Like I'm 12 failed:", error);
    return NextResponse.json({ error: "Could not create a simpler explanation. Please try again." }, { status: 500 });
  }
}
