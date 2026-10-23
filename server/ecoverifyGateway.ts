import type { IncomingMessage, ServerResponse } from 'http';
import { verifyRecyclingRules } from './ecoverifyAdapter';
import type { EcoVerifyInput } from '../src/types/index.ts';

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

      // Input validation
      const country = typeof body.country === 'string' ? body.country.trim().slice(0, 100) : '';
      const location = typeof body.location === 'string' ? body.location.trim().slice(0, 150) : '';
      const itemName = typeof body.itemName === 'string' ? body.itemName.trim().slice(0, 150) : '';
      const materialType = typeof body.materialType === 'string' ? body.materialType.trim().slice(0, 150) : '';
      const condition = typeof body.condition === 'string' ? body.condition.trim().slice(0, 150) : '';
      const details = typeof body.details === 'string' ? body.details.trim().slice(0, 300) : '';

      if (!location) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'City, postcode, or campus location is required.' }));
        return;
      }

      if (!itemName) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Item name is required.' }));
        return;
      }

      if (!materialType) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Material type is required.' }));
        return;
      }

      const input: EcoVerifyInput = {
        country: country || 'United States',
        location,
        itemName,
        materialType,
        condition,
        details,
      };

      const verification = verifyRecyclingRules(input);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
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
