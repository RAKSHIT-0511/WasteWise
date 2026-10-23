import { test } from 'node:test';
import assert from 'node:assert';
import { getNextWorthRuleRecommendation } from '../server/nextworthGateway.ts';

test('NextWorth suggests donation/resale for wearable clothing in good condition', () => {
  const rec = getNextWorthRuleRecommendation('Vintage Cotton T-Shirt', 'Clothing & Textiles', 'Good / gently used');

  assert.strictEqual(rec.itemName, 'Vintage Cotton T-Shirt');
  assert.strictEqual(rec.category, 'Clothing & Textiles');
  assert.strictEqual(rec.bestNextStep.actionType, 'donate');
  assert.ok(rec.bestNextStep.title.includes('Donate'));
  assert.ok(rec.bestNextStep.checklist.length >= 3);
  assert.ok(rec.otherOptions.length >= 2);
  assert.ok(rec.disclaimer.includes('No specific buyer, price, or charity acceptance is guaranteed'));
});

test('NextWorth suggests upcycling/cleaning cloths for torn or damaged clothing', () => {
  const rec = getNextWorthRuleRecommendation('Old Ripped Denim Jeans', 'Clothing & Textiles', 'Heavily worn / torn');

  assert.strictEqual(rec.bestNextStep.actionType, 'upcycle');
  assert.ok(rec.bestNextStep.title.includes('Cleaning Cloths') || rec.bestNextStep.title.includes('Upcycle'));
  assert.ok(rec.bestNextStep.checklist.some(step => step.includes('Cut away') || step.includes('buttons')));
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'repair'));
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'recycle'));
});

test('NextWorth recommends digital inclusion or donation for functional electronics', () => {
  const rec = getNextWorthRuleRecommendation('Working Android Tablet', 'Electronics & Gadgets', 'Good / working');

  assert.strictEqual(rec.bestNextStep.actionType, 'donate');
  assert.ok(rec.bestNextStep.checklist.some(step => step.toLowerCase().includes('reset')));
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'resell'));
});

test('NextWorth recommends repair or authorized e-waste facility for broken electronics', () => {
  const rec = getNextWorthRuleRecommendation('Broken Laptop', 'Electronics & Gadgets', 'Needs repair / broken');

  assert.strictEqual(rec.bestNextStep.actionType, 'repair');
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'recycle'));
  assert.ok(rec.otherOptions.some(opt => opt.title.includes('E-Waste')));
});

test('NextWorth recommends pantry reuse for glass jars and bottles', () => {
  const rec = getNextWorthRuleRecommendation('Pasta Sauce Glass Jar', 'Containers & Glassware', 'Clean & empty');

  assert.strictEqual(rec.bestNextStep.actionType, 'reuse');
  assert.ok(rec.bestNextStep.title.includes('Pantry') || rec.bestNextStep.title.includes('Storage'));
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'upcycle'));
  assert.ok(rec.otherOptions.some(opt => opt.actionType === 'recycle'));
});

test('NextWorth includes honest condition notes and disclaimers', () => {
  const rec = getNextWorthRuleRecommendation('Wooden Bookshelf', 'Furniture', 'Good condition');

  assert.ok(rec.conditionNote.length > 0);
  assert.ok(rec.disclaimer.length > 0);
  assert.ok(!rec.bestNextStep.summary.includes('$') && !rec.bestNextStep.summary.includes('guaranteed buyer'));
});
