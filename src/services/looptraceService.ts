import type { LoopTraceRecord, LoopTraceAction, LoopTraceSummary } from '../types/index.ts';

const STORAGE_PREFIX = 'wastewise_looptrace_';

export const LOOPTRACE_CATEGORIES = [
  'Clothing & Textiles',
  'Electronics & Gadgets',
  'Containers & Glassware',
  'Furniture & Homewares',
  'Paper & Cardboard',
  'Plastic & Packaging',
  'Metal & Hardware',
  'Other',
];

export const LOOPTRACE_ACTIONS: {
  id: LoopTraceAction;
  label: string;
  badge: string;
  description: string;
  isSecondLife: boolean;
}[] = [
  {
    id: 'reused',
    label: 'Reused',
    badge: 'Repurposed',
    description: 'Upcycled, repurposed, or reused at home',
    isSecondLife: true,
  },
  {
    id: 'repaired',
    label: 'Repaired',
    badge: 'Mended',
    description: 'Fixed small defect, stitched, or restored functionality',
    isSecondLife: true,
  },
  {
    id: 'donated',
    label: 'Donated',
    badge: 'Charity / Free',
    description: 'Passed on to charity, shelter, or community center',
    isSecondLife: true,
  },
  {
    id: 'resold',
    label: 'Resold',
    badge: 'Second-Hand',
    description: 'Sold or exchanged via second-hand marketplace',
    isSecondLife: true,
  },
  {
    id: 'recycled',
    label: 'Recycled',
    badge: 'Recycling Stream',
    description: 'Deposited in verified local municipal recycling bin',
    isSecondLife: false,
  },
];

function getStorageKey(userId: string): string {
  const safeId = (userId || 'guest').trim();
  return `${STORAGE_PREFIX}${safeId}`;
}

export function calculateSummary(records: LoopTraceRecord[]): LoopTraceSummary {
  const byAction = {
    reused: 0,
    repaired: 0,
    donated: 0,
    resold: 0,
    recycled: 0,
  };

  let itemsSecondLife = 0;
  let itemsRecycled = 0;

  for (const record of records) {
    if (record.action in byAction) {
      byAction[record.action]++;
    }

    if (['reused', 'repaired', 'donated', 'resold'].includes(record.action)) {
      itemsSecondLife++;
    } else if (record.action === 'recycled') {
      itemsRecycled++;
    }
  }

  return {
    totalActivities: records.length,
    itemsSecondLife,
    itemsRecycled,
    byAction,
  };
}

export async function getLoopTraceRecords(userId: string): Promise<LoopTraceRecord[]> {
  // Micro-delay to simulate async storage call
  await new Promise((res) => setTimeout(res, 50));

  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: LoopTraceRecord[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Ensure sorted newest first
    return parsed.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to load LoopTrace records:', err);
    return [];
  }
}

export async function createLoopTraceRecord(
  data: Omit<LoopTraceRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LoopTraceRecord> {
  await new Promise((res) => setTimeout(res, 50));

  const userId = data.userId || 'guest';
  const existing = await getLoopTraceRecords(userId);

  const now = new Date().toISOString();
  const newRecord: LoopTraceRecord = {
    ...data,
    id: `loop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newRecord, ...existing];
  const key = getStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(updatedList));

  return newRecord;
}

export async function updateLoopTraceRecord(
  id: string,
  updates: Partial<Omit<LoopTraceRecord, 'id' | 'userId' | 'createdAt'>>,
  userId: string
): Promise<LoopTraceRecord> {
  await new Promise((res) => setTimeout(res, 50));

  const safeUserId = userId || 'guest';
  const existing = await getLoopTraceRecords(safeUserId);

  const index = existing.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Activity record not found or not owned by user.');
  }

  const updated: LoopTraceRecord = {
    ...existing[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  existing[index] = updated;
  const key = getStorageKey(safeUserId);
  localStorage.setItem(key, JSON.stringify(existing));

  return updated;
}

export async function deleteLoopTraceRecord(id: string, userId: string): Promise<boolean> {
  await new Promise((res) => setTimeout(res, 50));

  const safeUserId = userId || 'guest';
  const existing = await getLoopTraceRecords(safeUserId);

  const filtered = existing.filter((r) => r.id !== id);
  if (filtered.length === existing.length) {
    return false;
  }

  const key = getStorageKey(safeUserId);
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}
