export interface MatterLensRawOutput {
  itemName?: string;
  materialType?: string;
  category?: string;
  visibleContamination?: string;
  preparationAdvice?: string;
  reasoning?: string;
  uncertaintyNotes?: string;
  modelReportedConfidence?: number | null;
}

export interface MatterLensAnalysisResult {
  itemName: string;
  materialType: string;
  category: string;
  visibleContamination: string;
  preparationAdvice: string;
  reasoning: string;
  uncertaintyNotes: string;
  modelReportedConfidence?: number;
  confidenceTier: 'high' | 'medium' | 'low';
  isUncertain: boolean;
  disclaimer: string;
  modelUsed: string;
  timestamp: string;
}

export const MATTERLENS_DISCLAIMER =
  'MatterLens performs optical material identification only. Local municipal recycling acceptance and bin rules are verified by EcoVerify.';

/**
 * Validates base64 image data and detects real mime type from magic bytes header.
 */
export function validateImageBuffer(base64Data: string, declaredMimeType?: string): { valid: boolean; error?: string; mimeType: string } {
  if (!base64Data || typeof base64Data !== 'string') {
    return { valid: false, error: 'No image data received.', mimeType: '' };
  }

  // Strip possible data URI scheme prefix
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  // Check approximate decoded size (base64 is ~4/3 larger than raw binary)
  const approxBytes = Math.ceil((cleanBase64.length * 3) / 4);
  const MAX_BYTES = 6 * 1024 * 1024; // 6MB limit

  if (approxBytes > MAX_BYTES) {
    return { valid: false, error: `Image size (${(approxBytes / (1024 * 1024)).toFixed(1)}MB) exceeds the 6MB limit.`, mimeType: '' };
  }

  // Detect signature from magic bytes in base64
  let detectedMime = '';
  if (cleanBase64.startsWith('/9j/')) {
    detectedMime = 'image/jpeg';
  } else if (cleanBase64.startsWith('iVBORw0KGgo')) {
    detectedMime = 'image/png';
  } else if (cleanBase64.startsWith('UklGR')) {
    detectedMime = 'image/webp';
  } else if (cleanBase64.startsWith('R0lGOD')) {
    detectedMime = 'image/gif';
  } else {
    // If not matching standard signature, check declared mime if supported
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (declaredMimeType && allowed.includes(declaredMimeType.toLowerCase())) {
      detectedMime = declaredMimeType.toLowerCase();
    } else {
      return { valid: false, error: 'Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.', mimeType: '' };
    }
  }

  return { valid: true, mimeType: detectedMime };
}

/**
 * Robust parser that extracts JSON even if the model outputs thinking tokens or markdown formatting.
 */
export function parseMatterLensResponse(rawText: string, modelName: string): MatterLensAnalysisResult {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from optical identification model.');
  }

  // Search for the outermost JSON object {...}
  let jsonString = '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonString = jsonMatch[0];
  } else {
    // Attempt markdown code block extraction
    const blockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (blockMatch) {
      jsonString = blockMatch[1].trim();
    } else {
      jsonString = rawText.trim();
    }
  }

  let parsed: MatterLensRawOutput;
  try {
    parsed = JSON.parse(jsonString) as MatterLensRawOutput;
  } catch (err) {
    throw new Error(`Failed to parse model identification payload: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
  }

  const itemName = (parsed.itemName && String(parsed.itemName).trim()) || 'Unidentified Object';
  const materialType = (parsed.materialType && String(parsed.materialType).trim()) || 'Unknown Material';
  const category = (parsed.category && String(parsed.category).trim()) || 'Uncategorized';
  const visibleContamination = (parsed.visibleContamination && String(parsed.visibleContamination).trim()) || 'None noted';
  const preparationAdvice = (parsed.preparationAdvice && String(parsed.preparationAdvice).trim()) || 'Inspect physical container before sorting.';
  const reasoning = (parsed.reasoning && String(parsed.reasoning).trim()) || 'Visual identification based on shape and surface appearance.';
  const uncertaintyNotes = (parsed.uncertaintyNotes && String(parsed.uncertaintyNotes).trim()) || '';

  // Process modelReportedConfidence: only keep if valid float
  let modelReportedConfidence: number | undefined;
  if (typeof parsed.modelReportedConfidence === 'number' && !isNaN(parsed.modelReportedConfidence)) {
    // Clamp between 0.0 and 1.0
    const clamped = Math.min(Math.max(parsed.modelReportedConfidence, 0), 1);
    modelReportedConfidence = Math.round(clamped * 100) / 100;
  }

  // Compute confidence tier and uncertainty flag
  let confidenceTier: 'high' | 'medium' | 'low' = 'medium';
  let isUncertain = false;

  if (modelReportedConfidence !== undefined) {
    if (modelReportedConfidence >= 0.85) {
      confidenceTier = 'high';
    } else if (modelReportedConfidence >= 0.65) {
      confidenceTier = 'medium';
      isUncertain = true;
    } else {
      confidenceTier = 'low';
      isUncertain = true;
    }
  }

  if (
    uncertaintyNotes.toLowerCase().includes('ambiguous') ||
    uncertaintyNotes.toLowerCase().includes('uncertain') ||
    uncertaintyNotes.toLowerCase().includes('not a physical') ||
    uncertaintyNotes.toLowerCase().includes('composite')
  ) {
    isUncertain = true;
    if (confidenceTier === 'high') {
      confidenceTier = 'medium';
    }
  }

  return {
    itemName,
    materialType,
    category,
    visibleContamination,
    preparationAdvice,
    reasoning,
    uncertaintyNotes,
    modelReportedConfidence,
    confidenceTier,
    isUncertain,
    disclaimer: MATTERLENS_DISCLAIMER,
    modelUsed: modelName,
    timestamp: new Date().toISOString(),
  };
}
