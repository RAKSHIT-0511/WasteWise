export type CoreFeatureId = 
  | 'matterlens' 
  | 'ecoverify' 
  | 'nextworth' 
  | 'looptrace';

export interface CoreFeature {
  id: CoreFeatureId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  status: 'planned' | 'in-progress' | 'ready';
}

export const CORE_FEATURES: CoreFeature[] = [
  {
    id: 'matterlens',
    name: 'MatterLens',
    tagline: 'AI Waste Identification & Material Analysis',
    description: 'Sub-second optical inspection and multi-layer composition classification powered by Gemma 4 vision intelligence.',
    iconName: 'scan-line',
    status: 'ready',
  },
  {
    id: 'ecoverify',
    name: 'EcoVerify',
    tagline: 'Local Recycling Guideline Verification',
    description: 'Real-time cross-referencing against municipal rules, hauler capabilities, and contamination thresholds.',
    iconName: 'check-circle-2',
    status: 'ready',
  },
  {
    id: 'nextworth',
    name: 'NextWorth',
    tagline: 'Circular Hierarchy Recommendations',
    description: 'Actionable pathways to reuse, repair, donate, sell, compost, or recycle before defaulting to disposal.',
    iconName: 'sparkles',
    status: 'ready',
  },
  {
    id: 'looptrace',
    name: 'LoopTrace',
    tagline: 'Track Your Environmental Impact',
    description: 'Record items you reuse, repair, donate, resell, or recycle to see your true circular journey.',
    iconName: 'rotate-ccw',
    status: 'ready',
  },
];

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'info';
  icon: string;
}

export interface ActivityDay {
  day: string;
  fullDay: string;
  scans: number;
  diverted: number;
  isPeak?: boolean;
}

export interface StreamCategory {
  name: string;
  percentage: number;
  weightKg: number;
  color: string;
  hex: string;
}

export interface ScanItem {
  id: string;
  title: string;
  binName: string;
  binColorClass: string;
  timeAgo: string;
  matchScore: number;
  ecoPoints: number;
  imageUrl: string;
  imageAlt: string;
}

export type EcoVerifyStatus = 'ACCEPTED' | 'REJECTED' | 'UNVERIFIED';

export interface EcoVerifyInput {
  country: string;
  location: string;
  itemName: string;
  materialType: string;
  condition?: string;
  details?: string;
}

export interface EcoVerifyEvidence {
  authority: string;
  authorityLevel: 'municipal' | 'campus' | 'hauler' | 'regional' | 'unverified';
  portalName: string;
  sourceUrl: string;
  checkDate: string;
  status: EcoVerifyStatus;
  headline: string;
  instructions: string;
  explanation: string;
  conditions: string[];
  limitationsNotes?: string;
  binRecommendation?: {
    name: string;
    colorClass: string;
    bgClass: string;
  };
  alternativeDropoff?: string;
  citationQuote?: string;
}

export interface EcoVerifyResponse {
  success: boolean;
  data?: EcoVerifyEvidence;
  error?: string;
}

export type LoopTraceAction = 'reused' | 'repaired' | 'donated' | 'resold' | 'recycled';
export type LoopTraceStatus = 'completed' | 'in_progress';

export interface LoopTraceRecord {
  id: string;
  userId: string;
  itemName: string;
  category: string;
  action: LoopTraceAction;
  date: string;
  status: LoopTraceStatus;
  notes?: string;
  source?: 'manual' | 'nextworth' | 'matterlens';
  createdAt: string;
  updatedAt: string;
}

export interface LoopTraceSummary {
  totalActivities: number;
  itemsSecondLife: number; // sum of reused, repaired, donated, resold
  itemsRecycled: number;   // recycled
  byAction: {
    reused: number;
    repaired: number;
    donated: number;
    resold: number;
    recycled: number;
  };
}

