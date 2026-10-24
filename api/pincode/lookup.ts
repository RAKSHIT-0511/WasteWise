import type { IncomingMessage, ServerResponse } from 'http';
import { lookupIndianPincode } from '../../server/pincodeGateway.ts';
import { readJsonBody, sendJson, methodNotAllowed } from '../../server/httpJson.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let pincode = '';

  if (req.method === 'GET') {
    const url = new URL(req.url || '', 'http://localhost');
    pincode = url.searchParams.get('pincode') || '';
  } else if (req.method === 'POST') {
    const parsed = await readJsonBody(req, 8 * 1024);
    if (!parsed.ok) return sendJson(res, parsed.status, { success: false, error: parsed.error });
    pincode = typeof parsed.body.pincode === 'string' ? parsed.body.pincode : '';
  } else {
    return methodNotAllowed(res, 'GET, POST');
  }

  const result = await lookupIndianPincode(pincode);
  sendJson(res, result.success ? 200 : 400, result);
}
