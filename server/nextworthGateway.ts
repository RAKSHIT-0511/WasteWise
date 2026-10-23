import type { IncomingMessage, ServerResponse } from 'http';

export type NextWorthActionType = 'reuse' | 'repair' | 'donate' | 'resell' | 'upcycle' | 'recycle';

export interface NextWorthActionStep {
  title: string;
  actionType: NextWorthActionType;
  badge: string;
  summary: string;
  reason: string;
  checklist: string[];
  localTips?: string;
}

export interface NextWorthRecommendation {
  itemName: string;
  category: string;
  condition: string;
  bestNextStep: NextWorthActionStep;
  otherOptions: NextWorthActionStep[];
  conditionNote: string;
  disclaimer: string;
  source: 'ai_model' | 'circular_rule_engine';
  generatedAt: string;
}

const NEXTWORTH_DISCLAIMER =
  'Recommendations are practical guidance based on general material hierarchy. Acceptance, pricing, and donation suitability vary by item condition and local organizations. No specific buyer, price, or charity acceptance is guaranteed.';

// Rule-based circular hierarchy knowledge engine
export function getNextWorthRuleRecommendation(
  itemName: string,
  category = 'General',
  condition = 'Good / gently used'
): NextWorthRecommendation {
  const normItem = itemName.toLowerCase();
  const normCat = category.toLowerCase();
  const normCond = condition.toLowerCase();

  const isWornOrDamaged = normCond.includes('repair') || normCond.includes('damaged') || normCond.includes('torn') || normCond.includes('broken');

  // 1. Textiles & Clothing
  if (normItem.includes('shirt') || normItem.includes('jean') || normItem.includes('pant') || normItem.includes('cloth') || normItem.includes('jacket') || normItem.includes('shoe') || normCat.includes('cloth') || normCat.includes('textile')) {
    if (isWornOrDamaged) {
      return {
        itemName,
        category: 'Clothing & Textiles',
        condition,
        bestNextStep: {
          title: 'Turn into Multipurpose Cleaning Cloths or Upcycle',
          actionType: 'upcycle',
          badge: 'Upcycle at Home',
          summary: 'Repurpose worn fabric into durable household dusters, cleaning rags, or craft patches.',
          reason: 'Damaged or torn textiles are not accepted by most wearable clothing charities and cause sorting rejections.',
          checklist: [
            'Cut away buttons, zippers, and hard metal rivets for separate reuse.',
            'Slice fabric into convenient hand-sized squares (approx. 20cm x 20cm).',
            'Wash in hot water with mild detergent before initial cleaning use.',
            'Store in a handy cleaning bucket for kitchen counters, bike chains, or car care.',
          ],
        },
        otherOptions: [
          {
            title: 'Repair or Visible Mending',
            actionType: 'repair',
            badge: 'Creative Mending',
            summary: 'Sew small tears using sashiko stitching, iron-on patches, or simple needle and thread.',
            reason: 'Extends garment lifespan and keeps high-energy synthetic or cotton blends in active use.',
            checklist: ['Assess tear direction and secure loose threads.', 'Select matching embroidery floss or sturdy denim patch.'],
          },
          {
            title: 'Dedicated Textile Recycling Drop-off',
            actionType: 'recycle',
            badge: 'Textile Drop-off',
            summary: 'Take unwearable fabrics to municipal textile bank or clothing brand take-back bin.',
            reason: 'Shredded by specialized processors into industrial insulation or acoustic padding.',
            checklist: ['Ensure fabric is clean and 100% dry to prevent mold.', 'Bundle in a clear bag and deposit at a designated retail take-back container.'],
          },
        ],
        conditionNote: 'Item is flagged as damaged/torn. Prioritize home repurposing over donation.',
        disclaimer: NEXTWORTH_DISCLAIMER,
        source: 'circular_rule_engine',
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      itemName,
      category: 'Clothing & Textiles',
      condition,
      bestNextStep: {
        title: 'Donate to Local Shelter or Community Thrift',
        actionType: 'donate',
        badge: 'Donate Wearable',
        summary: 'Pass wearable clothing directly to community centers, shelters, or charity thrift shops.',
        reason: 'Clean wearable clothing has immediate utility and helps local families without generating new manufacturing emissions.',
        checklist: [
          'Wash and completely dry the garment before packaging.',
          'Check that all buttons, snaps, and working zippers are present.',
          'Fold neatly into a clean bag or reusable tote.',
          'Drop off during official donation hours at your nearest community center or thrift partner.',
        ],
      },
      otherOptions: [
        {
          title: 'Resell on Peer-to-Peer Secondhand Platforms',
          actionType: 'resell',
          badge: 'Resell',
          summary: 'Sell branded or quality vintage items on local marketplace apps or consignment stores.',
          reason: 'Recovers monetary value while keeping quality apparel out of the waste stream.',
          checklist: ['Take bright photos showing label and collar condition.', 'Describe measurements and material composition accurately.'],
        },
        {
          title: 'Organize a Community Clothes Swap',
          actionType: 'reuse',
          badge: 'Swap with Friends',
          summary: 'Trade gently worn items with friends, colleagues, or neighborhood swap events.',
          reason: 'Zero-cost wardrobe refresh with zero packaging or shipping footprint.',
          checklist: ['Set aside 3-5 clean items.', 'Bring friends together to exchange items of equal value.'],
        },
      ],
      conditionNote: 'Item is in good wearable condition. Clean and dry before donating or swapping.',
      disclaimer: NEXTWORTH_DISCLAIMER,
      source: 'circular_rule_engine',
      generatedAt: new Date().toISOString(),
    };
  }

  // 2. Electronics & Gadgets
  if (normItem.includes('phone') || normItem.includes('laptop') || normItem.includes('cable') || normItem.includes('charger') || normItem.includes('tablet') || normItem.includes('gadget') || normCat.includes('electronic')) {
    if (isWornOrDamaged) {
      return {
        itemName,
        category: 'Electronics & Gadgets',
        condition,
        bestNextStep: {
          title: 'Repair via Local Repair Café or Fix-It Clinic',
          actionType: 'repair',
          badge: 'Repair / Fix',
          summary: 'Check if battery, loose port, or simple component swap restores full functionality.',
          reason: 'Manufacturing electronic hardware accounts for up to 80% of its lifetime carbon footprint.',
          checklist: [
            'Inspect port contacts for lint or physical corrosion before spending money.',
            'Search online open-source repair guides (e.g. iFixit) for your specific model.',
            'Visit a free community repair café or certified independent electronics technician.',
          ],
        },
        otherOptions: [
          {
            title: 'Authorized E-Waste Collection Facility',
            actionType: 'recycle',
            badge: 'Safe E-Waste Recycling',
            summary: 'Drop off at authorized municipal e-waste depot or electronics retailer take-back.',
            reason: 'Recovers critical precious metals (gold, copper, lithium) and prevents hazardous heavy metal landfill contamination.',
            checklist: ['Back up and factory-reset device to wipe personal data.', 'Remove external rechargeable batteries if detachable.'],
          },
        ],
        conditionNote: 'Hardware is reported as faulty or damaged. Factory wipe data before disposal.',
        disclaimer: NEXTWORTH_DISCLAIMER,
        source: 'circular_rule_engine',
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      itemName,
      category: 'Electronics & Gadgets',
      condition,
      bestNextStep: {
        title: 'Donate to School, Student or Digital Inclusion Program',
        actionType: 'donate',
        badge: 'Digital Inclusion',
        summary: 'Working devices can bridge digital inequality for students and non-profit community labs.',
        reason: 'Functional technology continues providing education and communication value for years.',
        checklist: [
          'Back up essential personal files and photographs to cloud or external drive.',
          'Perform a full factory reset and sign out of Apple/Google/Microsoft accounts.',
          'Include compatible charging cable and power adapter if available.',
        ],
      },
      otherOptions: [
        {
          title: 'Trade-in or Resell Online',
          actionType: 'resell',
          badge: 'Trade-in Credit',
          summary: 'Exchange for manufacturer credit or sell on verified refurbished tech marketplaces.',
          reason: 'Extends device lifecycle through certified second owners.',
          checklist: ['Clean exterior with microfiber cloth and 70% isopropyl alcohol.', 'Take clear photos showing screen without cracks.'],
        },
      ],
      conditionNote: 'Working electronic item. Ensure complete data erase before handing off.',
      disclaimer: NEXTWORTH_DISCLAIMER,
      source: 'circular_rule_engine',
      generatedAt: new Date().toISOString(),
    };
  }

  // 3. Glass Jars, Bottles & Rigid Containers
  if (normItem.includes('jar') || normItem.includes('bottle') || normItem.includes('canister') || normItem.includes('tub') || normCat.includes('glass') || normCat.includes('container')) {
    return {
      itemName,
      category: 'Containers & Glassware',
      condition,
      bestNextStep: {
        title: 'Reuse for Pantry Bulk Storage or Homemade Preserves',
        actionType: 'reuse',
        badge: 'Pantry Reuse',
        summary: 'Clean, remove the label, and use for bulk grains, spices, pickling, or desk organization.',
        reason: 'Glass is 100% non-porous and food-safe indefinitely, eliminating the need to buy single-use storage containers.',
        checklist: [
          'Soak container in warm water with baking soda to peel paper label cleanly.',
          'Wash container and lid with warm soapy water or run through dishwasher.',
          'Air dry completely before filling with spices, nuts, lentils, or stationery items.',
        ],
      },
      otherOptions: [
        {
          title: 'Plant Propagation & Window Gardening',
          actionType: 'upcycle',
          badge: 'Green Upcycle',
          summary: 'Fill with water to root indoor plant cuttings (pothos, herbs, monstera) on windowsills.',
          reason: 'Beautiful zero-cost green decor that promotes plant growth.',
          checklist: ['Fill 3/4 with tap water.', 'Place healthy plant cutting stem in water and leave in indirect sunlight.'],
        },
        {
          title: 'Curbside Municipal Glass / Blue Bin Recycling',
          actionType: 'recycle',
          badge: 'Curbside Recycle',
          summary: 'Deposit clean glass jar into your local curbside glass or mixed recycling stream.',
          reason: 'Glass can be melted down and re-cast infinitely with zero loss in quality or purity.',
          checklist: ['Empty and quick rinse.', 'Verify if local program accepts caps on or requires cap separation.'],
        },
      ],
      conditionNote: 'Durable container suitable for infinite home reuse or standard curbside recycling.',
      disclaimer: NEXTWORTH_DISCLAIMER,
      source: 'circular_rule_engine',
      generatedAt: new Date().toISOString(),
    };
  }

  // 4. Books, Toys, Games & Media
  if (normItem.includes('book') || normItem.includes('toy') || normItem.includes('puzzle') || normItem.includes('board game') || normCat.includes('book') || normCat.includes('toy')) {
    return {
      itemName,
      category: 'Books, Toys & Games',
      condition,
      bestNextStep: {
        title: 'Donate to Community Library, Hospital or Youth Center',
        actionType: 'donate',
        badge: 'Community Sharing',
        summary: 'Give books and complete toy sets to public libraries, free neighborhood book boxes, or family clinics.',
        reason: 'Books and educational toys have exceptionally long usable lifespans across multiple readers and children.',
        checklist: [
          'Inspect pages or toy parts to confirm all vital pieces are intact.',
          'Wipe hard plastic or board surfaces with a clean damp cloth.',
          'Drop off at your neighborhood Little Free Library or community center shelf.',
        ],
      },
      otherOptions: [
        {
          title: 'Organize a Neighborhood Book or Toy Exchange',
          actionType: 'reuse',
          badge: 'Swap Shelf',
          summary: 'Swap stories or games with neighbors or classmates.',
          reason: 'Encourages circular community culture without purchasing new items.',
          checklist: ['Gather friends for an afternoon book swap.'],
        },
        {
          title: 'Paper Pulp Recycling (For Damaged Books Only)',
          actionType: 'recycle',
          badge: 'Paper Pulp',
          summary: 'If pages are severely mildewed or water-damaged, recycle through paper recycling.',
          reason: 'Cellulose fibers can be recovered for cardboard or newsprint.',
          checklist: ['Remove hardcover binding if glued with heavy synthetic cloth.'],
        },
      ],
      conditionNote: 'Prioritize reading and playing longevity before discarding paper materials.',
      disclaimer: NEXTWORTH_DISCLAIMER,
      source: 'circular_rule_engine',
      generatedAt: new Date().toISOString(),
    };
  }

  // 5. General Fallback
  return {
    itemName,
    category: category || 'General Household Item',
    condition,
    bestNextStep: {
      title: 'Inspect for Community Reuse or Repair Opportunity',
      actionType: isWornOrDamaged ? 'repair' : 'reuse',
      badge: isWornOrDamaged ? 'Repair First' : 'Repurpose',
      summary: isWornOrDamaged
        ? 'Check if minor repair or replacement hardware restores full usability.'
        : 'Find an alternative functional use in your home, workshop, or garden before disposing.',
      reason: 'Extending product life by even 9 months reduces carbon and waste footprints by 20% to 30%.',
      checklist: [
        'Check if any local neighborhood sharing group (e.g. Freecycle, Buy Nothing) needs this item.',
        'If clean and functioning, place in community share box or donate to a local charity.',
        'If broken beyond repair, check EcoVerify to ensure material reaches the correct municipal recovery bin.',
      ],
    },
    otherOptions: [
      {
        title: 'Check Municipal Recycling via EcoVerify',
        actionType: 'recycle',
        badge: 'Verify Recycling',
        summary: 'Look up your specific city municipal rules to confirm whether this material is accepted curbside.',
        reason: 'Prevents landfill disposal and avoids equipment tanglers at sorting facilities.',
        checklist: ['Clean residue.', 'Check local bin rules in EcoVerify.'],
      },
    ],
    conditionNote: `Evaluated based on condition: "${condition}". Local acceptance rules apply.`,
    disclaimer: NEXTWORTH_DISCLAIMER,
    source: 'circular_rule_engine',
    generatedAt: new Date().toISOString(),
  };
}

// Server gateway handler
export async function handleNextWorth(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  let bodyStr = '';
  for await (const chunk of req) {
    bodyStr += chunk;
    if (bodyStr.length > 256 * 1024) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Payload exceeds 256KB limit.' }));
      return;
    }
  }

  let body: { itemName?: string; category?: string; condition?: string; imageBase64?: string };
  try {
    body = JSON.parse(bodyStr);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
    return;
  }

  const itemName = (body.itemName || '').trim();
  const category = (body.category || 'General').trim();
  const condition = (body.condition || 'Good / gently used').trim();

  if (!itemName) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Item name is required.' }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

  // If AI API key is configured, attempt model generation
  if (apiKey && apiKey.length > 0) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const prompt = `You are NextWorth, an environmental circular economy assistant.
Analyze this item: "${itemName}" (Category: "${category}", Condition: "${condition}").
Suggest practical, honest ways to give it a second life (reuse, repair, donate, resell, or recycle).
Do NOT invent buyers, prices, or guaranteed donation centres.
Respond with ONLY raw JSON matching this schema:
{
  "bestNextStep": {
    "title": "Clear action title",
    "actionType": "reuse" | "repair" | "donate" | "resell" | "upcycle" | "recycle",
    "badge": "Short badge (e.g. Donate Wearable, Upcycle at Home)",
    "summary": "1-2 sentence explanation",
    "reason": "Why this is the best next step environmentally",
    "checklist": ["step 1", "step 2", "step 3"]
  },
  "otherOptions": [
    {
      "title": "Alternative option",
      "actionType": "reuse" | "repair" | "donate" | "resell" | "upcycle" | "recycle",
      "badge": "Short badge",
      "summary": "1 sentence explanation",
      "reason": "Environmental reason",
      "checklist": ["step 1", "step 2"]
    }
  ],
  "conditionNote": "Note regarding item condition and local availability dependencies"
}`;

      const aiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const parts = aiData.candidates?.[0]?.content?.parts || [];
        const answerPart = parts.find((p: { thought?: boolean }) => !p.thought) || parts[parts.length - 1];
        const text = answerPart?.text;

        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.bestNextStep && Array.isArray(parsed.otherOptions)) {
            const recommendation: NextWorthRecommendation = {
              itemName,
              category,
              condition,
              bestNextStep: parsed.bestNextStep,
              otherOptions: parsed.otherOptions.slice(0, 3),
              conditionNote: parsed.conditionNote || `Recommendation depends on ${condition.toLowerCase()} condition.`,
              disclaimer: NEXTWORTH_DISCLAIMER,
              source: 'ai_model',
              generatedAt: new Date().toISOString(),
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: recommendation }));
            return;
          }
        }
      }
    } catch {
      // Fallback gracefully to rule engine if AI call fails or throttles
    }
  }

  // Graceful rule-based fallback
  const fallbackRec = getNextWorthRuleRecommendation(itemName, category, condition);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true, data: fallbackRec }));
}
