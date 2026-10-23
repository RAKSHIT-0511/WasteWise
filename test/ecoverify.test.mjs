import { test } from 'node:test';
import assert from 'node:assert';
import { verifyRecyclingRules } from '../server/ecoverifyAdapter.ts';

test('EcoVerify status assignment: Clean PET bottle in Seattle is ACCEPTED', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'Seattle, WA',
    itemName: 'Plastic Water Bottle',
    materialType: 'PET #1 Polyethylene Terephthalate',
    condition: 'Clean & empty',
  });

  assert.strictEqual(result.status, 'ACCEPTED');
  assert.strictEqual(result.authority, 'Seattle Public Utilities (SPU)');
  assert.ok(result.conditions.length > 0);
  assert.ok(result.sourceUrl.includes('seattle.gov'));
});

test('EcoVerify status assignment: Alkaline battery in San Francisco is REJECTED from curbside', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'San Francisco, CA (94107)',
    itemName: 'AA Alkaline Battery',
    materialType: 'Alkaline battery cell',
    condition: 'Used',
  });

  assert.strictEqual(result.status, 'REJECTED');
  assert.ok(result.headline.includes('REJECTED'));
  assert.ok(result.explanation.includes('hazardous') || result.explanation.includes('fire'));
});

test('EcoVerify conflicting evidence: Greasy soiled pizza box in Seattle is REJECTED in recycling, redirected to compost', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: '98105',
    itemName: 'Dominos Pizza Box',
    materialType: 'Corrugated Cardboard',
    condition: 'Heavily soiled with cheese and grease',
  });

  assert.strictEqual(result.status, 'REJECTED');
  assert.strictEqual(result.binRecommendation?.name, 'Green Food & Yard Compost');
  assert.ok(result.explanation.includes('grease') || result.explanation.includes('soiled'));
});

test('EcoVerify location matching: Stanford University campus single-stream recycling is identified', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'Stanford University (94305)',
    itemName: 'Soda Can',
    materialType: 'Aluminum',
    condition: 'Clean and rinsed',
  });

  assert.strictEqual(result.status, 'ACCEPTED');
  assert.strictEqual(result.authority, 'Stanford Office of Sustainability / PSSI');
  assert.strictEqual(result.authorityLevel, 'campus');
});

test('EcoVerify location matching: Toronto Black Plastic is explicitly REJECTED due to optical sorters', () => {
  const result = verifyRecyclingRules({
    country: 'Canada',
    location: 'Toronto, Ontario',
    itemName: 'Takeout Container',
    materialType: 'Black Plastic',
    condition: 'Clean',
  });

  assert.strictEqual(result.status, 'REJECTED');
  assert.strictEqual(result.authority, 'City of Toronto Solid Waste Management Services');
  assert.ok(result.explanation.includes('optical sorting') || result.explanation.includes('black plastic'));
});

test('EcoVerify missing evidence: Unindexed city returns UNVERIFIED with Earth911 locator fallback', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'Helena, Montana',
    itemName: 'Glass Bottle',
    materialType: 'Clear Glass',
    condition: 'Rinsed',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.strictEqual(result.authorityLevel, 'unverified');
  assert.ok(result.headline.includes('UNVERIFIED'));
  assert.ok(result.sourceUrl.includes('earth911.com'));
});

test('EcoVerify international municipal: Westminster London mixed recycling accepts clean cans', () => {
  const result = verifyRecyclingRules({
    country: 'United Kingdom',
    location: 'London SW1 (Westminster)',
    itemName: 'Drink Can',
    materialType: 'Aluminum',
    condition: 'Rinsed',
  });

  assert.strictEqual(result.status, 'ACCEPTED');
  assert.strictEqual(result.authority, 'Westminster City Council / Recycle for London');
  assert.ok(result.sourceUrl.includes('westminster.gov.uk'));
});

