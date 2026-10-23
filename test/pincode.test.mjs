import { test } from 'node:test';
import assert from 'node:assert';
import { lookupIndianPincode } from '../server/pincodeGateway.ts';

test('PIN lookup rejects invalid or non-6-digit PIN codes', async () => {
  const shortPin = await lookupIndianPincode('5600');
  assert.strictEqual(shortPin.success, false);
  assert.ok(shortPin.error.includes('6 numeric digits'));

  const textPin = await lookupIndianPincode('ABC123');
  assert.strictEqual(textPin.success, false);
  assert.ok(textPin.error.includes('6 numeric digits'));

  const emptyPin = await lookupIndianPincode('');
  assert.strictEqual(emptyPin.success, false);
});

test('PIN lookup resolves valid Bengaluru PIN 560001', async () => {
  const res = await lookupIndianPincode('560001');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.pincode, '560001');
  assert.ok(res.district.toLowerCase().includes('bangalore') || res.district.toLowerCase().includes('bengaluru'));
  assert.strictEqual(res.state, 'Karnataka');
  assert.ok(res.localities && res.localities.length > 0);
  assert.ok(res.resolvedLocation.includes('Karnataka'));
});

test('PIN lookup handles multi-locality PIN 560034', async () => {
  const res = await lookupIndianPincode('560034');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.pincode, '560034');
  assert.ok(res.localities.some(loc => loc.toLowerCase().includes('koramangala')));
  assert.ok(res.district.toLowerCase().includes('bangalore') || res.district.toLowerCase().includes('bengaluru'));
});

test('PIN lookup handles Mumbai PIN 400001', async () => {
  const res = await lookupIndianPincode('400001');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.state, 'Maharashtra');
  assert.ok(res.district.toLowerCase().includes('mumbai'));
});

test('PIN lookup handles Delhi PIN 110001', async () => {
  const res = await lookupIndianPincode('110001');
  assert.strictEqual(res.success, true);
  assert.ok(res.state.toLowerCase().includes('delhi'));
});

test('PIN lookup handles non-existent PIN code gracefully', async () => {
  const res = await lookupIndianPincode('999999');
  assert.strictEqual(res.success, false);
  assert.ok(res.error.includes('No postal records found') || res.error.includes('manually'));
});
