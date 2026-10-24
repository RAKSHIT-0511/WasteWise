import type { IncomingMessage, ServerResponse } from 'http';

export type JsonBodyOutcome =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/**
 * Read a JSON request body in either runtime.
 *
 * Vercel's Node runtime parses `application/json` bodies and exposes them on
 * `req.body`, which means the request stream is already consumed — a handler
 * that only listens for 'data'/'end' would hang until the function times out.
 * The Vite dev middleware gives us an untouched stream instead. This reads
 * whichever one we were handed.
 */
export async function readJsonBody(
  req: IncomingMessage & { body?: unknown },
  maxBytes: number
): Promise<JsonBodyOutcome> {
  const pre = req.body;

  if (pre && typeof pre === 'object' && !Buffer.isBuffer(pre)) {
    return { ok: true, body: pre as Record<string, unknown> };
  }

  if (typeof pre === 'string' || Buffer.isBuffer(pre)) {
    const text = pre.toString();
    if (!text) return { ok: true, body: {} };
    try {
      return { ok: true, body: JSON.parse(text) as Record<string, unknown> };
    } catch {
      return { ok: false, status: 400, error: 'Invalid JSON request payload.' };
    }
  }

  let raw = '';
  try {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > maxBytes) {
        const mb = (maxBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '');
        return { ok: false, status: 413, error: `Payload exceeds the ${mb}MB limit.` };
      }
    }
  } catch {
    return { ok: false, status: 400, error: 'Could not read the request body.' };
  }

  if (!raw) return { ok: true, body: {} };
  try {
    return { ok: true, body: JSON.parse(raw) as Record<string, unknown> };
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON request payload.' };
  }
}

export function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export function methodNotAllowed(res: ServerResponse, allowed: string): void {
  res.setHeader('Allow', allowed);
  sendJson(res, 405, { success: false, error: `Method not allowed. Use ${allowed}.` });
}
