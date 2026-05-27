"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, FileHeart, FileText, FlaskConical, HeartPulse, PlayCircle, ShieldAlert, Sparkles, UploadCloud } from "lucide-react";

import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoReports } from "@/lib/demo-reports";
import { REPORT_STORAGE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UploadedReport } from "@/types/upload";

export function UploadPageClient() {
  const router = useRouter();
  const [report, setReport] = useState<UploadedReport>();

  const handleReportReady = useCallback((readyReport: UploadedReport) => {
    setReport(readyReport);
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(readyReport));
  }, []);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
      <section className="animate-fade-up">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Hackathon-ready demo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">Upload or try a demo report</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Start with a one-click sample report or upload a PDF from your device. The demo path opens a polished results dashboard instantly for judges.
          </p>
        </div>

        <Card className="mb-8 overflow-hidden border-blue-200 bg-white shadow-soft">
          <CardHeader className="border-b border-blue-100 bg-blue-600 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Try Demo Report</CardTitle>
                <CardDescription className="mt-2 text-blue-100">
                  No file needed. Choose a realistic lab report and jump straight to AI analysis.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="border-white/40 bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/results?demo=cbc">
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Launch CBC Demo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            {demoReports.map((demo, index) => (
              <Link
                key={demo.id}
                href={`/results?demo=${demo.id}`}
                className={cn(
                  "group rounded-lg border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  index === 0 ? "border-blue-200" : "border-slate-200"
                )}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  {demo.id === "cbc" ? <FileHeart className="h-5 w-5" aria-hidden="true" /> : null}
                  {demo.id === "cholesterol" ? <HeartPulse className="h-5 w-5" aria-hidden="true" /> : null}
                  {demo.id === "vitamin-d" ? <FlaskConical className="h-5 w-5" aria-hidden="true" /> : null}
                </div>
                <p className="text-base font-semibold text-slate-950">{demo.shortLabel}</p>
                <p className="mt-2 min-h-12 text-xs leading-5 text-slate-600">{demo.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                  Try this report
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <Card className="overflow-hidden border-blue-100 bg-white shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" aria-hidden="true" />
                <CardTitle>Supported Reports</CardTitle>
              </div>
              <CardDescription>Best suited for common lab reports and summaries.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-700">
              {["CBC blood reports", "Cholesterol and lipid panels", "Vitamin and metabolic labs", "PDF reports under 4 MB"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-blue-100 bg-white shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-700" aria-hidden="true" />
                <CardTitle>Sample Transformation</CardTitle>
              </div>
              <CardDescription>Dense report data becomes a structured patient dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-200 shadow-inner">
                <div className="mb-3 flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="font-semibold text-white">CBC Blood Report</p>
                <p className="mt-2 text-slate-300">Hemoglobin 11.2 g/dL, MCV 78 fL, RDW 15.8%</p>
                <div className="mt-4 rounded-md bg-white p-3 text-slate-800">
                  <p className="font-semibold text-blue-700">Plain English Summary</p>
                  <p className="mt-1">Your red blood cells may be a little low, which can make you feel tired.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <FileUploader onReportReady={handleReportReady} />
      </section>

      <aside className="animate-scale-in space-y-5">
        <Card className="surface-card bg-white/95">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UploadCloud className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
            {["Upload or choose a demo report.", "Text is extracted from the report.", "MediTranslate AI turns it into a clear dashboard.", "Download the final analysis as a PDF."].map((step, index) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card bg-white/95">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>Current report</CardTitle>
            <CardDescription>Extracted text remains in browser state for this mock workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            {report ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{report.fileName}</p>
                  <p className="mt-1 text-sm text-slate-600">{Math.max(1, Math.round(report.extractedText.length / 5))} estimated words extracted</p>
                </div>
                <Button className="w-full" onClick={() => router.push("/results")}>
                  Generate Analysis Report
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No report selected yet. Use a demo report for the fastest judge walkthrough, or upload a PDF under 4 MB.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 shadow-none">
          <CardContent className="flex gap-3 p-4 text-sm leading-6 text-amber-900">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-amber-700" aria-hidden="true" />
            <p>
              This tool is for educational purposes only and is not medical advice. Always consult a licensed healthcare professional.
            </p>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
