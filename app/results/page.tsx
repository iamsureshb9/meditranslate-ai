import { Suspense } from "react";

import { ResultsDashboard } from "@/components/ResultsDashboard";

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsDashboardSkeleton />}>
      <ResultsDashboard />
    </Suspense>
  );
}

function ResultsDashboardSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <div className="skeleton h-4 w-40 rounded bg-blue-100" />
        <div className="skeleton h-10 w-72 max-w-full rounded bg-slate-200" />
        <div className="skeleton h-5 w-full max-w-2xl rounded bg-slate-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="skeleton h-56 rounded-lg border border-blue-100 bg-white shadow-soft" />
        <div className="skeleton h-56 rounded-lg border border-blue-100 bg-white shadow-soft" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-72 rounded-lg border border-blue-100 bg-white shadow-soft" />
        <div className="skeleton h-72 rounded-lg border border-blue-100 bg-white shadow-soft" />
      </div>
    </main>
  );
}
