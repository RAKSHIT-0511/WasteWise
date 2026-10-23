import type { IncomingMessage, ServerResponse } from 'http';

export interface PincodeLookupResult {
  success: boolean;
  pincode: string;
  district?: string;
  state?: string;
  localities?: string[];
  resolvedLocation?: string;
  error?: string;
}

// Offline fallback dictionary for major postal hubs to ensure resiliency in test/offline environments
const KNOWN_PINCODES: Record<string, { district: string; state: string; localities: string[] }> = {
  '560001': { district: 'Bengaluru', state: 'Karnataka', localities: ['Bangalore G.P.O.', 'Raj Bhavan', 'Vidhana Soudha'] },
  '560034': { district: 'Bengaluru', state: 'Karnataka', localities: ['Koramangala', 'Koramangala I Block', 'St. John\'s Medical College'] },
  '560038': { district: 'Bengaluru', state: 'Karnataka', localities: ['Indiranagar', 'HAL 2nd Stage'] },
  '400001': { district: 'Mumbai', state: 'Maharashtra', localities: ['Mumbai G.P.O.', 'Fort', 'Bazargate'] },
  '400050': { district: 'Mumbai', state: 'Maharashtra', localities: ['Bandra West', 'Bandra Suburb'] },
  '110001': { district: 'Delhi', state: 'Delhi', localities: ['New Delhi G.P.O.', 'Connaught Place', 'Baroda House'] },
  '110016': { district: 'Delhi', state: 'Delhi', localities: ['Hauz Khas', 'Green Park Market', 'IIT Delhi'] },
  '834001': { district: 'Ranchi', state: 'Jharkhand', localities: ['Ranchi G.P.O.', 'Court Compound', 'Kutchery'] },
  '834002': { district: 'Ranchi', state: 'Jharkhand', localities: ['Doranda', 'Hinoo'] },
  '500001': { district: 'Hyderabad', state: 'Telangana', localities: ['Hyderabad G.P.O.', 'Abids', 'Afzalgunj'] },
  '600001': { district: 'Chennai', state: 'Tamil Nadu', localities: ['Chennai G.P.O.', 'George Town', 'Parrys'] },
  '700001': { district: 'Kolkata', state: 'West Bengal', localities: ['Kolkata G.P.O.', 'Dalhousie Square', 'BBD Bagh'] },
  '411001': { district: 'Pune', state: 'Maharashtra', localities: ['Pune G.P.O.', 'Camp', 'Station Road'] },
};

export async function lookupIndianPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = (pincode || '').trim();

  // Validate exactly 6 digits
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      success: false,
      pincode: cleanPin,
      error: 'PIN code must contain exactly 6 numeric digits.',
    };
  }

  // Check known offline dictionary first if network is offline or for instant hit
  const known = KNOWN_PINCODES[cleanPin];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'WasteWise-Recycling-App/1.0' },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const offices = data[0].PostOffice;
        const district = offices[0].District || offices[0].Block || 'Unknown District';
        const state = offices[0].State || 'India';
        const localities = Array.from(new Set(offices.map((o: { Name: string }) => o.Name).filter(Boolean))) as string[];
        const primaryLocality = localities[0] || district;

        return {
          success: true,
          pincode: cleanPin,
          district,
          state,
          localities,
          resolvedLocation: `${primaryLocality}, ${district}, ${state}`,
        };
      }
    }
  } catch {
    // If external API times out or network is unavailable, rely on known list
  }

  if (known) {
    return {
      success: true,
      pincode: cleanPin,
      district: known.district,
      state: known.state,
      localities: known.localities,
      resolvedLocation: `${known.localities[0]}, ${known.district}, ${known.state}`,
    };
  }

  return {
    success: false,
    pincode: cleanPin,
    error: `No postal records found for PIN code ${cleanPin}. Please verify or enter your city manually.`,
  };
}

export async function handlePincodeLookup(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Support both GET query or POST JSON
  let pin = '';

  if (req.method === 'GET') {
    const url = new URL(req.url || '', 'http://localhost');
    pin = url.searchParams.get('pincode') || '';
  } else if (req.method === 'POST') {
    let bodyStr = '';
    for await (const chunk of req) {
      bodyStr += chunk;
      if (bodyStr.length > 8192) break;
    }
    try {
      const parsed = JSON.parse(bodyStr);
      pin = parsed.pincode || '';
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
      return;
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use GET or POST.' }));
    return;
  }

  const result = await lookupIndianPincode(pin);

  res.statusCode = result.success ? 200 : 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result));
}
