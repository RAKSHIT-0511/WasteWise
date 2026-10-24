import type { IncomingMessage, ServerResponse } from 'http';
import { getNextWorthRecommendation } from '../../server/nextworthGateway.ts';
import { readJsonBody, sendJson, methodNotAllowed } from '../../server/httpJson.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const parsed = await readJsonBody(req, 256 * 1024);
  if (!parsed.ok) return sendJson(res, parsed.status, { success: false, error: parsed.error });

  const itemName = typeof parsed.body.itemName === 'string' ? parsed.body.itemName.trim() : '';
  const category = typeof parsed.body.category === 'string' ? parsed.body.category.trim() : 'General';
  const condition = typeof parsed.body.condition === 'string' ? parsed.body.condition.trim() : 'Good / gently used';

  if (!itemName) return sendJson(res, 400, { success: false, error: 'Item name is required.' });

  const data = await getNextWorthRecommendation(itemName, category || 'General', condition || 'Good / gently used');
  sendJson(res, 200, { success: true, data });
}
