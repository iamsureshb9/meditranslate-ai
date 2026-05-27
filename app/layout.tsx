import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ShieldAlert } from "lucide-react";

import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "MediTranslate AI | Plain-English Medical Report Explanations",
    template: "%s | MediTranslate AI"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["medical reports", "AI healthcare", "lab report explanation", "patient education", "healthcare SaaS"],
  authors: [{ name: siteConfig.name }],
  category: "healthcare",
  creator: siteConfig.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "MediTranslate AI | Plain-English Medical Report Explanations",
    description: siteConfig.description,
    url: "/",
    type: "website",
    siteName: siteConfig.name
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    index: true
  },
  twitter: {
    card: "summary",
    title: "MediTranslate AI | Plain-English Medical Report Explanations",
    description: siteConfig.description
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-2 font-semibold text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Activity className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>MediTranslate AI</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link href="/upload" className="rounded-md px-2 py-1 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                Upload
              </Link>
              <Link href="/results" className="rounded-md px-2 py-1 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                Results
              </Link>
            </nav>
          </div>
        </header>
        <div className="border-b border-amber-200 bg-amber-50/95">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3 text-sm leading-6 text-amber-900 sm:px-6 lg:px-8">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-amber-700" aria-hidden="true" />
            <p>
              Educational demo only. MediTranslate AI does not diagnose, prescribe treatment, or replace medical care.
              Review all results with a licensed clinician.
            </p>
          </div>
        </div>
        <div id="main-content">{children}</div>
        <footer className="border-t border-blue-100 bg-white/85">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="font-semibold text-slate-950">MediTranslate AI</p>
              <p className="mt-1">Patient-friendly report explanations for better doctor conversations.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link className="transition-colors hover:text-blue-700" href="/upload">
                Upload
              </Link>
              <Link className="transition-colors hover:text-blue-700" href="/results?demo=cbc">
                Demo
              </Link>
              <span>Hackathon MVP</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
