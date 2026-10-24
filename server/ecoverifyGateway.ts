import type { IncomingMessage, ServerResponse } from 'http';
import { verifyRecyclingRules } from './ecoverifyAdapter.ts';
import type { EcoVerifyInput } from '../src/types/index.ts';

export type EcoVerifyInputOutcome =
  | { ok: true; input: EcoVerifyInput }
  | { ok: false; status: number; error: string };

/**
 * Transport-free validation of an EcoVerify request body. Shared by the Vite dev
 * middleware and the Vercel serverless function so both enforce the same limits.
 */
export function buildEcoVerifyInput(body: Partial<EcoVerifyInput>): EcoVerifyInputOutcome {
  const country = typeof body.country === 'string' ? body.country.trim().slice(0, 100) : '';
  const location = typeof body.location === 'string' ? body.location.trim().slice(0, 150) : '';
  const itemName = typeof body.itemName === 'string' ? body.itemName.trim().slice(0, 150) : '';
  const materialType = typeof body.materialType === 'string' ? body.materialType.trim().slice(0, 150) : '';
  const condition = typeof body.condition === 'string' ? body.condition.trim().slice(0, 150) : '';
  const details = typeof body.details === 'string' ? body.details.trim().slice(0, 300) : '';

  if (!location) {
    return { ok: false, status: 400, error: 'City, postcode, or campus location is required.' };
  }
  if (!itemName) {
    return { ok: false, status: 400, error: 'Item name is required.' };
  }
  if (!materialType) {
    return { ok: false, status: 400, error: 'Material type is required.' };
  }

  return {
    ok: true,
    input: {
      country: country || 'United States',
      location,
      itemName,
      materialType,
      condition,
      details,
    },
  };
}

export async function handleEcoVerify(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  let bodyStr = '';
  const MAX_PAYLOAD_SIZE = 64 * 1024; // 64KB max

  req.on('data', (chunk) => {
    bodyStr += chunk;
    if (bodyStr.length > MAX_PAYLOAD_SIZE) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Payload size exceeds 64KB limit.' }));
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      let body: Partial<EcoVerifyInput>;
      try {
        body = JSON.parse(bodyStr);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
        return;
      }

      const built = buildEcoVerifyInput(body);
      res.setHeader('Content-Type', 'application/json');

      if (!built.ok) {
        res.statusCode = built.status;
        res.end(JSON.stringify({ success: false, error: built.error }));
        return;
      }

      const verification = verifyRecyclingRules(built.input);

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, data: verification }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: `Internal error during verification: ${err instanceof Error ? err.message : 'Unknown'}`
      }));
    }
  });
}
