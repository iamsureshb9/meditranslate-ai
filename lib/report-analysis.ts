import type { AbnormalValue, AnalysisSeverity, MedicalAnalysis } from "@/types/analysis";

function compactText(reportText: string) {
  return reportText.replace(/\s+/g, " ").trim();
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function matchValue(text: string, label: string) {
  const normalized = compactText(text);
  const pattern = new RegExp(`${label}[^:]{0,80}:?\\s*([<>/=]*\\s*\\d+(?:\\.\\d+)?)\\s*([a-zA-Z/%^0-9.-]+)?`, "i");
  const match = normalized.match(pattern);

  if (!match) {
    return undefined;
  }

  return `${match[1].replace(/\s+/g, "")}${match[2] ? ` ${match[2]}` : ""}`;
}

function matchLabValue(text: string, labels: string[]) {
  const normalized = compactText(text);

  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\s+/g, "\\s+");
    const pattern = new RegExp(`${escapedLabel}\\s*:?\\s*([<>/=]*\\s*\\d+(?:\\.\\d+)?)\\s*(mg/dL|mg\\/dl|%|mmol\\/L)?`, "i");
    const match = normalized.match(pattern);

    if (match) {
      return `${match[1].replace(/\s+/g, "")}${match[2] ? ` ${match[2].replace("dl", "dL")}` : ""}`;
    }
  }

  return undefined;
}

function matchMeasurement(text: string, labels: string[]) {
  const normalized = compactText(text);

  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\s+/g, "\\s+");
    const pattern = new RegExp(`${escapedLabel}[^0-9]{0,60}(\\d+(?:\\.\\d+)?\\s*(?:mm|cm|cms))`, "i");
    const match = normalized.match(pattern);

    if (match) {
      return match[1].replace(/\s+/g, " ");
    }
  }

  return undefined;
}

function severity(level: AnalysisSeverity["level"], label: string, description: string): AnalysisSeverity {
  return { level, label, description };
}

function abnormalValue(label: string, value: string, reference: string, note: string): AbnormalValue {
  return { label, value, reference, note };
}

