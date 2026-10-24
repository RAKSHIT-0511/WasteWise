import type { IncomingMessage, ServerResponse } from 'http';
import { sendJson } from '../server/httpJson.ts';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  // Report configuration status without exposing the secret itself
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  sendJson(res, 200, {
    status: 'ok',
    service: 'WasteWise Backend Gateway',
    aiConfigured: hasKey,
    model: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  });
}
