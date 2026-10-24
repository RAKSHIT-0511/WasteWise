import type { IncomingMessage, ServerResponse } from 'http';
import type { EcoVerifyInput } from '../../src/types/index.ts';
import { buildEcoVerifyInput } from '../../server/ecoverifyGateway.ts';
import { verifyRecyclingRules } from '../../server/ecoverifyAdapter.ts';
import { readJsonBody, sendJson, methodNotAllowed } from '../../server/httpJson.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const parsed = await readJsonBody(req, 64 * 1024);
  if (!parsed.ok) return sendJson(res, parsed.status, { success: false, error: parsed.error });

  const built = buildEcoVerifyInput(parsed.body as Partial<EcoVerifyInput>);
  if (!built.ok) return sendJson(res, built.status, { success: false, error: built.error });

  sendJson(res, 200, { success: true, data: verifyRecyclingRules(built.input) });
}
