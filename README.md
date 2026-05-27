# MediTranslate AI

MediTranslate AI is a Next.js healthcare MVP that turns uploaded medical reports into simple, structured, patient-friendly explanations. It supports PDF text extraction, image upload placeholders, OpenAI-powered analysis endpoints, polished demo reports, an "Explain Like I'm 12" mode, and downloadable final PDF reports.

> Educational demo only. This app does not diagnose, prescribe treatment, or replace medical care.

## Features

- Next.js 15 App Router with TypeScript
- Tailwind CSS and shadcn-style local UI primitives
- PDF upload and server-side text extraction with `pdf-parse`
- Image upload validation for PNG, JPG, and WebP
- OpenAI API routes for structured analysis and simpler explanations
- Downloadable analysis reports generated as PDFs
- Three one-click demo reports: CBC, Vitamin D, and Cholesterol
- Responsive dashboard with loading, empty, error, and success states
- SEO metadata, favicon, disclaimer banner, footer, and accessible focus/skip-link behavior

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- OpenAI SDK
- pdf-parse
- pdfjs-dist fallback for Vercel-compatible PDF text extraction
- lucide-react
- pdfkit for server-side report PDF generation and local PDF verification

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`OPENAI_API_KEY` is required for live AI analysis of uploaded reports. The demo reports work without an API key.

`OPENAI_MODEL` is optional. If omitted, the app uses `gpt-4o-mini`.

`NEXT_PUBLIC_SITE_URL` is used for SEO metadata, robots, and sitemap URLs. Set it to your production Vercel domain after deployment.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run verify:pdf
```

`npm run verify:pdf` starts a temporary local Next server, generates a small test PDF, posts it to `/api/extract-pdf`, and verifies that extracted text is returned.

## Deploying to Vercel

1. Push the project to a Git provider connected to Vercel.
2. Import the repository in Vercel and keep the framework preset as `Next.js`.
3. Add environment variables in Vercel Project Settings:

```text
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=https://your-production-domain.vercel.app
```

4. Deploy with the default build command:

```bash
npm run build
```

Vercel automatically provides `VERCEL_URL` for preview deployments. `NEXT_PUBLIC_SITE_URL` is still recommended for the canonical production URL.

## Demo Flow

1. Open `/upload`.
2. Choose one of the "Try Demo Report" cards.
3. Review the structured dashboard.
4. Click "Explain Like I'm 12" for the simpler explanation mode.
5. Click "Download PDF" to generate the final analysis report.

Direct demo URLs:

```text
/results?demo=cbc
/results?demo=vitamin-d
/results?demo=cholesterol
/results?demo=cbc&simple=1
```

## API Routes

### `POST /api/extract-pdf`

Accepts `multipart/form-data` with a PDF file under the `file` key.

Returns:

```json
{
  "text": "Extracted report text",
  "pageCount": 1
}
```

Handles missing files, invalid file types, oversized files, unreadable PDFs, and extraction failures.

### `POST /api/analyze`

Accepts:

```json
{
  "reportText": "Extracted medical report text"
}
```

Returns:

```json
{
  "summary": "",
  "findings": [],
  "abnormalValues": [],
  "lifestyle": [],
  "doctorQuestions": [],
  "severity": "low"
}
```

### `POST /api/explain-like-12`

Accepts:

```json
{
  "reportText": "Extracted medical report text",
  "summary": "Optional existing summary"
}
```

Returns:

```json
{
  "explanation": "A short, friendly, ultra-simple explanation."
}
```

### `POST /api/report-pdf`

Accepts:

```json
{
  "title": "CBC Blood Report",
  "fileName": "sample-cbc-report.pdf",
  "reportText": "Optional extracted report text",
  "simpleExplanation": "Optional simpler explanation",
  "analysis": {
    "summary": "",
    "importantFindings": [],
    "abnormalValues": [],
    "lifestyleSuggestions": [],
    "questionsForDoctor": [],
    "severity": {
      "level": "low",
      "label": "Low priority",
      "description": "Routine follow-up suggested."
    }
  }
}
```

Returns an `application/pdf` file containing the final patient-friendly analysis report and medical disclaimer.

## Production Notes

- No authentication or database is included by design.
- Uploaded report state is stored in browser session storage for the MVP flow.
- API routes validate required inputs and return JSON error responses.
- File size is limited to 4 MB on Vercel because Vercel Functions have a 4.5 MB request/response payload limit.
- Report text sent to OpenAI routes is limited to 20,000 characters.
- For production deployment, review privacy, security, PHI handling, logging, rate limiting, and medical/regulatory requirements before accepting real patient data.

## Project Structure

```text
app/
  api/
    analyze/
    explain-like-12/
    extract-pdf/
    report-pdf/
  results/
  upload/
components/
  ui/
lib/
  constants.ts
  demo-reports.ts
  mock-results.ts
  utils.ts
types/
scripts/
```
