import type { IncomingMessage, ServerResponse } from 'http';
import { identifyMaterial } from '../../server/matterlensGateway.ts';
import { readJsonBody, sendJson, methodNotAllowed } from '../../server/httpJson.ts';

// Vercel rejects request bodies over 4.5MB before the function is invoked, and
// base64 inflates an image by ~33%. Guard a little under that so an oversized
// upload gets this JSON error rather than an opaque platform 413.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const parsed = await readJsonBody(req, MAX_BODY_BYTES);
  if (!parsed.ok) return sendJson(res, parsed.status, { success: false, error: parsed.error });

  const mimeType = typeof parsed.body.mimeType === 'string' ? parsed.body.mimeType : undefined;
  const outcome = await identifyMaterial(parsed.body.imageBase64, mimeType);

  if (!outcome.ok) return sendJson(res, outcome.status, { success: false, error: outcome.error });
  sendJson(res, 200, { success: true, result: outcome.result });
}