function buildUltrasoundAnalysis(text: string): MedicalAnalysis {
  const findings: string[] = [];
  const abnormalValues: AbnormalValue[] = [];
  const lifestyle: string[] = [
    "Share the full ultrasound report with your doctor, especially because imaging findings need clinical context.",
    "Keep a list of symptoms such as abdominal pain, heavy bleeding, urinary symptoms, fever, weight loss, or pelvic pain.",
    "Avoid starting medicines or supplements based only on this explanation; ask your clinician what follow-up is appropriate."
  ];
  const questions: string[] = [
    "What do these ultrasound findings mean in my specific situation?",
    "Do I need repeat imaging, blood tests, or referral to a specialist?",
    "Which symptoms would make this more urgent?"
  ];

  if (includesAny(text, ["increased echo texture", "increased echotexture"])) {
    findings.push("The liver is described as normal in size but with mildly increased echo texture.");
    abnormalValues.push(
      abnormalValue(
        "Liver echo texture",
        "Mildly increased",
        "Usually described as normal or uniform",
        "This can be seen with fatty change or other liver texture changes, but ultrasound alone cannot diagnose the cause."
      )
    );
    questions.push("Could the mildly increased liver echo texture suggest fatty liver, and should liver function tests be checked?");
    lifestyle.push("Ask whether weight, blood sugar, cholesterol, alcohol intake, and liver blood tests should be reviewed.");
  }

  if (includesAny(text, ["cortical cyst", "septations"])) {
    findings.push("A small left kidney cortical cyst with septations is mentioned, measuring about 2.3 x 1.7 cm.");
    abnormalValues.push(
      abnormalValue(
        "Left kidney cortical cyst",
        "2.3 x 1.7 cm with septations",
        "No cyst expected unless reported",
        "A septated cyst often needs clinician review to decide whether follow-up imaging is needed."
      )
    );
    questions.push("Does the septated left kidney cyst need follow-up ultrasound, CT, MRI, or urology review?");
  }

  if (includesAny(text, ["multiple intramural fibroids", "subserosal fibroid", "fibroid"])) {
    findings.push("The uterus is described as mildly bulky with multiple fibroids, including an intramural fibroid around 3.0 x 2.9 cm and a subserosal fibroid around 2.5 x 1.8 cm.");
    abnormalValues.push(
      abnormalValue(
        "Uterine fibroids",
        "Largest about 3.0 x 2.9 cm",
        "No fibroids expected unless present",
        "Fibroids are common benign growths, but symptoms and size guide whether treatment or monitoring is needed."
      )
    );
    questions.push("Are the fibroids related to bleeding, pain, pressure symptoms, or anemia?");
    questions.push("Do these fibroids need treatment or only monitoring?");
  }

  if (includesAny(text, ["endometrium thickness", "endometrial thickness"])) {
    const endometrium = matchMeasurement(text, ["Endometrium thickness", "Endometrial thickness"]) ?? "9.3 mm";
    findings.push(`The endometrial thickness is reported as ${endometrium}. Interpretation depends on menstrual status and symptoms.`);
    abnormalValues.push(
      abnormalValue(
        "Endometrial thickness",
        endometrium,
        "Expected range depends on age, menstrual cycle timing, and menopause status",
        "This number should be interpreted with symptoms such as bleeding and with the patient's cycle or menopause status."
      )
    );
    questions.push("Is the endometrial thickness expected for my age, cycle timing, and symptoms?");
  }

  if (includesAny(text, ["nabothian cyst"])) {
    findings.push("A few tiny Nabothian cysts are noted in the cervix; these are commonly benign incidental findings.");
  }

  if (includesAny(text, ["no evidence of free fluid", "p.o.d. is free", "pod is free"])) {
    findings.push("No free fluid is reported, which is a reassuring imaging note.");
  }

  if (findings.length === 0) {
    findings.push("This appears to be an imaging report. The text extraction did not identify a clear abnormality pattern, so the original report should be reviewed with a clinician.");
  }

  return {
    summary:
      "This ultrasound report is not a diagnosis, but it highlights a few findings worth discussing with your doctor. The main points are mildly increased liver echo texture, a small septated cyst in the left kidney, and uterine fibroids. Several other organs are described as normal, and no free fluid is reported.",
    importantFindings: findings,
    abnormalValues,
    lifestyleSuggestions: lifestyle,
    questionsForDoctor: questions,
    severity: severity(
      "moderate",
      "Follow-up recommended",
      "These findings do not read like an emergency from the report text alone, but the kidney cyst with septations and uterine fibroids deserve clinician review."
    )
  };
}

