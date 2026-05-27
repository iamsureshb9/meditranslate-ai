"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  HelpCircle,
  ListChecks,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_STORAGE_KEY } from "@/lib/constants";
import { getDemoReport } from "@/lib/demo-reports";
import { mockAnalysis } from "@/lib/mock-results";
import { buildReportSpecificAnalysis } from "@/lib/report-analysis";
import type { ExplainLike12Response, MedicalAnalysis, ReportPdfRequest } from "@/types/analysis";
import type { UploadedReport } from "@/types/upload";

export function ResultsDashboard() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<UploadedReport>();
  const [simpleExplanation, setSimpleExplanation] = useState("");
  const [simpleError, setSimpleError] = useState("");
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportDownloadError, setReportDownloadError] = useState("");
  const [uploadedAnalysis, setUploadedAnalysis] = useState<MedicalAnalysis>();
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);
  const wantsSimpleMode = searchParams.get("simple") === "1";
  const demoFromUrl = getDemoReport(searchParams.get("demo") ?? undefined);
  const demo = demoFromUrl ?? getDemoReport(report?.demoId);
  const analysis = demo?.analysis ?? uploadedAnalysis ?? mockAnalysis;
  const isDemo = Boolean(demo);
  const isUploadedAnalysis = Boolean(report && !demo);

  const reportTitle = demo?.title ?? report?.fileName?.replace(/\.[^.]+$/, "") ?? "Medical Report Analysis";

  useEffect(() => {
    setSimpleExplanation("");
    setSimpleError("");

    if (demoFromUrl) {
      setReport(demoFromUrl.report);
      sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(demoFromUrl.report));
      if (wantsSimpleMode) {
        setSimpleExplanation(demoFromUrl.explainLike12);
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem(REPORT_STORAGE_KEY);
      if (stored) {
        setReport(JSON.parse(stored) as UploadedReport);
      }
    } catch {
      sessionStorage.removeItem(REPORT_STORAGE_KEY);
    }
  }, [demoFromUrl, wantsSimpleMode]);

  useEffect(() => {
    setAnalysisError("");

    if (!report?.extractedText || demo) {
      setUploadedAnalysis(undefined);
      setIsAnalyzingReport(false);
      return;
    }

    const fallbackAnalysis = buildReportSpecificAnalysis(report.extractedText);
    setUploadedAnalysis(fallbackAnalysis);
    setIsAnalyzingReport(true);

    const controller = new AbortController();

    async function analyzeUploadedReport() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reportText: report?.extractedText
          }),
          signal: controller.signal
        });

        const contentType = response.headers.get("content-type") ?? "";

        if (!contentType.includes("application/json")) {
          throw new Error("The analysis service returned an unexpected response.");
        }

        const payload = (await response.json()) as MedicalAnalysis & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not analyze this report.");
        }

        setUploadedAnalysis(payload);
      } catch (error) {
        if (!controller.signal.aborted) {
          setAnalysisError(
            error instanceof Error
              ? `${error.message} Showing report-specific fallback analysis.`
              : "Could not analyze this report. Showing report-specific fallback analysis."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsAnalyzingReport(false);
        }
      }
    }

    void analyzeUploadedReport();

    return () => controller.abort();
  }, [demo, report]);

  const explainLike12 = async () => {
    setSimpleError("");

    if (demo?.explainLike12) {
      setIsSimplifying(true);
      window.setTimeout(() => {
        setSimpleExplanation(demo.explainLike12);
        setIsSimplifying(false);
      }, 450);
      return;
    }

    if (!report?.extractedText) {
      setSimpleError("Upload or choose a demo report before simplifying the explanation.");
      return;
    }

    setIsSimplifying(true);

    try {
      const response = await fetch("/api/explain-like-12", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reportText: report.extractedText,
          summary: analysis.summary
        })
      });
      const payload = (await response.json()) as Partial<ExplainLike12Response> & { error?: string };

      if (!response.ok || !payload.explanation) {
        throw new Error(payload.error ?? "Could not create a simpler explanation.");
      }

      setSimpleExplanation(payload.explanation);
    } catch (error) {
      setSimpleError(error instanceof Error ? error.message : "Could not create a simpler explanation.");
    } finally {
      setIsSimplifying(false);
    }
  };

  const downloadReportPdf = async () => {
    setReportDownloadError("");
    setIsDownloadingReport(true);

    try {
      const payload: ReportPdfRequest = {
        analysis,
        fileName: report?.fileName,
        reportText: report?.extractedText,
        simpleExplanation,
        title: reportTitle
      };

      const response = await fetch("/api/report-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorPayload.error ?? "Could not generate the report PDF.");
      }

      const reportBlob = await response.blob();
      const objectUrl = URL.createObjectURL(reportBlob);
      const anchor = document.createElement("a");
      const sourceFileName = report?.fileName?.replace(/\.[^.]+$/, "") ?? reportTitle;
      const safeFileName = sourceFileName.replace(/[<>:"/\\|?*\x00-\x1F]+/g, " ").replace(/\s+/g, " ").trim();

      anchor.href = objectUrl;
      anchor.download = `${safeFileName || "MediTranslate"}_Analysis report.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setReportDownloadError(error instanceof Error ? error.message : "Could not generate the report PDF.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-fade-up mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            {isDemo ? "Demo AI analysis" : isUploadedAnalysis ? "Report-specific analysis" : "Mock AI analysis"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            {demo?.title ?? "Results dashboard"}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {isDemo
              ? "A realistic demo report transformed into clear, patient-friendly medical insights."
              : isUploadedAnalysis
                ? "The dashboard is based on the extracted findings from your uploaded report."
                : "Structured report explanations are shown with mock data so the dashboard can still be reviewed."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button type="button" onClick={downloadReportPdf} disabled={isDownloadingReport}>
            {isDownloadingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {isDownloadingReport ? "Preparing PDF" : "Download PDF"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/upload">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload another
            </Link>
          </Button>
        </div>
      </div>

      {reportDownloadError ? (
        <div className="animate-fade-up mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">
          {reportDownloadError}
        </div>
      ) : null}

      {analysisError ? (
        <div className="animate-fade-up mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">
          {analysisError}
        </div>
      ) : null}

      {!report ? (
        <Card className="animate-fade-up mb-6 border-blue-100 bg-white shadow-soft">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950">No uploaded report in this session</p>
              <p className="mt-1 text-sm text-slate-600">Showing mock analysis so the dashboard can still be reviewed.</p>
            </div>
            <Button asChild>
              <Link href="/upload">Go to upload</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fade-up mb-6 border-blue-100 bg-blue-50/80 shadow-none">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-950">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>{isDemo ? "Demo report loaded" : isAnalyzingReport ? "Analyzing uploaded report" : "Uploaded report analyzed"}</span>
              </div>
              <p className="text-sm font-semibold text-blue-950">{report.fileName}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-blue-800">{report.extractedText}</p>
            </div>
            {demo ? (
              <div className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">{demo.patient}</p>
                <p>{demo.reportDate}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="surface-card">
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Plain English Summary</CardTitle>
              <CardDescription>A patient-friendly explanation of the report.</CardDescription>
            </div>
            {demo ? (
              <Button asChild variant="outline">
                <Link href={`/results?demo=${demo.id}&simple=1`}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Explain Like I&apos;m 12
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={explainLike12} disabled={isSimplifying}>
                {isSimplifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                Explain Like I&apos;m 12
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap break-words text-base leading-7 text-slate-700">{analysis.summary}</p>
            {isAnalyzingReport ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4" role="status" aria-live="polite">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Refining analysis with the report text
                </div>
                <p className="text-sm leading-6 text-blue-800">
                  Showing a report-specific draft while the AI checks the extracted findings.
                </p>
              </div>
            ) : null}
            {isSimplifying ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4" role="status" aria-live="polite">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton mt-3 h-4 w-full rounded" />
                <div className="skeleton mt-3 h-4 w-5/6 rounded" />
              </div>
            ) : null}
            {simpleError ? (
              <div className="animate-fade-up rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">
                {simpleError}
              </div>
            ) : null}
            {simpleExplanation ? (
              <div className="animate-fade-up rounded-lg border border-sky-200 bg-sky-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-900">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Explain Like I&apos;m 12
                </div>
                <p className="whitespace-pre-wrap break-words text-base leading-7 text-slate-800">{simpleExplanation}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Severity Indicator</CardTitle>
            <CardDescription>Not a diagnosis. Use this to prioritize follow-up.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge tone={analysis.severity.level === "low" ? "green" : "amber"}>{analysis.severity.label}</Badge>
            <p className="mt-4 text-sm leading-6 text-slate-700">{analysis.severity.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResultList title="Important Findings" icon={ListChecks} items={analysis.importantFindings} />
        <ResultList title="Lifestyle Suggestions" icon={HeartPulse} items={analysis.lifestyleSuggestions} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="surface-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <CardTitle>Abnormal Values</CardTitle>
            </div>
            <CardDescription>Values or imaging findings that need clinician context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.abnormalValues.length > 0 ? analysis.abnormalValues.map((value) => (
              <div key={value.label} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-words font-semibold text-slate-900">{value.label}</p>
                  <Badge tone="amber" className="w-fit">{value.value}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">Reference: {value.reference}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{value.note}</p>
              </div>
            )) : <EmptyState message="No abnormal values were highlighted in this analysis." />}
          </CardContent>
        </Card>

        <ResultList title="Questions to Ask Doctor" icon={HelpCircle} items={analysis.questionsForDoctor} />
      </div>

      <Card className="surface-card mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <CardTitle>Medical Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-600">
          MediTranslate AI provides educational explanations only. It does not diagnose conditions, replace a licensed clinician, or determine treatment. Share the original report with your doctor, especially if you have symptoms or urgent concerns.
        </CardContent>
      </Card>
    </main>
  );
}

type ResultListProps = {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
};

function ResultList({ title, icon: Icon, items }: ResultListProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden="true" />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No items were generated for this section yet." />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      {message}
    </div>
  );
}
