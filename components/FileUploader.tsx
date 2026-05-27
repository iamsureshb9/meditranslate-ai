"use client";

import { ChangeEvent, DragEvent, useCallback, useMemo, useRef, useState } from "react";
import { CheckCircle2, FileImage, FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { UploadProgress } from "@/components/UploadProgress";
import type { AcceptedMedicalFileType, PdfExtractionResponse, UploadedReport, UploadStatus } from "@/types/upload";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES: AcceptedMedicalFileType[] = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

type FileUploaderProps = {
  onReportReady: (report: UploadedReport) => void;
};

function isAcceptedType(type: string): type is AcceptedMedicalFileType {
  return ACCEPTED_TYPES.includes(type as AcceptedMedicalFileType);
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function imageExtractionNotice(fileName: string) {
  return `Image uploaded: ${fileName}. OCR is not enabled in this MVP yet, so this placeholder text is stored in state for the mock AI analysis.`;
}

export function FileUploader({ onReportReady }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [extractedText, setExtractedText] = useState("");

  const acceptedDescription = useMemo(() => "PDF, PNG, JPG, or WebP up to 4 MB", []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(undefined);
    setSuccessMessage(undefined);
    setSelectedFile(undefined);
    setExtractedText("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const extractPdfText = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      body: formData
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      if (response.status === 413) {
        throw new Error("This PDF is too large for the hosted upload limit. Please upload a PDF under 4 MB.");
      }

      throw new Error("The upload service returned an unexpected response. Please try again with a smaller PDF.");
    }

    const payload = (await response.json()) as Partial<PdfExtractionResponse> & { error?: string };

    if (!response.ok || !payload.text) {
      throw new Error(payload.error ?? "We could not extract text from this PDF.");
    }

    return payload.text;
  };

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file) {
        return;
      }

      setError(undefined);
      setSuccessMessage(undefined);
      setSelectedFile(file);
      setExtractedText("");
      setStatus("validating");
      setProgress(12);

      if (!isAcceptedType(file.type)) {
        setStatus("error");
        setProgress(0);
        setError("Unsupported file type. Upload a PDF, PNG, JPG, or WebP report.");
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        setStatus("error");
        setProgress(0);
        setError("This file is larger than 4 MB. Please upload a smaller report.");
        return;
      }

      try {
        setStatus("uploading");
        setProgress(35);

        let text = "";

        if (file.type === "application/pdf") {
          setStatus("extracting");
          setProgress(68);
          text = await extractPdfText(file);
        } else {
          setStatus("extracting");
          setProgress(78);
          text = imageExtractionNotice(file.name);
        }

        setExtractedText(text);

        if (process.env.NODE_ENV === "development") {
          console.info("Extracted medical report text:", text);
        }

        const report: UploadedReport = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          extractedText: text
        };

        onReportReady(report);
        setSuccessMessage("Report text extracted successfully. You can generate the analysis now.");
        setStatus("complete");
        setProgress(100);
      } catch (err) {
        setStatus("error");
        setProgress(0);
        setError(err instanceof Error ? err.message : "Something went wrong while processing the report.");
      }
    },
    [onReportReady]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-6 text-center shadow-soft transition-all duration-200 sm:p-10",
          isDragging ? "scale-[1.01] border-blue-500 bg-blue-50" : "border-blue-200 hover:-translate-y-0.5 hover:border-blue-400"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
        />

        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-transform duration-200">
          <UploadCloud className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-950">Upload a medical report</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{acceptedDescription}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
          <Button type="button" variant="outline" onClick={reset} disabled={!selectedFile && status === "idle"}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </div>

      {selectedFile ? (
        <div className="animate-fade-up flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-700">
            {selectedFile.type === "application/pdf" ? (
              <FileText className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FileImage className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{selectedFile.name}</p>
            <p className="text-xs text-slate-600">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          No report selected yet. Drop a file above or choose one from your device.
        </div>
      )}

      <UploadProgress progress={progress} status={status} />
      <ErrorMessage message={error} />
      {successMessage ? (
        <div className="animate-fade-up flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status" aria-live="polite">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      {extractedText ? (
        <div className="animate-fade-up rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Extracted text stored in state</p>
          <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{extractedText}</p>
        </div>
      ) : null}
    </div>
  );
}