test('EcoVerify NYC DSNY: Plastic bags are explicitly REJECTED as equipment tanglers', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'Brooklyn, NYC',
    itemName: 'Grocery Bag',
    materialType: 'Plastic film / LDPE',
    condition: 'Dry',
  });

  assert.strictEqual(result.status, 'REJECTED');
  assert.strictEqual(result.authority, 'New York City Department of Sanitation (DSNY)');
  assert.ok(result.explanation.includes('Sims Municipal Recycling') || result.explanation.includes('clog'));
});

test('EcoVerify unindexed material in recognized city returns UNVERIFIED pointing to city portal', () => {
  const result = verifyRecyclingRules({
    country: 'United States',
    location: 'Seattle, WA',
    itemName: 'Complex Multi-layer Dental Floss Dispenser',
    materialType: 'Unknown Composite Polymer',
    condition: 'Used',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.strictEqual(result.authority, 'Seattle Public Utilities (SPU)');
  assert.ok(result.headline.includes('UNVERIFIED'));
  assert.ok(result.sourceUrl.includes('seattle.gov'));
});

test('EcoVerify India support: Bengaluru returns UNVERIFIED with BBMP and SWM 2016 guidance', () => {
  const result = verifyRecyclingRules({
    country: 'India',
    location: 'Bengaluru, Karnataka',
    itemName: 'Plastic Water Bottle',
    materialType: 'PET Plastic',
    condition: 'Clean & empty',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.ok(result.authority.includes('BBMP') || result.authority.includes('Bruhat Bengaluru'));
  assert.ok(result.sourceUrl.includes('bbmp.gov.in') || result.sourceUrl.includes('cpcb.nic.in'));
  assert.ok(result.instructions.includes('Solid Waste Management Rules') || result.instructions.includes('Dry Recyclables'));
  assert.strictEqual(result.binRecommendation?.name, 'Blue Bin (Dry Recyclable Waste)');
});

test('EcoVerify India support: Mumbai returns UNVERIFIED with BMC authority', () => {
  const result = verifyRecyclingRules({
    country: 'India',
    location: 'Mumbai, Maharashtra',
    itemName: 'Cardboard Box',
    materialType: 'Corrugated Paperboard',
    condition: 'Clean',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.ok(result.authority.includes('BMC') || result.authority.includes('Brihanmumbai'));
  assert.ok(result.sourceUrl.includes('mcgm.gov.in'));
});

test('EcoVerify India support: Delhi returns UNVERIFIED with MCD authority', () => {
  const result = verifyRecyclingRules({
    country: 'India',
    location: 'Delhi (NCR)',
    itemName: 'Lithium Battery',
    materialType: 'E-Waste / Battery',
    condition: 'Used',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.ok(result.authority.includes('MCD') || result.authority.includes('Municipal Corporation of Delhi'));
  assert.strictEqual(result.binRecommendation?.name, 'Red / Black Bin (Domestic Hazardous / E-Waste)');
});

test('EcoVerify India support: Ranchi returns UNVERIFIED with RMC authority', () => {
  const result = verifyRecyclingRules({
    country: 'India',
    location: 'Ranchi, Jharkhand',
    itemName: 'Glass Bottle',
    materialType: 'Glass',
    condition: 'Rinsed',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.ok(result.authority.includes('RMC') || result.authority.includes('Ranchi Municipal Corporation'));
  assert.ok(result.sourceUrl.includes('ranchimunicipal.com'));
});

test('EcoVerify country isolation: Selecting India never applies US/UK/Canada rules even if overlapping keywords exist', () => {
  const result = verifyRecyclingRules({
    country: 'India',
    location: 'Bengaluru (King County Colony)',
    itemName: 'Water Bottle',
    materialType: 'PET',
    condition: 'Clean',
  });

  assert.strictEqual(result.status, 'UNVERIFIED');
  assert.notStrictEqual(result.authority, 'Seattle Public Utilities (SPU)');
  assert.ok(result.authority.includes('BBMP') || result.authority.includes('Urban Local Body'));
});


