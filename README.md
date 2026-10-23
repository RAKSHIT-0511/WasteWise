# WasteWise — AI-Powered Circular Recycling Platform

WasteWise is a responsive web application designed for campus and community waste diversion, combining tactile modernism and precision ecological intelligence.

---

## Gemma Model Integration

This section documents the verified AI model architecture and execution pathway for project evaluation.

### 1. Verified Model & Provider
*   **Exact Model ID**: `gemma-4-26b-a4b-it`
*   **Provider & Gateway**: **Google Gemini API** (Google Generative Language API `v1beta`)
*   **API Endpoint**:
    ```text
    POST https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${GEMINI_API_KEY}
    ```
*   **Multimodal Capability**: Confirmed to support visual image input (`inlineData` base64 payload) with structured JSON generation (`generationConfig.responseMimeType: "application/json"`).

### 2. Feature Powered by Gemma
*   **MatterLens (Feature 1)**: AI optical waste identification and material analysis.
*   **Execution Policy**: The model ID is configured centrally via `GEMMA_MODEL` in `.env` (defaulting to `gemma-4-26b-a4b-it`). It is **strictly enforced** and never silently replaced by Gemini Flash or other models during MatterLens analysis.

### 3. Request & Verification Flow
```
[User Camera / File Input]
          │
          ▼
[MatterLens Client (Browser)]
  • Validates client-side file size (< 5MB) and MIME type
  • Renders preview & radar HUD
  • NEVER has access to API credentials
          │
          ▼  POST /api/matterlens/identify (JSON base64)
[Secure Vite Server Middleware]
  • Validates payload size (< 6MB)
  • Inspects magic bytes (PNG, JPEG, WebP, GIF)
  • Injects server-side GEMINI_API_KEY from environment
          │
          ▼  POST /v1beta/models/gemma-4-26b-a4b-it:generateContent
[Google Gemini API / Gemma 4 Engine]
  • Processes image features and internal reasoning
  • Produces structured JSON classification
          │
          ▼
[Server Validation & Parser]
  • Extracts JSON block, filtering thought tokens
  • Validates schema & clamps visual confidence
  • Attaches EcoVerify scope disclaimer
          │
          ▼
[MatterLens UI Result Card]
  • Displays item name, material, contamination, handling advice, reasoning
  • Shows dynamic attribution: "AI model: Gemma gemma-4-26b-a4b-it · Google Gemini API"
```

### 4. Required Environment Variables
Configure these in a local `.env` file at the project root. **Never commit actual API keys.**

```env
# Google Gemini API key with access to Generative Language models
GEMINI_API_KEY=your_gemini_api_key_here

# Centrally configured Gemma model identifier
GEMMA_MODEL=gemma-4-26b-a4b-it
```

### 5. Setup & Repeatable Inference Test
To run the live integration test proving that a real Gemma model processes visual input through the Gemini API:

```bash
# Install dependencies
npm install

# Run the repeatable Gemma inference verification script
npm run test:gemma
```

### 6. Sample Request and Redacted Response

#### Sample Request Payload (Server Gateway to Gemini API):
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "You are MatterLens, an optical waste material identification AI. Return a strictly valid JSON response adhering to this schema: {\"itemName\": \"...\", \"materialType\": \"...\", \"category\": \"...\", \"visibleContamination\": \"...\", \"preparationAdvice\": \"...\", \"reasoning\": \"...\", \"uncertaintyNotes\": \"...\", \"modelReportedConfidence\": 0.95}"
        },
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": "<BASE64_IMAGE_DATA_REDACTED>"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```

#### Verified Response Received from `gemma-4-26b-a4b-it`:
```json
{
  "itemName": "Water Bottle",
  "materialType": "PET Plastic #1",
  "category": "Plastic",
  "visibleContamination": "Appears clean and empty; no visible food residue or significant liquids.",
  "preparationAdvice": "Rinse thoroughly and crush to save volume.",
  "reasoning": "Transparency of the material, standard beverage container shape, and explicit identification within the interface overlay as PET.",
  "uncertaintyNotes": "The image is a demonstration mockup within a UI, which may affect the realism of the scan; the label text is partially obscured by the application graphics.",
  "modelReportedConfidence": 0.98,
  "confidenceTier": "high",
  "isUncertain": false,
  "disclaimer": "MatterLens performs optical material identification only. Local municipal recycling acceptance and bin rules are verified by EcoVerify.",
  "modelUsed": "gemma-4-26b-a4b-it",
  "timestamp": "2026-10-23T07:19:53.317Z"
}
```

### 7. Feature Status Matrix

| Feature | Status | Engine / Tech | Description |
| :--- | :--- | :--- | :--- |
| **1. MatterLens** | **Active & Verified** | **Gemma 4 (`gemma-4-26b-a4b-it`) via Gemini API** | Live camera and image optical identification and material breakdown. |
| **2. EcoVerify** | **Active & Verified** | **Municipal Rules Engine & Indian PIN Lookup** | Local recycling verification isolated by municipality and 6-digit PIN code. |
| **3. NextWorth** | **Active & Verified** | **Circular Hierarchy Engine & AI Gateway** | Practical pathways to reuse, repair, donate, sell, compost, or recycle. |
| **4. LoopTrace** | **Active & Verified** | **Personal Diversion Ledger & Database Schema** | Activity timeline tracking items reused, repaired, donated, resold, and recycled with genuine metrics. |

---

## Getting Started

```bash
# Start local development server
npm run dev

# Run unit tests (native Node test runner)
npm test

# Run Gemma API verification test
npm run test:gemma

# Build production bundle
npm run build
```

---

## Security & Privacy Guarantees
- **No Client Credential Exposure**: `GEMINI_API_KEY` is loaded strictly on the server-side Vite gateway and is never bundled in frontend assets.
- **Server-Side Validation**: Magic byte inspection prevents arbitrary file type spoofing.
- **Scope Demarcation**: Optical material classification is clearly separated from municipal recycling validation (EcoVerify).
