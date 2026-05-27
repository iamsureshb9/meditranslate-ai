export type SeverityLevel = "low" | "moderate" | "high" | "urgent";

export type AnalysisSeverity = {
  level: Exclude<SeverityLevel, "urgent">;
  label: string;
  description: string;
};

export type AbnormalValue = {
  label: string;
  value: string;
  reference: string;
  note: string;
};

export type MedicalAnalysis = {
  summary: string;
  importantFindings: string[];
  abnormalValues: AbnormalValue[];
  lifestyleSuggestions: string[];
  questionsForDoctor: string[];
  severity: AnalysisSeverity;
};

export type AnalyzeRequest = {
  reportText?: string;
};

export type MedicalReportAnalysis = {
  summary: string;
  findings: string[];
  abnormalValues: string[];
  lifestyle: string[];
  doctorQuestions: string[];
  severity: SeverityLevel;
};

export type ExplainLike12Request = {
  reportText?: string;
  summary?: string;
};

export type ExplainLike12Response = {
  explanation: string;
};

export type ReportPdfRequest = {
  title?: string;
  fileName?: string;
  reportText?: string;
  simpleExplanation?: string;
  analysis: MedicalAnalysis;
};
