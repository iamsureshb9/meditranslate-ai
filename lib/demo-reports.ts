import type { MedicalAnalysis } from "@/types/analysis";
import type { UploadedReport } from "@/types/upload";

export type DemoReport = {
  id: string;
  title: string;
  shortLabel: string;
  patient: string;
  reportDate: string;
  description: string;
  report: UploadedReport;
  analysis: MedicalAnalysis;
  explainLike12: string;
};

export const demoReports: DemoReport[] = [
  {
    id: "cbc",
    title: "Complete Blood Count",
    shortLabel: "CBC blood report",
    patient: "Demo Patient A",
    reportDate: "May 2026",
    description: "Shows mild anemia signals with otherwise stable white cell and platelet counts.",
    report: {
      fileName: "demo-cbc-blood-report.pdf",
      fileType: "application/pdf",
      fileSize: 184000,
      demoId: "cbc",
      extractedText:
        "Complete Blood Count. Hemoglobin 11.2 g/dL reference 12.0-15.5. Hematocrit 34.1% reference 36-46. MCV 78 fL reference 80-100. WBC 6.8 x10^3/uL reference 4.0-11.0. Platelets 285 x10^3/uL reference 150-450. RDW 15.8% reference 11.5-14.5."
    },
    analysis: {
      summary:
        "This CBC is mostly reassuring, but it shows a pattern that can fit mild anemia. The red blood cells look slightly smaller than expected, which is something your doctor may connect with iron levels, diet, bleeding history, or other causes.",
      importantFindings: [
        "Hemoglobin and hematocrit are mildly below the usual reference range.",
        "MCV is slightly low, meaning the red blood cells are smaller than average.",
        "White blood cell count is within range, which does not suggest an obvious infection pattern in this report.",
        "Platelets are within range."
      ],
      abnormalValues: [
        {
          label: "Hemoglobin",
          value: "11.2 g/dL",
          reference: "12.0-15.5 g/dL",
          note: "Mildly low. This can happen with anemia and should be interpreted with symptoms and history."
        },
        {
          label: "MCV",
          value: "78 fL",
          reference: "80-100 fL",
          note: "Slightly low, which means red blood cells are smaller than expected."
        },
        {
          label: "RDW",
          value: "15.8%",
          reference: "11.5-14.5%",
          note: "A little high, suggesting more variation in red blood cell size."
        }
      ],
      lifestyleSuggestions: [
        "Ask your doctor whether iron studies such as ferritin are needed before starting supplements.",
        "Include iron-rich foods such as lentils, beans, spinach, eggs, fish, or lean meats if they fit your diet.",
        "Pair plant-based iron foods with vitamin C sources such as citrus or bell peppers.",
        "Track fatigue, dizziness, shortness of breath, heavy periods, or dark stools and share these symptoms with your clinician."
      ],
      questionsForDoctor: [
        "Do these results suggest iron deficiency anemia or another type of anemia?",
        "Should I check ferritin, iron, B12, folate, or thyroid levels?",
        "Could blood loss or my menstrual history be related to this result?",
        "When should I repeat the CBC?"
      ],
      severity: {
        level: "moderate",
        label: "Follow-up recommended",
        description:
          "This does not look like an emergency from the numbers alone, but the anemia pattern deserves a clinician review."
      }
    },
    explainLike12:
      "Your blood report is mostly okay, but your red blood cells may be a little low. Red blood cells carry oxygen around your body. When they are low, you might feel tired, dizzy, or weak. This can happen for many reasons, like low iron. A doctor can check what is causing it and what to do next."
  },
  {
    id: "vitamin-d",
    title: "Vitamin D Lab Report",
    shortLabel: "Vitamin D report",
    patient: "Demo Patient B",
    reportDate: "May 2026",
    description: "Highlights low vitamin D with normal calcium for an easy plain-English explanation.",
    report: {
      fileName: "demo-vitamin-d-report.pdf",
      fileType: "application/pdf",
      fileSize: 142000,
      demoId: "vitamin-d",
      extractedText:
        "Vitamin D 25-Hydroxy 18 ng/mL reference 30-100. Calcium 9.4 mg/dL reference 8.6-10.2. Phosphorus 3.6 mg/dL reference 2.5-4.5. Alkaline phosphatase 78 U/L reference 44-121."
    },
    analysis: {
      summary:
        "Your vitamin D level is below the usual target range. Calcium and related markers shown here look within range, which is reassuring, but low vitamin D is worth discussing because it can affect bone health and sometimes muscle aches or fatigue.",
      importantFindings: [
        "25-hydroxy vitamin D is low at 18 ng/mL.",
        "Calcium is within the listed reference range.",
        "Phosphorus and alkaline phosphatase are within range in this demo report.",
        "Your doctor may consider supplementation based on your health history and medications."
      ],
      abnormalValues: [
        {
          label: "25-Hydroxy Vitamin D",
          value: "18 ng/mL",
          reference: "30-100 ng/mL",
          note: "Low. This is commonly reviewed for bone health and replacement planning."
        }
      ],
      lifestyleSuggestions: [
        "Ask your doctor what vitamin D dose is appropriate before starting or changing supplements.",
        "Include vitamin D foods such as fortified milk, fortified plant milks, eggs, and fatty fish if suitable.",
        "Get safe sunlight exposure when appropriate for your skin type, climate, and medical history.",
        "Take vitamin D consistently if prescribed, and ask when to recheck the level."
      ],
      questionsForDoctor: [
        "What vitamin D dose and duration do you recommend for this level?",
        "Should I take vitamin D3, and should it be taken with food?",
        "When should I repeat the vitamin D test?",
        "Could any of my medications or conditions affect vitamin D absorption?"
      ],
      severity: {
        level: "low",
        label: "Routine follow-up",
        description:
          "This is usually handled through planned follow-up rather than urgent care, unless you have concerning symptoms."
      }
    },
    explainLike12:
      "Your vitamin D is lower than the usual healthy range. Vitamin D helps keep your bones strong. Low vitamin D can sometimes make people feel tired or achy. The other numbers shown here look okay. Ask your doctor if you need vitamin D drops or pills, and when to check it again."
  },
  {
    id: "cholesterol",
    title: "Lipid Panel",
    shortLabel: "Cholesterol report",
    patient: "Demo Patient C",
    reportDate: "May 2026",
    description: "Shows elevated LDL and triglycerides with clear cardiovascular risk talking points.",
    report: {
      fileName: "demo-cholesterol-report.pdf",
      fileType: "application/pdf",
      fileSize: 168000,
      demoId: "cholesterol",
      extractedText:
        "Lipid Panel. Total cholesterol 232 mg/dL reference less than 200. LDL cholesterol 154 mg/dL reference less than 100. HDL cholesterol 42 mg/dL reference greater than 40. Triglycerides 186 mg/dL reference less than 150. Non-HDL cholesterol 190 mg/dL reference less than 130."
    },
    analysis: {
      summary:
        "This cholesterol report shows higher-than-target LDL cholesterol and triglycerides. HDL is just above the listed minimum. These results do not diagnose heart disease, but they are important because cholesterol goals depend on your age, blood pressure, diabetes status, smoking history, and family history.",
      importantFindings: [
        "Total cholesterol is above the usual desired range.",
        "LDL cholesterol is elevated and is often a key treatment target.",
        "Triglycerides are mildly elevated.",
        "HDL is near the lower end of the protective range."
      ],
      abnormalValues: [
        {
          label: "LDL Cholesterol",
          value: "154 mg/dL",
          reference: "< 100 mg/dL",
          note: "Elevated. The right target depends on your personal cardiovascular risk."
        },
        {
          label: "Triglycerides",
          value: "186 mg/dL",
          reference: "< 150 mg/dL",
          note: "Mildly elevated. This can be influenced by diet, alcohol, blood sugar, weight, and genetics."
        },
        {
          label: "Non-HDL Cholesterol",
          value: "190 mg/dL",
          reference: "< 130 mg/dL",
          note: "Above range and useful for estimating cholesterol-related risk."
        }
      ],
      lifestyleSuggestions: [
        "Build meals around vegetables, beans, oats, nuts, fruit, and unsaturated fats such as olive oil.",
        "Limit trans fats, deep-fried foods, processed meats, and frequent high-sugar snacks or drinks.",
        "Aim for regular aerobic activity and strength training if your clinician says it is safe.",
        "Ask whether blood sugar, thyroid, liver, or kidney factors should be reviewed alongside cholesterol."
      ],
      questionsForDoctor: [
        "What LDL goal is right for my risk profile?",
        "Do I need lifestyle changes only, or should medication be considered?",
        "Should I calculate my 10-year cardiovascular risk score?",
        "When should I repeat the lipid panel?"
      ],
      severity: {
        level: "moderate",
        label: "Risk review advised",
        description:
          "This is not an emergency, but it is important to discuss prevention and risk reduction with your doctor."
      }
    },
    explainLike12:
      "Your cholesterol report shows that some fat-like stuff in your blood is higher than expected. LDL is one type that doctors watch closely because too much can be hard on your heart over time. This does not mean something bad is happening today. It means your doctor may want to help you lower your risk. Food, movement, and sometimes medicine can help."
  }
];

export function getDemoReport(id?: string) {
  return demoReports.find((demo) => demo.id === id);
}
