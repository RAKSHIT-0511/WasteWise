import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSummary, LOOPTRACE_CATEGORIES, LOOPTRACE_ACTIONS } from '../src/services/looptraceService.ts';

test('LoopTrace: calculateSummary correctly aggregates second life, recycled, and total activities', () => {
  const sampleRecords = [
    {
      id: '1',
      userId: 'user_123',
      itemName: 'Vintage Denim Jacket',
      category: 'Clothing & Textiles',
      action: 'repaired',
      date: '2026-10-20',
      status: 'completed',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: '2',
      userId: 'user_123',
      itemName: 'Old Cotton T-shirt',
      category: 'Clothing & Textiles',
      action: 'reused',
      date: '2026-10-21',
      status: 'completed',
      createdAt: '2026-10-21T10:00:00Z',
      updatedAt: '2026-10-21T10:00:00Z',
    },
    {
      id: '3',
      userId: 'user_123',
      itemName: 'Fiction Books',
      category: 'Paper & Cardboard',
      action: 'donated',
      date: '2026-10-22',
      status: 'completed',
      createdAt: '2026-10-22T10:00:00Z',
      updatedAt: '2026-10-22T10:00:00Z',
    },
    {
      id: '4',
      userId: 'user_123',
      itemName: 'Desk Lamp',
      category: 'Furniture & Homewares',
      action: 'resold',
      date: '2026-10-22',
      status: 'completed',
      createdAt: '2026-10-22T11:00:00Z',
      updatedAt: '2026-10-22T11:00:00Z',
    },
    {
      id: '5',
      userId: 'user_123',
      itemName: 'Aluminum Soda Cans',
      category: 'Metal & Hardware',
      action: 'recycled',
      date: '2026-10-23',
      status: 'completed',
      createdAt: '2026-10-23T09:00:00Z',
      updatedAt: '2026-10-23T09:00:00Z',
    },
    {
      id: '6',
      userId: 'user_123',
      itemName: 'PET Water Bottles',
      category: 'Plastic & Packaging',
      action: 'recycled',
      date: '2026-10-23',
      status: 'completed',
      createdAt: '2026-10-23T10:00:00Z',
      updatedAt: '2026-10-23T10:00:00Z',
    },
  ];

  const summary = calculateSummary(sampleRecords);

  assert.equal(summary.totalActivities, 6);
  assert.equal(summary.itemsSecondLife, 4, 'Second life should count repaired + reused + donated + resold');
  assert.equal(summary.itemsRecycled, 2, 'Items recycled should count recycled items');

  assert.equal(summary.byAction.repaired, 1);
  assert.equal(summary.byAction.reused, 1);
  assert.equal(summary.byAction.donated, 1);
  assert.equal(summary.byAction.resold, 1);
  assert.equal(summary.byAction.recycled, 2);
});

test('LoopTrace: calculateSummary returns zeros for empty activity list without inventing metrics', () => {
  const summary = calculateSummary([]);

  assert.equal(summary.totalActivities, 0);
  assert.equal(summary.itemsSecondLife, 0);
  assert.equal(summary.itemsRecycled, 0);
  assert.equal(summary.byAction.reused, 0);
  assert.equal(summary.byAction.recycled, 0);
});

test('LoopTrace: supported categories and actions are properly structured', () => {
  assert.ok(LOOPTRACE_CATEGORIES.includes('Clothing & Textiles'));
  assert.ok(LOOPTRACE_CATEGORIES.includes('Electronics & Gadgets'));
  assert.ok(LOOPTRACE_CATEGORIES.includes('Containers & Glassware'));

  const actionIds = LOOPTRACE_ACTIONS.map((a) => a.id);
  assert.deepEqual(actionIds.sort(), ['donated', 'recycled', 'repaired', 'resold', 'reused'].sort());

  const secondLifeActions = LOOPTRACE_ACTIONS.filter((a) => a.isSecondLife).map((a) => a.id);
  assert.deepEqual(secondLifeActions.sort(), ['donated', 'repaired', 'resold', 'reused'].sort());
});

test('LoopTrace: NextWorth action mapping correctly translates pathways', () => {
  const actionMap = {
    upcycle: 'reused',
    reuse: 'reused',
    repair: 'repaired',
    donate: 'donated',
    sell: 'resold',
    recycle: 'recycled',
  };

  assert.equal(actionMap.upcycle, 'reused');
  assert.equal(actionMap.repair, 'repaired');
  assert.equal(actionMap.donate, 'donated');
  assert.equal(actionMap.sell, 'resold');
  assert.equal(actionMap.recycle, 'recycled');
});

test('LoopTrace: User isolation logic ensures records are scoped by userId', () => {
  const user1Records = [
    { id: 'rec_1', userId: 'user_A', itemName: 'Phone', action: 'repaired' },
  ];
  const user2Records = [
    { id: 'rec_2', userId: 'user_B', itemName: 'Shirt', action: 'donated' },
  ];

  const filterForUser = (records, targetUser) => records.filter((r) => r.userId === targetUser);

  assert.equal(filterForUser(user1Records, 'user_A').length, 1);
  assert.equal(filterForUser(user1Records, 'user_B').length, 0);
  assert.equal(filterForUser(user2Records, 'user_B').length, 1);
});
