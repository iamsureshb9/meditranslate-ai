import { CheckCircle2, Loader2 } from "lucide-react";

import type { UploadStatus } from "@/types/upload";

type UploadProgressProps = {
  progress: number;
  status: UploadStatus;
};

const statusLabels: Record<UploadStatus, string> = {
  idle: "Waiting for a report",
  validating: "Checking file type",
  uploading: "Uploading report",
  extracting: "Extracting readable text",
  complete: "Extraction complete",
  error: "Upload needs attention"
};

export function UploadProgress({ progress, status }: UploadProgressProps) {
  if (status === "idle") {
    return null;
  }

  const isComplete = status === "complete";

  return (
    <div className="animate-fade-up rounded-lg border border-blue-100 bg-white p-4 shadow-sm" role="status" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
          )}
          <span>{statusLabels[status]}</span>
        </div>
        <span className="text-sm font-semibold text-blue-700">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
