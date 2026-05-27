import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 20;

async function extractWithPdfJs(buffer: Buffer) {
  const canvas = await import("@napi-rs/canvas");
  const runtimeGlobals = globalThis as Record<string, unknown>;

  runtimeGlobals.DOMMatrix ??= canvas.DOMMatrix;
  runtimeGlobals.DOMPoint ??= canvas.DOMPoint;
  runtimeGlobals.DOMRect ??= canvas.DOMRect;
  runtimeGlobals.ImageData ??= canvas.ImageData;
  runtimeGlobals.Path2D ??= canvas.Path2D;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const documentOptions: Record<string, unknown> = {
    data: new Uint8Array(buffer),
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
    useWorkerFetch: false
  };
  const loadingTask = pdfjs.getDocument(documentOptions);
  const document = await loadingTask.promise;
  const pageTexts: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
        .filter(Boolean)
        .join(" ");

      pageTexts.push(text);
    }

    return {
      pageCount: document.numPages,
      text: pageTexts.join("\n").trim()
    };
  } finally {
    await document.destroy();
  }
}

async function extractPdfText(buffer: Buffer) {
  try {
    const parsed = await pdfParse(buffer);

    return {
      pageCount: parsed.numpages,
      text: parsed.text.trim()
    };
  } catch (error) {
    console.warn("pdf-parse failed, retrying with pdfjs-dist:", error);
    return extractWithPdfJs(buffer);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file was provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files can be extracted by this endpoint." }, { status: 415 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "PDF files must be 4 MB or smaller." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await extractPdfText(buffer);
    const text = parsed.text;

    if (!text) {
      return NextResponse.json({ error: "No readable text was found in this PDF." }, { status: 422 });
    }

    return NextResponse.json({
      text,
      pageCount: parsed.pageCount
    });
  } catch (error) {
    console.error("PDF extraction failed:", error);
    return NextResponse.json({ error: "PDF extraction failed. Try another report file." }, { status: 500 });
  }
}
