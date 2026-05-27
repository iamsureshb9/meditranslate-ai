import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import PDFDocument from "pdfkit";

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;

async function createPdfBuffer(text) {
  const document = new PDFDocument({ compress: false, margin: 72 });
  const chunks = [];

  document.on("data", (chunk) => chunks.push(chunk));
  document.font("Helvetica").fontSize(18).text(text);
  document.end();

  await new Promise((resolve) => document.on("end", resolve));
  return Buffer.concat(chunks);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/upload`);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(1000);
    }
  }

  throw new Error("Next dev server did not become ready.");
}

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", String(port)], {
  stdio: "pipe"
});
const serverOutput = [];
server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

try {
  await waitForServer();

  const formData = new FormData();
  formData.append("file", new Blob([await createPdfBuffer("Glucose 112 mg/dL")], { type: "application/pdf" }), "sample-report.pdf");

  const response = await fetch(`${baseUrl}/api/extract-pdf`, {
    method: "POST",
    body: formData
  });
  const payload = await response.json();

  if (!response.ok || !String(payload.text ?? "").includes("Glucose 112 mg/dL")) {
    throw new Error(`Unexpected extraction response: ${JSON.stringify(payload)}\n${serverOutput.join("")}`);
  }

  console.log("PDF extraction verified:", payload.text.trim());
} finally {
  server.kill();
}
