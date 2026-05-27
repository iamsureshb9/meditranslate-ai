export type AcceptedMedicalFileType = "application/pdf" | "image/png" | "image/jpeg" | "image/webp";

export type UploadedReport = {
  fileName: string;
  fileType: AcceptedMedicalFileType;
  fileSize: number;
  extractedText: string;
  demoId?: string;
};

export type UploadStatus = "idle" | "validating" | "uploading" | "extracting" | "complete" | "error";

export type PdfExtractionResponse = {
  text: string;
  pageCount: number;
};
