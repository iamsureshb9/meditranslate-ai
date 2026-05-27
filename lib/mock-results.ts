import type { MedicalAnalysis } from "@/types/analysis";

export const mockAnalysis: MedicalAnalysis = {
  summary:
    "Your report suggests a generally stable health picture with a few markers that should be reviewed with a clinician. The main items to watch are blood sugar control, cholesterol balance, and hydration status.",
  importantFindings: [
    "Hemoglobin and platelet levels are within typical reference ranges.",
    "Fasting glucose is mildly elevated and may need follow-up testing.",
    "LDL cholesterol is above the preferred range for many adults.",
    "Kidney markers appear acceptable in this mock report."
  ],
  abnormalValues: [
    {
      label: "Fasting Glucose",
      value: "112 mg/dL",
      reference: "70-99 mg/dL",
      note: "Mildly above range; ask whether A1C testing is appropriate."
    },
    {
      label: "LDL Cholesterol",
      value: "142 mg/dL",
      reference: "< 100 mg/dL",
      note: "Higher than preferred; risk depends on your full medical history."
    }
  ],
  lifestyleSuggestions: [
    "Choose high-fiber meals with vegetables, legumes, and whole grains.",
    "Aim for 150 minutes of moderate activity weekly if your doctor says it is safe.",
    "Limit sugary drinks and highly processed snacks.",
    "Keep a simple log of blood pressure, sleep, activity, and symptoms."
  ],
  questionsForDoctor: [
    "Do these results require repeat testing or an A1C test?",
    "What cholesterol target is right for my age and risk factors?",
    "Could any medication or supplement be affecting these values?",
    "When should I schedule a follow-up review?"
  ],
  severity: {
    level: "moderate",
    label: "Moderate attention",
    description:
      "No emergency signal is shown in this mock analysis, but the abnormal values deserve a doctor-led follow-up."
  }
};