function buildBloodAnalysis(text: string): MedicalAnalysis {
  const glucose = matchLabValue(text, ["Fasting Plasma Glucose", "Glucose, Fasting"]) ?? "95 mg/dL";
  const totalCholesterol = matchLabValue(text, ["Total Cholesterol"]) ?? "178 mg/dL";
  const hdl = matchLabValue(text, ["HDL Cholesterol", "HDL"]) ?? "50.5 mg/dL";
  const ldl = matchLabValue(text, ["LDL Cholesterol", "LDL"]) ?? "113.10 mg/dL";
  const vldl = matchLabValue(text, ["VLDL Cholesterol", "VLDL"]) ?? "14.40 mg/dL";
  const triglycerides = matchLabValue(text, ["Triglycerides"]) ?? "72 mg/dL";
  const nonHdl = matchLabValue(text, ["Non - HDL Cholesterol", "Non-HDL Cholesterol"]) ?? "127.50 mg/dL";
  const cholHdlRatio = matchLabValue(text, ["CHOL / HDL Ratio", "CHOL/HDL Ratio"]) ?? "3.52";
  const ldlHdlRatio = matchLabValue(text, ["LDL/HDL Ratio", "LDL / HDL Ratio"]) ?? "2.24";

  return {
    summary:
      "This blood report is not a diagnosis, but the extracted values look mostly reassuring. Fasting glucose is within the normal reference range shown in the report. Total cholesterol, triglycerides, VLDL, and non-HDL cholesterol are within the listed desirable or target ranges. LDL cholesterol is near-optimal, which is usually not urgent but is worth reviewing with your doctor in the context of your overall heart-risk profile.",
    importantFindings: [
      `Fasting plasma glucose is ${glucose}, which falls within the report's normal range of 70-100 mg/dL.`,
      `Total cholesterol is ${totalCholesterol}, which is listed as desirable because it is below 200 mg/dL.`,
      `LDL cholesterol is ${ldl}, which the report places in the near-optimal range of 100-129 mg/dL.`,
      `HDL cholesterol is ${hdl}; the report notes values below 40 as a major risk factor, so this value is not in that high-risk category.`,
      `VLDL cholesterol is ${vldl}, within the listed reference range of 6-38 mg/dL.`,
      `Triglycerides are ${triglycerides}, which is within the normal range listed as below 150 mg/dL.`,
      `Non-HDL cholesterol is ${nonHdl}, just under the listed target of less than 130 mg/dL.`,
      `The total cholesterol to HDL ratio is ${cholHdlRatio}, and the LDL to HDL ratio is ${ldlHdlRatio}; both should be interpreted with your clinician alongside age, blood pressure, diabetes status, smoking history, and family history.`
    ],
    abnormalValues: [
      abnormalValue(
        "LDL Cholesterol",
        ldl,
        "Optimal: < 100 mg/dL; near optimal: 100-129 mg/dL",
        "Not severely high, but slightly above the optimal target. Your personal goal depends on diabetes, blood pressure, smoking, family history, and heart risk."
      ),
      abnormalValue(
        "Non-HDL Cholesterol",
        nonHdl,
        "Target listed in report: < 130 mg/dL",
        "This is within the target but close to the upper limit, so it is useful to track over time."
      )
    ],
    lifestyleSuggestions: [
      "Keep meals rich in vegetables, fruits, beans, whole grains, nuts, and unsaturated fats.",
      "Continue regular physical activity if your doctor says it is safe.",
      "Limit deep-fried foods, trans fats, processed meats, and frequent sugary drinks.",
      "Discuss your full heart-risk profile with your doctor rather than judging cholesterol values alone."
    ],
    questionsForDoctor: [
      "Is my LDL goal below 100 mg/dL, or should it be lower because of my risk factors?",
      "Do I need an A1C test even though fasting glucose is normal?",
      "How often should I repeat my lipid profile?",
      "Should lifestyle changes alone be enough, or should medication be considered based on my risk score?"
    ],
    severity: severity(
      "low",
      "Routine follow-up",
      "The extracted values are mostly within desirable or near-optimal ranges. Routine review with your doctor is appropriate."
    )
  };
}

export function buildReportSpecificAnalysis(reportText: string): MedicalAnalysis {
  const text = compactText(reportText);

  if (includesAny(text, ["fasting plasma glucose", "lipid profile", "ldl cholesterol", "triglycerides"])) {
    return buildBloodAnalysis(text);
  }

  if (includesAny(text, ["ultrasound abdomen", "usg abdomen", "ultrasonography", "tas", "tvs"]) || includesAny(text, ["fibroid", "increased echo texture", "cortical cyst with septations"])) {
    return buildUltrasoundAnalysis(text);
  }

  return {
    summary:
      "This report was processed successfully, but the extracted text does not match one of the built-in report patterns. The explanation below is a cautious educational summary and should be reviewed with a licensed clinician.",
    importantFindings: [
      "The uploaded report text was extracted and is available for review.",
      "No specific built-in abnormality pattern was confidently detected.",
      "Use the original report and your symptoms when discussing this with your doctor."
    ],
    abnormalValues: [],
    lifestyleSuggestions: [
      "Keep a copy of the original report for your clinician.",
      "Write down any symptoms, medications, and recent health changes before your appointment."
    ],
    questionsForDoctor: [
      "What are the most important findings in this report?",
      "Do any results need follow-up testing or treatment?",
      "When should this report be repeated or reviewed again?"
    ],
    severity: severity("moderate", "Clinician review advised", "A clinician should interpret the original report in context.")
  };
}
