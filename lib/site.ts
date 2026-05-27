export const siteConfig = {
  description:
    "Upload medical reports and turn dense lab language into structured, patient-friendly explanations for doctor conversations.",
  name: "MediTranslate AI",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://meditranslate-ai.vercel.app")
};
