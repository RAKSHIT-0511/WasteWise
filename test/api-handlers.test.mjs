import { test } from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';

import healthHandler from '../api/health.ts';
import ecoverifyHandler from '../api/ecoverify/verify.ts';
import nextworthHandler from '../api/nextworth/recommend.ts';
import pincodeHandler from '../api/pincode/lookup.ts';
import matterlensHandler from '../api/matterlens/identify.ts';

/**
 * These cover the serverless deployment path.
 *
 * The failure this guards against: Vercel's Node runtime parses JSON bodies and
 * exposes them on `req.body`, leaving the request stream already consumed. A
 * handler that only reads the stream never resolves, so the browser sits on
 * "Checking Rules..." until the function times out. `preparsedReq` reproduces
 * that runtime exactly — no readable stream at all.
 */
function preparsedReq(method, body, url = '/') {
  return { method, url, headers: { 'content-type': 'application/json' }, body };
}

/** The Vite dev middleware hands over an untouched stream instead. */
function streamReq(method, body, url = '/') {
  const r = Readable.from([JSON.stringify(body)]);
  return Object.assign(r, { method, url, headers: { 'content-type': 'application/json' } });
}

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    payload: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(text) { this.payload = text ? JSON.parse(text) : undefined; },
  };
}

const run = async (handler, req) => {
  const res = mockRes();
  await handler(req, res);
  return res;
};

test('api/health reports gateway status without leaking the key', async () => {
  const res = await run(healthHandler, preparsedReq('GET', undefined, '/api/health'));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.status, 'ok');
  assert.ok(res.payload.model.length > 0);
  assert.ok(!JSON.stringify(res.payload).includes(process.env.GEMINI_API_KEY || '@@no-key@@'));
});

test('api/ecoverify resolves a pre-parsed body (the Vercel runtime)', async () => {
  const res = await run(ecoverifyHandler, preparsedReq('POST', {
    country: 'United States', location: 'Seattle, WA',
    itemName: 'Water Bottle', materialType: 'PET Plastic', condition: 'Clean & empty',
  }));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.success, true);
  assert.strictEqual(res.payload.data.status, 'ACCEPTED');
  assert.match(res.payload.data.authority, /Seattle Public Utilities/);
});

test('api/ecoverify resolves a streamed body (the dev middleware)', async () => {
  const res = await run(ecoverifyHandler, streamReq('POST', {
    country: 'United States', location: 'Seattle, WA',
    itemName: 'Pizza Box', materialType: 'Corrugated Cardboard', condition: 'Has food grease or sauce',
  }));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.data.status, 'REJECTED');
  assert.match(res.payload.data.binRecommendation.name, /Compost/);
});

test('api/ecoverify rejects a missing location with 400, not a hang', async () => {
  const res = await run(ecoverifyHandler, preparsedReq('POST', { itemName: 'Jar', materialType: 'Glass' }));
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.payload.success, false);
});

test('api/ecoverify refuses GET', async () => {
  const res = await run(ecoverifyHandler, preparsedReq('GET'));
  assert.strictEqual(res.statusCode, 405);
  assert.strictEqual(res.headers.allow, 'POST');
});

test('api/nextworth falls back to the rule engine with no API key', async () => {
  const res = await run(nextworthHandler, preparsedReq('POST', {
    itemName: 'Cotton T-Shirt', category: 'Clothing & Textiles', condition: 'Good / gently used',
  }));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.success, true);
  assert.ok(res.payload.data.bestNextStep.title.length > 0);
  assert.ok(Array.isArray(res.payload.data.otherOptions));
});

test('api/nextworth requires an item name', async () => {
  const res = await run(nextworthHandler, preparsedReq('POST', { category: 'General' }));
  assert.strictEqual(res.statusCode, 400);
});

test('api/pincode reads the query string on GET', async () => {
  const res = await run(pincodeHandler, preparsedReq('GET', undefined, '/api/pincode/lookup?pincode=560001'));
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.payload.success, true);
  assert.strictEqual(res.payload.pincode, '560001');
});

test('api/pincode rejects a malformed PIN', async () => {
  const res = await run(pincodeHandler, preparsedReq('GET', undefined, '/api/pincode/lookup?pincode=12'));
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.payload.success, false);
});

test('api/matterlens reports missing credentials rather than hanging', async () => {
  const hadKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const res = await run(matterlensHandler, preparsedReq('POST', { imageBase64: 'iVBORw0KGgoAAAA' }));
    assert.strictEqual(res.statusCode, 500);
    assert.match(res.payload.error, /not configured/i);
  } finally {
    if (hadKey !== undefined) process.env.GEMINI_API_KEY = hadKey;
  }
});

test('api/matterlens rejects a non-image payload before calling the model', async () => {
  const hadKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key-not-used';
  try {
    const res = await run(matterlensHandler, preparsedReq('POST', { imageBase64: 'bm90LWFuLWltYWdl' }));
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.payload.error, /Unsupported image format/i);
  } finally {
    if (hadKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = hadKey;
  }
});
