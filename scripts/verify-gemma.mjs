#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();
const modelId = process.env.GEMMA_MODEL?.trim() || 'gemma-4-26b-a4b-it';

console.log('========================================================');
console.log('       WasteWise Gemma Model Verification Suite         ');
console.log('========================================================');

if (!apiKey) {
  console.error('\n❌ FAILURE: Missing GEMINI_API_KEY in environment or .env file.');
  console.error('Please configure your Google Gemini API key in .env as GEMINI_API_KEY=your_key\n');
  process.exit(1);
}

// 1x1 clean PNG representing a harmless minimal test image
const harmlessSamplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

const systemPrompt = `You are MatterLens, an optical waste material identification AI.
Analyze the provided image.
Return a strictly valid JSON response adhering to this schema:
{
  "itemName": "short name of item or frame",
  "materialType": "detected material composition",
  "category": "Broad category",
  "visibleContamination": "contamination assessment",
  "preparationAdvice": "handling advice",
  "reasoning": "visual reasoning",
  "uncertaintyNotes": "ambiguities if any",
  "modelReportedConfidence": 0.95
}`;

const requestPayload = {
  contents: [
    {
      parts: [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: 'image/png',
            data: harmlessSamplePngBase64,
          },
        },
      ],
    },
  ],
  generationConfig: {
    responseMimeType: 'application/json',
  },
};

console.log(`\n• Configured Model ID:  ${modelId}`);
console.log(`• Provider & Gateway:   Google Gemini API (Generative Language v1beta)`);
console.log(`• Target Endpoint:      https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`);
console.log(`• Test Input:           Harmless 1x1 test image (MIME: image/png)`);
console.log(`• Sending inference request to Gemini API...\n`);

const startTime = Date.now();
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 35000);

try {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload),
    signal: controller.signal,
  });

  clearTimeout(timeout);
  const elapsedMs = Date.now() - startTime;

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    console.error(`❌ HTTP ${response.status} ${response.statusText}`);
    console.error(`Provider Error Message: ${errorJson.error?.message || 'Unknown provider error'}`);
    process.exit(1);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const answerPart = parts.find((p) => !p.thought) || parts[parts.length - 1];

  if (!answerPart || !answerPart.text) {
    console.error('❌ FAILURE: Gemini API returned candidate without a valid text response.');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(answerPart.text.trim());
  } catch (parseErr) {
    console.error('❌ FAILURE: Response text was not valid JSON:', answerPart.text);
    process.exit(1);
  }

  console.log(`✔ HTTP Status:           ${response.status} OK (${elapsedMs}ms)`);
  console.log(`✔ Verified Model Engine: ${data.modelVersion || modelId}`);
  console.log('\n--- Redacted / Structured Inference Result ---');
  console.log(`  • Identified Item:      ${parsed.itemName || 'N/A'}`);
  console.log(`  • Material Detected:    ${parsed.materialType || 'N/A'}`);
  console.log(`  • Stream Category:      ${parsed.category || 'N/A'}`);
  console.log(`  • Model Confidence:     ${parsed.modelReportedConfidence !== undefined ? (parsed.modelReportedConfidence * 100).toFixed(0) + '%' : 'Not reported'}`);
  console.log(`  • Optical Reasoning:    ${parsed.reasoning?.slice(0, 90) || 'N/A'}...`);
  console.log(`  • Uncertainty Notes:    ${parsed.uncertaintyNotes?.slice(0, 90) || 'None'}`);
  console.log('----------------------------------------------');
  console.log('\n✅ VERIFICATION SUCCESSFUL:');
  console.log(`Real image inference request to Gemma model '${modelId}' via Google Gemini API completed successfully.`);
  console.log('No secrets or raw payloads were exposed.\n');
  process.exitCode = 0;
} catch (err) {
  clearTimeout(timeout);
  console.error(`\n❌ INFERENCE FAILED: ${err.message || 'Unknown network error'}`);
  process.exit(1);
}
