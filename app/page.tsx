import Link from "next/link";
import { ArrowRight, FileText, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Upload Your Medical Report",
    description:
      "Simply upload your blood test, scan, or diagnostic report in PDF or image format. Our AI securely reads and processes the report within seconds.",
    icon: FileText
  },
  {
    title: "Let AI Analyze the Findings",
    description:
      "MediTranslate AI intelligently identifies important values, explains medical terminology in plain English, and highlights key health insights you should know.",
    icon: Sparkles
  },
  {
    title: "Understand & Take Action",
    description:
      "Get easy-to-understand summaries, lifestyle suggestions, and smart questions to ask your doctor — helping you make informed healthcare decisions with confidence.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <main className="medical-grid">
      <section className="mx-auto grid min-h-[calc(100vh-121px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex rounded-md border border-blue-200 bg-white px-3 py-1 text-sm font-semibold text-blue-700">
            AI medical report explanations
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            MediTranslate AI
          </h1>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-slate-600">
            <p>
              MediTranslate AI is an AI-powered healthcare assistant that transforms complex medical reports into
              clear, easy-to-understand explanations within minutes. Simply upload your blood test, scan, or
              diagnostic report, and let AI highlight important findings, explain medical terms, and generate
              actionable health insights.
            </p>
            <p>
              Designed for everyday users — not medical experts — MediTranslate AI reduces confusion, saves time,
              eases anxiety, and helps patients have more informed conversations with doctors.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/upload">
                Start upload
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/upload">
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
                Try Demo Report
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/results">View mock dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="surface-card animate-scale-in rounded-lg p-5">
          <div className="rounded-lg bg-blue-600 p-5 text-white">
            <p className="text-2xl font-semibold">Getting Started!</p>
          </div>
          <div className="mt-5 grid gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-blue-100 shadow-none transition-transform duration-200 hover:-translate-y-0.5">
                <CardHeader className="flex-row items-start gap-4 space-y-0 p-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardContent className="p-0 pt-2 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
