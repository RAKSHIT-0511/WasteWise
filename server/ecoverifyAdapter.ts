import type { EcoVerifyInput, EcoVerifyEvidence } from '../src/types/index.ts';

export interface AuthoritativeRule {
  id: string;
  authority: string;
  authorityLevel: 'municipal' | 'campus' | 'hauler' | 'regional';
  portalName: string;
  sourceUrl: string;
  checkDate: string;
  locationKeywords: string[]; // e.g. ['seattle', '98101', '98105', 'king county']
  country: string;
  materialPatterns: RegExp[];
  accepted: boolean; // default acceptance for clean material
  cleanConditions: string[];
  soiledStatus?: 'REJECTED' | 'ACCEPTED' | 'UNVERIFIED'; // when soiled
  soiledInstructions?: string;
  soiledBin?: { name: string; colorClass: string; bgClass: string };
  instructions: string;
  explanation: string;
  binRecommendation: {
    name: string;
    colorClass: string;
    bgClass: string;
  };
  alternativeDropoff?: string;
  citationQuote: string;
}

export const AUTHORITATIVE_MUNICIPAL_RULES: AuthoritativeRule[] = [
  // ==========================================
  // 1. SEATTLE PUBLIC UTILITIES (SPU)
  // ==========================================
  {
    id: 'spu-pet-plastic',
    authority: 'Seattle Public Utilities (SPU)',
    authorityLevel: 'municipal',
    portalName: 'SPU "Where Does It Go?" Recycling & Waste Tool',
    sourceUrl: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/where-does-it-go',
    checkDate: '2026-10-15',
    locationKeywords: ['seattle', '98101', '98102', '98103', '98104', '98105', '98109', '98115', '98122', '98125', 'king county'],
    country: 'United States',
    materialPatterns: [/\bpet\b/i, /polyethylene terephthalate/i, /plastic bottle/i, /plastic #?1\b/i, /water bottle/i, /soda bottle/i],
    accepted: true,
    cleanConditions: ['Empty liquids completely', 'Rinse container clean', 'Plastic caps can remain screwed on'],
    instructions: 'Place in the Blue Curbside Recycling Cart. Ensure container is empty and rinsed.',
    explanation: 'Seattle accepts all clean, rigid plastic bottles, jugs, and tubs in the curbside blue recycling cart. Caps can stay on if screwed onto the bottle.',
    binRecommendation: {
      name: 'Blue Recycling Cart',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Plastic bottles, jars, jugs and tubs are accepted in your recycling cart. Empty and rinse clean. Screw plastic caps back on.',
  },
  {
    id: 'spu-plastic-bags-film',
    authority: 'Seattle Public Utilities (SPU)',
    authorityLevel: 'municipal',
    portalName: 'SPU "Where Does It Go?" Recycling & Waste Tool',
    sourceUrl: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/where-does-it-go',
    checkDate: '2026-10-15',
    locationKeywords: ['seattle', '98101', '98102', '98103', '98104', '98105', '98109', '98115', '98122', '98125', 'king county'],
    country: 'United States',
    materialPatterns: [/plastic bag/i, /film/i, /plastic wrap/i, /bubble wrap/i, /grocery bag/i, /shrink wrap/i],
    accepted: false,
    cleanConditions: ['Must NOT be placed in curbside recycling cart'],
    instructions: 'DO NOT place in curbside recycling. Plastic bags tangle recycling sorting machinery (tanglers). Drop off at grocery store collection bins or place in garbage.',
    explanation: 'Plastic bags and wraps wrap around sorting equipment at Seattle recycling processing facilities, shutting down sorting lines. They are strictly prohibited from curbside carts.',
    binRecommendation: {
      name: 'Grocery Store Drop-off / Garbage',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    alternativeDropoff: 'Take-back drop boxes at participating Safeway, QFC, or Fred Meyer grocery stores.',
    citationQuote: 'Never put plastic bags or plastic wrap in your recycling cart. They wrap around sorting machines and cause shutdowns.',
  },
  {
    id: 'spu-pizza-box-cardboard',
    authority: 'Seattle Public Utilities (SPU)',
    authorityLevel: 'municipal',
    portalName: 'SPU "Where Does It Go?" Food & Yard Waste Rules',
    sourceUrl: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/where-does-it-go',
    checkDate: '2026-10-15',
    locationKeywords: ['seattle', '98101', '98102', '98103', '98104', '98105', '98109', '98115', '98122', '98125', 'king county'],
    country: 'United States',
    materialPatterns: [/pizza box/i, /food-soiled cardboard/i, /soiled paper/i, /greasy cardboard/i],
    accepted: false, // in blue bin
    soiledStatus: 'REJECTED',
    soiledInstructions: 'Greasy pizza boxes must NOT go in blue recycling. Put in Green Food and Yard Waste (Compost) Cart.',
    soiledBin: { name: 'Green Food & Yard Compost', colorClass: 'text-primary-container', bgClass: 'bg-primary-fixed' },
    cleanConditions: ['Clean lid can be torn off for recycling; greasy bottom must be composted'],
    instructions: 'Soiled/greasy boxes go into the Green Food and Yard Waste (Compost) Cart. Completely clean cardboard lids can be torn off for the Blue Recycling Cart.',
    explanation: 'Grease and cheese residues ruin pulp fiber recycling. Seattle mandates food-soiled cardboard go into commercial composting.',
    binRecommendation: {
      name: 'Green Food & Yard Compost',
      colorClass: 'text-primary-container',
      bgClass: 'bg-primary-fixed',
    },
    citationQuote: 'Food-soiled pizza boxes go into the food and yard waste (compost) cart. Clean cardboard goes in recycling.',
  },
  {
    id: 'spu-batteries',
    authority: 'Seattle Public Utilities (SPU)',
    authorityLevel: 'municipal',
    portalName: 'SPU Hazardous Waste & Special Item Collection',
    sourceUrl: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/where-does-it-go',
    checkDate: '2026-10-15',
    locationKeywords: ['seattle', '98101', '98102', '98103', '98104', '98105', '98109', '98115', '98122', '98125', 'king county'],
    country: 'United States',
    materialPatterns: [/battery/i, /alkaline/i, /lithium/i, /nimh/i, /aa battery/i, /cell battery/i],
    accepted: false,
    cleanConditions: ['Must NOT be placed in any curbside recycling or garbage cart'],
    instructions: 'REJECTED from curbside recycling. Batteries cause dangerous fires in collection trucks and recycling centers. Drop off at household hazardous waste facilities.',
    explanation: 'Batteries are combustible hazardous waste. Lithium and alkaline batteries are prohibited in curbside collection under King County / Seattle ordinances.',
    binRecommendation: {
      name: 'Hazardous Waste Drop-off',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    alternativeDropoff: 'North or South Seattle Household Hazardous Waste Station (free drop-off).',
    citationQuote: 'Batteries do not belong in the garbage or recycling carts because they cause fires. Drop them off for safe recycling.',
  },
  {
    id: 'spu-aluminum-glass',
    authority: 'Seattle Public Utilities (SPU)',
    authorityLevel: 'municipal',
    portalName: 'SPU "Where Does It Go?" Recycling & Waste Tool',
    sourceUrl: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/where-does-it-go',
    checkDate: '2026-10-15',
    locationKeywords: ['seattle', '98101', '98102', '98103', '98104', '98105', '98109', '98115', '98122', '98125', 'king county'],
    country: 'United States',
    materialPatterns: [/aluminum can/i, /soda can/i, /tin can/i, /metal can/i, /glass bottle/i, /glass jar/i],
    accepted: true,
    cleanConditions: ['Empty and rinse clean', 'Metal caps can be placed inside cans and crimped, or kept loose if metal'],
    instructions: 'Place in the Blue Curbside Recycling Cart. Empty liquids and rinse food residue.',
    explanation: 'Aluminum and glass are infinitely recyclable materials and are fully supported by Seattle materials recovery facilities.',
    binRecommendation: {
      name: 'Blue Recycling Cart',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Aluminum cans, tin cans, glass bottles, and glass jars are accepted in the recycling cart. Empty and rinse clean.',
  },

  // ==========================================
  // 2. SAN FRANCISCO / RECOLOGY (SF)
  // ==========================================
  {
    id: 'sf-rigid-plastics',
    authority: 'San Francisco Environment Department / Recology SF',
    authorityLevel: 'municipal',
    portalName: 'Recology SF "What Goes Where" Zero Waste Portal',
    sourceUrl: 'https://www.recology.com/recology-san-francisco/what-goes-where',
    checkDate: '2026-10-18',
    locationKeywords: ['san francisco', 'sf', '94102', '94103', '94107', '94110', '94114', '94117', '94122'],
    country: 'United States',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /rigid plastic/i, /hdpe/i, /plastic container/i, /plastic tub/i],
    accepted: true,
    cleanConditions: ['Empty and scrape clean', 'Keep caps attached to bottles'],
    instructions: 'Place in the Blue Recycling Bin. Empty and scrape out food or liquids.',
    explanation: 'San Francisco Recology single-stream recycling accepts all clean rigid plastics (bottles, cups, tubs, clamshells).',
    binRecommendation: {
      name: 'Blue Recycling Bin (Recology)',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'All rigid plastic containers are recyclable in San Francisco. Empty and scrape clean. Reattach caps.',
  },
  {
    id: 'sf-pizza-box-compost',
    authority: 'San Francisco Environment Department / Recology SF',
    authorityLevel: 'municipal',
    portalName: 'Recology SF Zero Waste Composting Standards',
    sourceUrl: 'https://www.recology.com/recology-san-francisco/what-goes-where',
    checkDate: '2026-10-18',
    locationKeywords: ['san francisco', 'sf', '94102', '94103', '94107', '94110', '94114', '94117', '94122'],
    country: 'United States',
    materialPatterns: [/pizza box/i, /food-soiled/i, /greasy paper/i, /paper plate/i, /napkin/i],
    accepted: false, // rejected from blue bin
    soiledStatus: 'REJECTED',
    soiledInstructions: 'Greasy pizza boxes and food-soiled paper are REJECTED in the Blue Bin. Place in Green Compost Bin.',
    soiledBin: { name: 'Green Compost Bin', colorClass: 'text-primary-container', bgClass: 'bg-primary-fixed' },
    cleanConditions: ['Clean paper goes in Blue; soiled paper goes in Green Compost'],
    instructions: 'Place food-soiled boxes and compostable food paper directly into the Green Compost Cart. San Francisco mandates organic composting.',
    explanation: 'San Francisco Ordinance 100-09 requires source separation of compostable organic material. Soiled paper fibers degrade recycling streams.',
    binRecommendation: {
      name: 'Green Compost Bin',
      colorClass: 'text-primary-container',
      bgClass: 'bg-primary-fixed',
    },
    citationQuote: 'Greasy pizza boxes and soiled paper packaging belong in the green compost bin, not in the blue recycling bin.',
  },
  {
    id: 'sf-soft-plastics',
    authority: 'San Francisco Environment Department / Recology SF',
    authorityLevel: 'municipal',
    portalName: 'Recology SF Zero Waste Guidelines',
    sourceUrl: 'https://www.recology.com/recology-san-francisco/what-goes-where',
    checkDate: '2026-10-18',
    locationKeywords: ['san francisco', 'sf', '94102', '94103', '94107', '94110', '94114', '94117', '94122'],
    country: 'United States',
    materialPatterns: [/plastic bag/i, /film/i, /bubble wrap/i, /snack bag/i, /foil pouch/i, /chip bag/i],
    accepted: false,
    cleanConditions: ['Soft plastic films must NOT enter curbside bins'],
    instructions: 'REJECTED from curbside blue bins. Soft plastic wraps and metallized pouches tangle optical sorters. Place in black landfill bin or retail drop-off.',
    explanation: 'Flexible films cannot be mechanically processed in curbside single-stream and are considered contamination.',
    binRecommendation: {
      name: 'Black Landfill Bin / Retail Drop-off',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    citationQuote: 'Plastic bags, plastic wraps, and metallized chip bags belong in the black landfill bin or participating store drop-off.',
  },
  {
    id: 'sf-batteries',
    authority: 'San Francisco Environment Department / Recology SF',
    authorityLevel: 'municipal',
    portalName: 'Recology SF Hazardous & Special Waste Guidelines',
    sourceUrl: 'https://www.recology.com/recology-san-francisco/what-goes-where',
    checkDate: '2026-10-18',
    locationKeywords: ['san francisco', 'sf', '94102', '94103', '94107', '94110', '94114', '94117', '94122'],
    country: 'United States',
    materialPatterns: [/battery/i, /alkaline/i, /lithium/i, /nimh/i, /aa battery/i, /button cell/i],
    accepted: false,
    cleanConditions: ['Do NOT put inside blue, green, or black curbside bins'],
    instructions: 'REJECTED from curbside recycling. Batteries pose catastrophic fire hazard to collection trucks and conveyor lines. Tape terminals and place in a sealed bag on top of black bin lid (single family) or drop off at retail sites.',
    explanation: 'California hazardous waste regulations prohibit batteries in regular trash or recycling carts due to lithium thermal runaway risks.',
    binRecommendation: {
      name: 'Hazardous Waste / Battery Drop-off',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    alternativeDropoff: 'San Francisco Household Hazardous Waste Facility (501 Tunnel Ave) or retail drop-off sites (Walgreens, Cole Hardware).',
    citationQuote: 'Batteries must NEVER be thrown in curbside recycling, compost, or trash bins. Drop them off or tape terminals and bag them on top of the black bin lid.',
  },

  // ==========================================
  // 3. NEW YORK CITY (NYC DSNY)
  // ==========================================
  {
    id: 'nyc-rigid-plastics-metal-glass',
    authority: 'New York City Department of Sanitation (DSNY)',
    authorityLevel: 'municipal',
    portalName: 'NYC DSNY "What to Recycle" Official Guidelines',
    sourceUrl: 'https://www.nyc.gov/assets/dsny/site/services/recycling/what-to-recycle',
    checkDate: '2026-10-10',
    locationKeywords: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island', '10001', '10002', '11201', '11211'],
    country: 'United States',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /rigid plastic/i, /metal can/i, /glass bottle/i, /aluminum/i, /beverage carton/i, /tetra pak/i],
    accepted: true,
    cleanConditions: ['Empty and rinse', 'Caps and lids can be left on'],
    instructions: 'Place in the Blue Bin (Metal, Glass, Rigid Plastics & Beverage Cartons). Rinse thoroughly.',
    explanation: 'DSNY collects rigid plastics, metals, glass, and cartons together in blue-labeled bins or clear bags.',
    binRecommendation: {
      name: 'Blue Bin (Metal, Glass & Rigid Plastics)',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Recycle all rigid plastics, metal cans, glass bottles, and milk/juice cartons in your blue bin or clear bag.',
  },
  {
    id: 'nyc-paper-cardboard',
    authority: 'New York City Department of Sanitation (DSNY)',
    authorityLevel: 'municipal',
    portalName: 'NYC DSNY "What to Recycle" Official Guidelines',
    sourceUrl: 'https://www.nyc.gov/assets/dsny/site/services/recycling/what-to-recycle',
    checkDate: '2026-10-10',
    locationKeywords: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island', '10001', '10002', '11201', '11211'],
    country: 'United States',
    materialPatterns: [/cardboard/i, /clean paper/i, /newspaper/i, /magazine/i, /corrugated/i],
    accepted: true,
    cleanConditions: ['Flatten boxes', 'Bundle securely or place in Green Bin', 'Free of food residue or heavy oil'],
    instructions: 'Flatten boxes and place in Green Bin (Mixed Paper & Cardboard) or tie in bundles with twine.',
    explanation: 'NYC separates fiber streams into Green Bins. Clean cardboard and mixed papers are recycled into recycled paperboard.',
    binRecommendation: {
      name: 'Green Bin (Paper & Cardboard)',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Flatten and tie cardboard in bundles up to 18 inches high, or place in a green-labeled bin.',
  },
  {
    id: 'nyc-plastic-bags-batteries',
    authority: 'New York City Department of Sanitation (DSNY)',
    authorityLevel: 'municipal',
    portalName: 'NYC DSNY Prohibited Items & Special Waste',
    sourceUrl: 'https://www.nyc.gov/assets/dsny/site/services/recycling/what-to-recycle',
    checkDate: '2026-10-10',
    locationKeywords: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island', '10001', '10002', '11201', '11211'],
    country: 'United States',
    materialPatterns: [/plastic bag/i, /film/i, /battery/i, /alkaline/i, /lithium/i],
    accepted: false,
    cleanConditions: ['Prohibited from curbside recycling by law'],
    instructions: 'REJECTED from all NYC curbside recycling bins. Plastic bags go to retail takeback. Batteries are prohibited from regular trash/recycling by NY State Law.',
    explanation: 'Plastic bags clog conveyor bearings at the Sims Municipal Recycling facility in Brooklyn. Batteries must go to NYC SAFE Disposal events or retail drop-offs.',
    binRecommendation: {
      name: 'Retail Drop-off / Special Waste Site',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    alternativeDropoff: 'NYC DSNY SAFE Disposal Events or electronics retailer takeback bins.',
    citationQuote: 'Do not put plastic bags or batteries in recycling. New York State law requires retailers with large stores to accept plastic bags for recycling.',
  },

  // ==========================================
  // 4. AUSTIN, TEXAS (Austin Resource Recovery)
  // ==========================================
  {
    id: 'austin-blue-cart-plastics',
    authority: 'Austin Resource Recovery (City of Austin)',
    authorityLevel: 'municipal',
    portalName: 'Austin Resource Recovery "What Goes in Your Blue Cart"',
    sourceUrl: 'https://www.austintexas.gov/department/what-goes-your-blue-cart',
    checkDate: '2026-10-12',
    locationKeywords: ['austin', '78701', '78702', '78703', '78704', '78705', '78712', '78751', 'travis county'],
    country: 'United States',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /plastic container/i, /aluminum can/i, /glass bottle/i],
    accepted: true,
    cleanConditions: ['Empty and rinse', 'Keep caps on plastic bottles'],
    instructions: 'Place in the Blue Curbside Cart. Items must be clean and dry.',
    explanation: 'Austin single-stream recycling accepts rigid plastics #1-#7, metal cans, and glass jars.',
    binRecommendation: {
      name: 'Austin Blue Cart',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Plastic bottles and containers, glass bottles, and metal cans can all be recycled in your blue cart.',
  },

  // ==========================================
  // 5. STANFORD UNIVERSITY (CAMPUS)
  // ==========================================
  {
    id: 'stanford-mixed-recycling',
    authority: 'Stanford Office of Sustainability / PSSI',
    authorityLevel: 'campus',
    portalName: 'Stanford Cardinal Green Waste Reduction Guidelines',
    sourceUrl: 'https://sustainable.stanford.edu/waste',
    checkDate: '2026-10-20',
    locationKeywords: ['stanford', 'stanford university', '94305', 'palo alto'],
    country: 'United States',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /can/i, /clean paper/i, /glass/i, /aluminum/i],
    accepted: true,
    cleanConditions: ['Empty liquids', 'Caps can remain on'],
    instructions: 'Place in Stanford Blue Mixed Recycling bins located across campus buildings and dorms.',
    explanation: 'Stanford Peninsula Sanitary Service Inc. (PSSI) collects single-stream mixed recyclables across all academic and residential buildings.',
    binRecommendation: {
      name: 'Stanford Blue Recycling Bin',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Stanford single-stream mixed recycling accepts clean plastic containers, paper, cardboard, and beverage cans.',
  },
  {
    id: 'stanford-batteries-ewaste',
    authority: 'Stanford Office of Sustainability / Environmental Health & Safety',
    authorityLevel: 'campus',
    portalName: 'Stanford E-Waste & Hazardous Battery Drop Guidelines',
    sourceUrl: 'https://sustainable.stanford.edu/waste',
    checkDate: '2026-10-20',
    locationKeywords: ['stanford', 'stanford university', '94305', 'palo alto'],
    country: 'United States',
    materialPatterns: [/battery/i, /alkaline/i, /lithium/i, /electronic/i, /cord/i],
    accepted: false,
    cleanConditions: ['Tape battery terminals if lithium'],
    instructions: 'REJECTED from hallway desk recycling bins. Drop into Stanford lobby battery recycling tubes or e-waste collection bins.',
    explanation: 'Batteries and electronics require specialized non-curbside recycling to recover precious metals and prevent compactor fires.',
    binRecommendation: {
      name: 'Stanford Battery Recycling Tube',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    alternativeDropoff: 'Battery recycling collection tubes located in dorm lobbies, Tresidder Union, and Stanford libraries.',
    citationQuote: 'Deposit used batteries into the designated battery recycling tubes located inside academic and residential buildings.',
  },

  // ==========================================
  // 6. CITY OF TORONTO (CANADA)
  // ==========================================
  {
    id: 'toronto-blue-bin-plastics',
    authority: 'City of Toronto Solid Waste Management Services',
    authorityLevel: 'municipal',
    portalName: 'Toronto Waste Wizard Official Search Tool',
    sourceUrl: 'https://www.toronto.ca/services-payments/recycling-organics-garbage/waste-wizard',
    checkDate: '2026-10-14',
    locationKeywords: ['toronto', 'm5v', 'm4w', 'm5s', 'ontario', 'gta'],
    country: 'Canada',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /clear plastic/i, /aluminum can/i, /glass bottle/i],
    accepted: true,
    cleanConditions: ['Empty and rinse', 'Put caps on tight'],
    instructions: 'Place in the Blue Bin (loose, not in plastic bags). Empty and rinse thoroughly.',
    explanation: 'Toronto accepts plastic bottles, jugs, jars, and metal cans in the Blue Bin. Items must be loose.',
    binRecommendation: {
      name: 'Toronto Blue Bin',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'Place plastic bottles and metal cans loose in your Blue Bin. Do not bag recyclables.',
  },
  {
    id: 'toronto-black-plastic',
    authority: 'City of Toronto Solid Waste Management Services',
    authorityLevel: 'municipal',
    portalName: 'Toronto Waste Wizard Official Search Tool',
    sourceUrl: 'https://www.toronto.ca/services-payments/recycling-organics-garbage/waste-wizard',
    checkDate: '2026-10-14',
    locationKeywords: ['toronto', 'm5v', 'm4w', 'm5s', 'ontario', 'gta'],
    country: 'Canada',
    materialPatterns: [/black plastic/i, /black takeout container/i],
    accepted: false,
    cleanConditions: ['Cannot be processed in recycling facilities'],
    instructions: 'REJECTED from Toronto Blue Bin. Optical sorting cameras use infrared reflection, which is absorbed by black carbon pigment. Place in Garbage.',
    explanation: 'Black plastic cannot be identified by the optical sorting equipment at Toronto materials recovery facilities, resulting in machine misdirection.',
    binRecommendation: {
      name: 'Black Garbage Bin',
      colorClass: 'text-error',
      bgClass: 'bg-error-container',
    },
    citationQuote: 'Black plastic of any kind goes in the garbage because optical sorting technology cannot identify it.',
  },

  // ==========================================
  // 7. LONDON (CITY OF WESTMINSTER / UK)
  // ==========================================
  {
    id: 'westminster-mixed-recycling',
    authority: 'Westminster City Council / Recycle for London',
    authorityLevel: 'municipal',
    portalName: 'Westminster Recycling and Rubbish Guide',
    sourceUrl: 'https://www.westminster.gov.uk/recycling-and-rubbish',
    checkDate: '2026-10-16',
    locationKeywords: ['london', 'westminster', 'sw1', 'w1', 'w2', 'ec1', 'greater london'],
    country: 'United Kingdom',
    materialPatterns: [/\bpet\b/i, /plastic bottle/i, /drink can/i, /food tin/i, /paper/i, /cardboard/i, /glass bottle/i],
    accepted: true,
    cleanConditions: ['Rinse containers clean', 'Flatten cardboard boxes'],
    instructions: 'Place in the Clear Recycling Bag or on-street Mixed Recycling Bin. Empty and wash.',
    explanation: 'Westminster collects dry mixed recyclables together: plastic bottles, food tins, drink cans, paper, glass, and card.',
    binRecommendation: {
      name: 'Westminster Clear Recycling Bag / On-Street Bin',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    },
    citationQuote: 'You can recycle paper, cardboard, plastic bottles, food tins, drink cans, and glass jars in your clear recycling bags.',
  },
];

/**
 * Normalizes string for fuzzy keyword containment
 */
function normalizeText(text?: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Core verification engine that evaluates authoritative municipal records
 */
export function verifyRecyclingRules(input: EcoVerifyInput): EcoVerifyEvidence {
  const normLoc = normalizeText(input.location);
  const normCountry = normalizeText(input.country);
  const normItem = normalizeText(input.itemName);
  const normMat = normalizeText(input.materialType);
  const normCond = normalizeText(input.condition);
  const itemAndMat = `${normItem} ${normMat} ${normalizeText(input.details)}`;

  // 1. Check if India is targeted by country or location keyword
  const isIndia =
    normCountry === 'india' ||
    /\b(india|bengaluru|bangalore|mumbai|bombay|delhi|new delhi|ranchi|kolkata|chennai|hyderabad|pune|ahmedabad|karnataka|maharashtra|jharkhand)\b/i.test(
      `${normLoc} ${normCountry}`
    );

  // 2. Locate relevant authority rule by matching country, location keywords, and material
  const matchedRules = AUTHORITATIVE_MUNICIPAL_RULES.filter((rule) => {
    // If country is specified, prevent cross-country rule matching
    if (normCountry) {
      const ruleCountry = normalizeText(rule.country);
      if (ruleCountry !== normCountry && !ruleCountry.includes(normCountry) && !normCountry.includes(ruleCountry)) {
        return false;
      }
    }

    // Check location keyword match
    const locMatch = rule.locationKeywords.some((kw) => normLoc.includes(kw) || kw.includes(normLoc));
    if (!locMatch) return false;

    // Check material pattern match
    const matMatch = rule.materialPatterns.some((pattern) => pattern.test(itemAndMat));
    return matMatch;
  });

  // 3. If a verified municipal rule matched
  if (matchedRules.length > 0) {
    const rule = matchedRules[0];

    // Check if item condition modifies status (e.g. food soiling on cardboard/pizza box)
    const isSoiled =
      normCond.includes('soiled') ||
      normCond.includes('grease') ||
      normCond.includes('food residue') ||
      normCond.includes('greasy') ||
      normCond.includes('heavy residue');

    const isHazardousBattery =
      normCond.includes('battery') ||
      normCond.includes('hazardous') ||
      normCond.includes('electronic') ||
      /battery|lithium|alkaline/i.test(itemAndMat);

    // Evaluate condition override for soiled paper
    if (isSoiled && rule.soiledStatus && /pizza box|cardboard|paper/i.test(itemAndMat)) {
      return {
        authority: rule.authority,
        authorityLevel: rule.authorityLevel,
        portalName: rule.portalName,
        sourceUrl: rule.sourceUrl,
        checkDate: rule.checkDate,
        status: rule.soiledStatus,
        headline: `REJECTED in Curbside Recycling — Soiled Condition Detected`,
        instructions: rule.soiledInstructions || rule.instructions,
        explanation: `${rule.explanation} Because this item is noted as soiled or greasy, it cannot be recycled into pulp and will contaminate the municipal stream.`,
        conditions: ['Must NOT be placed in curbside recycling cart', 'Direct to compost if organic composting is available'],
        limitationsNotes: 'Food and grease oils bind to cardboard fibers during pulping, rendering the slurry unprocessable.',
        binRecommendation: rule.soiledBin || {
          name: 'Compost / Landfill Bin',
          colorClass: 'text-error',
          bgClass: 'bg-error-container',
        },
        citationQuote: rule.citationQuote,
      };
    }

    // Battery safety override
    if (isHazardousBattery && /battery|alkaline|lithium/i.test(itemAndMat)) {
      return {
        authority: rule.authority,
        authorityLevel: rule.authorityLevel,
        portalName: rule.portalName,
        sourceUrl: rule.sourceUrl,
        checkDate: rule.checkDate,
        status: 'REJECTED',
        headline: 'REJECTED from Curbside Recycling — Hazardous Fire Risk',
        instructions: rule.instructions,
        explanation: `${rule.explanation} Batteries are strictly prohibited from curbside single-stream carts across all municipal programs due to dangerous compactor fires.`,
        conditions: ['Keep terminals taped', 'Bring to dedicated hazardous drop-off location only'],
        limitationsNotes: 'Mandatory safety regulation under city and state environmental ordinances.',
        binRecommendation: rule.binRecommendation,
        alternativeDropoff: rule.alternativeDropoff,
        citationQuote: rule.citationQuote,
      };
    }

    // Clean standard item evaluation
    const status = rule.accepted ? 'ACCEPTED' : 'REJECTED';
    const headline = rule.accepted
      ? `ACCEPTED in ${rule.authority} Recycling Service`
      : `REJECTED from ${rule.authority} Curbside Collection`;

    return {
      authority: rule.authority,
      authorityLevel: rule.authorityLevel,
      portalName: rule.portalName,
      sourceUrl: rule.sourceUrl,
      checkDate: rule.checkDate,
      status,
      headline,
      instructions: rule.instructions,
      explanation: rule.explanation,
      conditions: rule.cleanConditions,
      binRecommendation: rule.binRecommendation,
      alternativeDropoff: rule.alternativeDropoff,
      citationQuote: rule.citationQuote,
    };
  }

  // 4. Dedicated India Municipal Support (Honest UNVERIFIED with SWM 2016 & ULB Guidance)
  if (isIndia) {
    let authority = 'Urban Local Body (ULB) / CPCB';
    let portalName = 'Central Pollution Control Board (CPCB) - SWM Rules 2016';
    let sourceUrl = 'https://cpcb.nic.in/solid-waste-management-rules-2016/';
    let cityLabel = 'India';

    if (normLoc.includes('bengaluru') || normLoc.includes('bangalore') || normLoc.includes('karnataka')) {
      authority = 'Bruhat Bengaluru Mahanagara Palike (BBMP) / KSPCB';
      portalName = 'BBMP Solid Waste Management & Dry Waste Collection Portal';
      sourceUrl = 'https://bbmp.gov.in/';
      cityLabel = 'Bengaluru';
    } else if (normLoc.includes('mumbai') || normLoc.includes('bombay') || normLoc.includes('maharashtra')) {
      authority = 'Brihanmumbai Municipal Corporation (BMC / MCGM)';
      portalName = 'BMC Clean Mumbai Solid Waste Management Initiative';
      sourceUrl = 'https://www.mcgm.gov.in/';
      cityLabel = 'Mumbai';
    } else if (normLoc.includes('delhi') || normLoc.includes('ncr')) {
      authority = 'Municipal Corporation of Delhi (MCD)';
      portalName = 'MCD Solid Waste Management Citizen Portal';
      sourceUrl = 'https://mcdonline.nic.in/';
      cityLabel = 'Delhi';
    } else if (normLoc.includes('ranchi') || normLoc.includes('jharkhand')) {
      authority = 'Ranchi Municipal Corporation (RMC)';
      portalName = 'Ranchi Municipal Corporation Waste Management Cell';
      sourceUrl = 'https://ranchimunicipal.com/';
      cityLabel = 'Ranchi';
    } else if (input.location) {
      cityLabel = input.location;
    }

    const isHazardous =
      normCond.includes('battery') ||
      normCond.includes('hazardous') ||
      normCond.includes('electronic') ||
      /battery|lithium|alkaline|chemical|toxic|e-waste|cord|charger/i.test(itemAndMat);

    const isOrganic =
      normCond.includes('soiled') ||
      normCond.includes('food') ||
      /food|vegetable|fruit|compost|organic|peel|leaf|leftover/i.test(itemAndMat);

    let binRecommendation = {
      name: 'Blue Bin (Dry Recyclable Waste)',
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary-fixed/40',
    };

    if (isHazardous) {
      binRecommendation = {
        name: 'Red / Black Bin (Domestic Hazardous / E-Waste)',
        colorClass: 'text-error',
        bgClass: 'bg-error-container',
      };
    } else if (isOrganic) {
      binRecommendation = {
        name: 'Green Bin (Wet Biodegradable Waste)',
        colorClass: 'text-primary-container',
        bgClass: 'bg-primary-fixed',
      };
    }

    return {
      authority,
      authorityLevel: 'municipal',
      portalName,
      sourceUrl,
      checkDate: new Date().toISOString().slice(0, 10),
      status: 'UNVERIFIED',
      headline: `UNVERIFIED — Ward-Level Segregation Rules Required (${cityLabel})`,
      instructions: `Under India's Solid Waste Management Rules (2016), waste is segregated at source: Green Bin for Wet Waste, Blue Bin for Dry Recyclables, and Red/Black Bin for Domestic Hazardous Waste. Please verify with your local ward collection agent or Dry Waste Collection Centre (DWCC) for "${input.itemName}".`,
      explanation: `Municipal corporations in India operate on ward-level source segregation and local recovery networks rather than automated single-stream sorting. Reliable itemized municipal rules for "${input.location}" are not yet indexed in our verification registry.`,
      conditions: [
        'Segregate into Green (wet), Blue (dry), or Red/Black (hazardous) bin at source',
        'Ensure dry recyclables are clean, rinsed, and free of food slurry',
        'Direct bulk dry recyclables to your ward Dry Waste Collection Centre (DWCC) or registered scrap collector',
        'Hand over batteries and e-waste only to authorized electronic waste take-back centers',
      ],
      limitationsNotes: 'SWM Rules 2016 mandate 100% source segregation. Doorstep collection routines vary by ward and municipal contractor.',
      binRecommendation,
      citationQuote: 'Solid Waste Management Rules 2016, Rule 4(1): Waste generators shall segregate waste into biodegradable, dry recyclables, and domestic hazardous streams.',
    };
  }

  // 5. Fallback when location is recognized in registry but material is not indexed
  const locationKnown = AUTHORITATIVE_MUNICIPAL_RULES.find((r) => {
    if (normCountry) {
      const ruleCountry = normalizeText(r.country);
      if (ruleCountry !== normCountry && !ruleCountry.includes(normCountry) && !normCountry.includes(ruleCountry)) {
        return false;
      }
    }
    return r.locationKeywords.some((kw) => normLoc.includes(kw) || kw.includes(normLoc));
  });

  if (locationKnown) {
    return {
      authority: locationKnown.authority,
      authorityLevel: locationKnown.authorityLevel,
      portalName: locationKnown.portalName,
      sourceUrl: locationKnown.sourceUrl,
      checkDate: locationKnown.checkDate,
      status: 'UNVERIFIED',
      headline: `UNVERIFIED — Material Not Cataloged in ${locationKnown.authority} Official Guidelines`,
      instructions: `Please consult the official ${locationKnown.authority} portal or contact your local hauler before placing '${input.itemName}' in your recycling bin.`,
      explanation: `While ${locationKnown.authority} is a recognized service provider in our registry, specific acceptance criteria for '${input.itemName}' (${input.materialType}) could not be authoritatively confirmed.`,
      conditions: ['Check official municipal portal directly', 'Do not place in recycling bin if unsure'],
      limitationsNotes: 'Avoid wishcycling: placing unverified composite materials in recycling carts risks batch contamination.',
      citationQuote: `Visit ${locationKnown.portalName} for itemized waste queries.`,
    };
  }

  // 6. Honest Fallback when location is unindexed / outside known authority registries
  return {
    authority: 'Unverified Regional Authority',
    authorityLevel: 'unverified',
    portalName: 'Earth911 National Recycling & Waste Search Directory',
    sourceUrl: 'https://search.earth911.com/',
    checkDate: new Date().toISOString().slice(0, 10),
    status: 'UNVERIFIED',
    headline: `UNVERIFIED — No Verified Municipal Dataset for "${input.location || 'Unknown Location'}"`,
    instructions: `We do not have a verified municipal recycling database entry for "${input.location}". Recycling guidelines vary by county, city, and contract hauler.`,
    explanation: `To prevent wishcycling and avoid contamination penalties, WasteWise strictly defaults to UNVERIFIED when authoritative municipal documentation is inaccessible or unindexed.`,
    conditions: [
      'Locate your local municipal waste hauler rules',
      'Search via Earth911 or your city council recycling directory',
      'Do not place in curbside bin unless explicitly confirmed by your local authority',
    ],
    limitationsNotes: 'Curbside recycling capabilities are geographically localized. Optical AI material recognition cannot guarantee local hauler acceptance.',
    citationQuote: 'Please verify with your local recycling authority or transfer station directly.',
  };
}
