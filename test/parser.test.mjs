import { test } from 'node:test';
import assert from 'node:assert';
import { validateImageBuffer, parseMatterLensResponse, MATTERLENS_DISCLAIMER } from '../src/utils/matterlensParser.ts';

test('validateImageBuffer rejects invalid input and detects PNG signature', () => {
  const emptyRes = validateImageBuffer('');
  assert.strictEqual(emptyRes.valid, false);

  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const pngRes = validateImageBuffer(pngBase64);
  assert.strictEqual(pngRes.valid, true);
  assert.strictEqual(pngRes.mimeType, 'image/png');
});

test('validateImageBuffer detects JPEG signature', () => {
  const jpegSample = '/9j/4AAQSkZJRgABAQEASABIAAD/';
  const res = validateImageBuffer(jpegSample);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.mimeType, 'image/jpeg');
});

test('parseMatterLensResponse extracts JSON from raw output and clamps confidence', () => {
  const rawModelResponse = `
    The user wants an analysis. Thinking process here...
    \`\`\`json
    {
      "itemName": "Clear PET Water Bottle",
      "materialType": "PET #1 (Polyethylene Terephthalate)",
      "category": "Recyclable Plastic",
      "visibleContamination": "Slight moisture residue inside, label intact",
      "preparationAdvice": "Rinse clean and remove polypropylene cap before sorting.",
      "reasoning": "Transparent cylindrical bottle with standard resin code #1 base profile.",
      "uncertaintyNotes": "Cap appears to be different polymer (PP #5).",
      "modelReportedConfidence": 0.94
    }
    \`\`\`
  `;

  const parsed = parseMatterLensResponse(rawModelResponse, 'gemma-4-26b-a4b-it');

  assert.strictEqual(parsed.itemName, 'Clear PET Water Bottle');
  assert.strictEqual(parsed.materialType, 'PET #1 (Polyethylene Terephthalate)');
  assert.strictEqual(parsed.category, 'Recyclable Plastic');
  assert.strictEqual(parsed.modelReportedConfidence, 0.94);
  assert.strictEqual(parsed.confidenceTier, 'high');
  assert.strictEqual(parsed.disclaimer, MATTERLENS_DISCLAIMER);
  assert.strictEqual(parsed.modelUsed, 'gemma-4-26b-a4b-it');
});

test('parseMatterLensResponse correctly flags uncertainty when model reports low confidence', () => {
  const rawJson = JSON.stringify({
    itemName: 'Multi-layer Foil Snack Pouch',
    materialType: 'Metallized Plastic Composite',
    category: 'Landfill / Non-Recyclable Film',
    visibleContamination: 'Food grease',
    preparationAdvice: 'Dispose in general waste.',
    reasoning: 'Opaque reflective foil lining.',
    uncertaintyNotes: 'Ambiguous multi-material laminate.',
    modelReportedConfidence: 0.55
  });

  const parsed = parseMatterLensResponse(rawJson, 'gemma-4-26b-a4b-it');
  assert.strictEqual(parsed.isUncertain, true);
  assert.strictEqual(parsed.confidenceTier, 'low');
  assert.strictEqual(parsed.modelReportedConfidence, 0.55);
});
