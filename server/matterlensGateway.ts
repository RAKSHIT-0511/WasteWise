import type { IncomingMessage, ServerResponse } from 'http';
import { validateImageBuffer, parseMatterLensResponse } from '../src/utils/matterlensParser';

const SYSTEM_PROMPT = `You are MatterLens, an advanced optical waste material identification AI for the WasteWise platform.
Analyze the provided image of a physical item or waste container.
Provide a strictly valid JSON object adhering to this schema (do NOT invent markdown formatting or outer text; provide raw JSON):
{
  "itemName": "concise name of identified item",
  "materialType": "detected material composition (e.g. PET Plastic #1, HDPE #2, Corrugated Cardboard, Aluminum Can, Organic/Compostable, Multilayer Foil Film)",
  "category": "Broad stream category (e.g. Plastic, Paper/Cardboard, Glass/Metal, Organic/Compostable, E-Waste/Hazardous, Landfill/Residual)",
  "visibleContamination": "observations regarding food residues, adhesives, attached caps, residual moisture, or multi-material attachments",
  "preparationAdvice": "general physical preparation steps before disposal (e.g. rinse thoroughly, separate pump dispenser, crush to save volume). Note: Do NOT claim or verify local municipal recyclability rules; that belongs to EcoVerify.",
  "reasoning": "visible visual characteristics that led to this classification (transparency, sheen, ribbing, resin identification symbol, labeling)",
  "uncertaintyNotes": "explicit visual ambiguities, obscured packaging, composite laminates, or factors reducing identification certainty",
  "modelReportedConfidence": 0.95
}
Ensure modelReportedConfidence is a number between 0.0 and 1.0 reflecting your optical identification certainty.`;

async function callProvider(model: string, base64Data: string, mimeType: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error?.message || `Provider returned HTTP ${res.status}`;
      throw new Error(`Model ${model} error: ${errMsg}`);
    }

    const parts = (data.candidates?.[0]?.content?.parts || []) as Array<{ text?: string; thought?: boolean }>;
    // Discard thinking parts and select the actual JSON output
    const answerPart = parts.find((p) => !p.thought) || parts[parts.length - 1];
    const text = answerPart?.text;
    if (!text) {
      throw new Error(`Model ${model} returned an empty candidate payload.`);
    }

    return text;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function handleMatterLensIdentify(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  // Check server API key without revealing secrets
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'MatterLens AI gateway is not configured. Missing API credentials on the server.'
    }));
    return;
  }

  // Read incoming request payload
  let bodyStr = '';
  const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB total string buffer limit

  req.on('data', (chunk) => {
    bodyStr += chunk;
    if (bodyStr.length > MAX_PAYLOAD_SIZE) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Payload exceeds maximum allowed size (10MB).' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      let parsedBody: { imageBase64?: string; mimeType?: string };
      try {
        parsedBody = JSON.parse(bodyStr);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
        return;
      }

      const { imageBase64, mimeType: declaredMime } = parsedBody;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Missing imageBase64 in request body.' }));
        return;
      }

      // Strip data URI prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      // Validate byte size and detect real magic bytes header
      const validation = validateImageBuffer(cleanBase64, declaredMime);
      if (!validation.valid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: validation.error }));
        return;
      }

      const verifiedMimeType = validation.mimeType;

      // Centrally configured Gemma model ID (never silently replaced)
      const gemmaModel = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

      let rawModelOutput = '';
      try {
        rawModelOutput = await callProvider(gemmaModel, cleanBase64, verifiedMimeType, apiKey);
      } catch (gemmaErr) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: `Gemma model inference failed on '${gemmaModel}': ${gemmaErr instanceof Error ? gemmaErr.message : 'Unknown provider error'}`
        }));
        return;
      }

      // Parse and structure JSON output
      const result = parseMatterLensResponse(rawModelOutput, gemmaModel);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, result }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: `Unexpected server error during identification: ${err instanceof Error ? err.message : 'Internal failure'}`
      }));
    }
  });
}
