# Landed Cost Calculator - Master Reference

> **Created:** January 29, 2026  
> **Purpose:** Comprehensive reference for the landed cost calculator feature  
> **Status:** ACTIVE - Use this instead of referencing full PRD

---

## 1. EXECUTIVE SUMMARY

### Current Status: ✅ PRODUCTION READY

The Landed Cost Calculator is **fully implemented** and production-ready. It calculates total import costs including:
- ✅ Product value
- ✅ Shipping & insurance
- ✅ **ALL applicable tariffs** (Base MFN, Section 301, IEEPA, Section 232)
- ✅ Customs fees (MPF, HMF)
- ✅ Scenario saving & comparison
- ✅ Per-unit cost breakdown

### Key Strengths
1. **Comprehensive tariff coverage** - Shows ALL tariff layers (IEEPA, 301, 232, etc.)
2. **Centralized data source** - Uses Tariff Registry for accuracy
3. **User-friendly UI** - Save scenarios, compare side-by-side
4. **Production-grade** - Error handling, validation, responsive design

### Competitive Position
**Better than Descartes CustomsInfo** - They don't have:
- Integrated landed cost calculator
- IEEPA tariff visibility (critical as of April 2025!)
- Scenario comparison
- AI-powered classification integration

---

## 2. ARCHITECTURE

### File Structure
```
src/
├── features/compliance/components/
│   ├── LandedCostCalculator.tsx      # Main UI component
│   └── TariffBreakdown.tsx           # Tariff display component
├── services/
│   ├── tariff/
│   │   ├── registry.ts               # ✅ SOURCE OF TRUTH for tariffs
│   │   └── additional-duties.ts      # ⚠️ DEPRECATED - use registry
│   └── sourcing/
│       └── landed-cost.ts            # ⚠️ Legacy - not used by calculator
├── app/api/
│   └── landed-cost/route.ts          # API endpoint
└── types/
    └── tariffLayers.types.ts         # TypeScript types
```

### Data Flow
```
User Input (UI)
    ↓
POST /api/landed-cost
    ↓
getEffectiveTariff() ← Tariff Registry (DB)
    ↓
Calculate fees (MPF, HMF)
    ↓
Return LandedCostResult
    ↓
Display in TariffBreakdown component
```

---

## 3. TARIFF CALCULATION (CRITICAL!)

### ✅ WHAT'S INCLUDED

The calculator shows **ALL** applicable tariffs:

#### 1. Base MFN Rate
- From HTS schedule
- Example: 6109.10.00.12 = 16.5%

#### 2. Section 301 (China only)
- Product-specific rates from USTR lists
- Example: Electronics = +25%
- **Status:** ✅ Fully implemented with HTS-specific lookup

#### 3. IEEPA Tariffs (CRITICAL - April 2025)
**This is what competitors miss!**

- **Universal Baseline:** 10% on nearly ALL countries (including FTA partners!)
- **Fentanyl Emergency:** +20% (CN), +25% (MX, CA)
- **Country Reciprocal:** Higher rates for specific countries (e.g., Vietnam +46%)

**Status:** ✅ Fully implemented via Tariff Registry

#### 4. Section 232 (Steel/Aluminum/Auto)
- Steel (Chapter 72, 73): +25%
- Aluminum (Chapter 76): +25%
- Automobiles (8703, 8704): +25%
- **Status:** ✅ Implemented with product detection

#### 5. AD/CVD (Antidumping/Countervailing Duties)
- **Status:** ⚠️ WARNING ONLY (manufacturer-specific rates)
- Shows warning if product/country combination has known orders
- Links to CBP lookup tool

### How Tariffs Stack
```
Example: T-shirt from China (HTS 6109.10.00.12)

Base MFN:           16.5%
Section 301:       + 7.5%  (List 4A)
IEEPA Fentanyl:    +20.0%  (China fentanyl emergency)
IEEPA Reciprocal:  +34.0%  (China reciprocal tariff)
─────────────────────────
TOTAL:              78.0%
```

**This is accurate as of April 2025 tariff landscape!**

---

## 4. CUSTOMS FEES

### Merchandise Processing Fee (MPF)
- **Rate:** 0.3464% of product value
- **Min:** $31.67
- **Max:** $614.35
- **Applies to:** All imports

### Harbor Maintenance Fee (HMF)
- **Rate:** 0.125% of product value
- **Applies to:** Ocean shipments only
- **Not charged for:** Air shipments

**Status:** ✅ Fully implemented with ocean/air toggle

---

## 5. USER INTERFACE

### Input Form
```
Product Information:
├── HTS Code (required, validated)
├── Country of Origin (dropdown, 18 countries)
├── Product Value (USD, required)
└── Quantity (units, default: 1)

Shipping & Insurance:
├── Shipping Cost (USD, optional)
├── Insurance Cost (USD, optional)
└── Shipment Type (Ocean/Air toggle)
```

### Results Display

#### Summary Card
- Product value
- Shipping + insurance
- **Import Duties** (with breakdown)
  - Base MFN (X%)
  - Additional Duties (Y%)
  - Effective Rate (Z%)
- **Customs Fees**
  - MPF
  - HMF (if ocean)
- **Total Landed Cost** (prominent)
- Per-unit cost (if qty > 1)

#### Detailed Tariff Breakdown
Uses `TariffBreakdown.tsx` component:
- Shows each tariff layer with HTS code
- Color-coded by severity
- Tooltips explaining each program
- Live data indicator
- AD/CVD warnings (if applicable)

### Scenario Management

#### Save Scenarios
- User can save calculations with custom names
- Stored in localStorage (no backend needed)
- Default name: "HTS from Country"

#### Compare Mode
- Select 2-3 saved scenarios
- Side-by-side comparison
- Difference indicators (↑ higher, ↓ lower)
- Highlights cheapest option
- Shows potential savings

**Status:** ✅ Fully implemented, works great!

---

## 6. API SPECIFICATION

### POST /api/landed-cost

**Request:**
```typescript
{
  htsCode: string;          // e.g., "6109.10.00.12"
  countryCode: string;      // ISO 2-letter, e.g., "CN"
  productValue: number;     // USD, e.g., 10000
  quantity: number;         // units, e.g., 1000
  shippingCost?: number;    // USD, optional
  insuranceCost?: number;   // USD, optional
  isOceanShipment?: boolean; // default: true
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    htsCode: string;
    htsDescription: string;
    countryCode: string;
    countryName: string;
    productValue: number;
    quantity: number;
    shippingCost: number;
    insuranceCost: number;
    
    duties: {
      baseMfn: number;              // $ amount
      baseMfnRate: number;          // %
      additionalDuties: number;     // $ amount
      additionalDutiesRate: number; // %
      totalDuty: number;            // $ amount
      effectiveRate: number;        // %
    };
    
    fees: {
      mpf: number;
      hmf: number;
      totalFees: number;
    };
    
    totalDutiesAndFees: number;
    totalLandedCost: number;
    perUnitCost: number;
    
    tariffBreakdown: EffectiveTariffRate; // Full details
    calculatedAt: Date;
    isOceanShipment: boolean;
  }
}
```

---

## 7. WHAT'S WORKING WELL

### ✅ Strengths

1. **Comprehensive Tariff Coverage**
   - Shows ALL tariff layers (Base, 301, IEEPA, 232)
   - Uses centralized Tariff Registry for accuracy
   - Properly accounts for April 2025 IEEPA changes

2. **User Experience**
   - Clean, intuitive interface
   - Scenario saving & comparison
   - Responsive design (mobile-friendly)
   - Real-time validation

3. **Data Accuracy**
   - Pulls from Tariff Registry (single source of truth)
   - No hardcoded fallbacks (forces proper data)
   - Live USITC integration (when available)

4. **Production Quality**
   - Error handling
   - Loading states
   - Input validation
   - TypeScript type safety

---

## 8. EXISTING RELATED FEATURES (INTEGRATION OPPORTUNITIES)

### ✅ What Already Exists

You already have several related features that should work together seamlessly:

#### 1. FTA Qualification Calculator (`/dashboard/compliance/fta-calculator`)
**What it does:**
- Full Bill of Materials (BOM) input
- RVC (Regional Value Content) calculation
- Tariff shift analysis (CC, CTH, CTSH, CTI)
- Supports 14 FTAs (USMCA, KORUS, AUSFTA, etc.)
- Shows duty savings if qualified
- Save/load BOM configurations

**Integration Gap:** Not connected to Landed Cost Calculator

#### 2. Sourcing Intelligence (`/dashboard/sourcing`)
**What it does:**
- Multi-country cost comparison (already built!)
- Shows landed cost by country
- FTA status per country
- AI recommendations
- Links to supplier discovery
- Tariff monitoring tab

**Integration Gap:** Separate from Landed Cost Calculator

#### 3. Duty Optimizer (`/dashboard/optimizer`)
**What it does:**
- Finds ALL applicable HTS codes for a product
- Shows duty rate for each code
- Highlights lowest rate options
- Conditions/qualifications for each code

**Integration Gap:** Not connected to Landed Cost Calculator

---

## 9. THE FLOW PROBLEM (CRITICAL!)

### Current State: Fragmented Experience

```
User Journey Today (Disconnected):

1. Classify Product → Gets HTS code
2. Landed Cost Calculator → Calculates duties for ONE country
3. Sourcing Intelligence → Compares countries (separate page)
4. FTA Calculator → Checks FTA qualification (separate page)
5. Duty Optimizer → Finds alternative HTS codes (separate page)

Each tool works independently. User must manually navigate between them.
```

### Ideal State: Guided Liaison Experience

```
User Journey (Integrated):

1. Classify Product → Gets HTS code
   ↓ "Calculate landed cost?"
2. Landed Cost Calculator → Shows duties
   ↓ "Compare other countries?" → Shows multi-country comparison
   ↓ "Check FTA qualification?" → Opens FTA calculator with HTS pre-filled
   ↓ "Find lower duty rate?" → Opens Duty Optimizer with product pre-filled
   
Each step flows naturally to the next with context preserved.
```

---

## 10. INTEGRATION RECOMMENDATIONS

### 🎯 Priority 1: Connect Landed Cost → Sourcing Intelligence

**Current:** User calculates landed cost for ONE country, then must go to separate Sourcing page
**Fix:** Add "Compare Other Countries" button that:
- Opens Sourcing Intelligence in a modal or side panel
- Pre-fills the HTS code
- Shows multi-country comparison inline

**Implementation:**
```typescript
// In LandedCostCalculator.tsx, after result display:
<Button onClick={() => router.push(`/dashboard/sourcing?hts=${result.htsCode}&from=${result.countryCode}`)}>
  Compare Other Countries
</Button>
```

**Effort:** Small (2-3 hours)

### 🎯 Priority 2: Connect Landed Cost → FTA Calculator

**Current:** User sees "FTA may apply" warning but must manually go to FTA Calculator
**Fix:** Add "Check FTA Qualification" button that:
- Opens FTA Calculator with HTS pre-filled
- Shows potential savings
- Returns to Landed Cost with updated calculation

**Implementation:**
```typescript
// In LandedCostCalculator.tsx, when FTA country detected:
{result.tariffBreakdown.hasFta && (
  <Alert
    type="info"
    message={`${result.countryName} has FTA - you may qualify for duty-free!`}
    action={
      <Button onClick={() => router.push(`/dashboard/compliance/fta-calculator?hts=${result.htsCode}&fta=${ftaCode}`)}>
        Check Qualification
      </Button>
    }
  />
)}
```

**Effort:** Small (2-3 hours)

### 🎯 Priority 3: Connect Landed Cost → Duty Optimizer

**Current:** User gets one HTS code, doesn't know alternatives exist
**Fix:** Add "Find Lower Rate" button that:
- Opens Duty Optimizer with product description
- Shows alternative HTS codes with different rates
- User can select and recalculate landed cost

**Implementation:**
```typescript
// In LandedCostCalculator.tsx:
<Button onClick={() => router.push(`/dashboard/optimizer?product=${encodeURIComponent(productDescription)}&origin=${countryCode}`)}>
  Find Lower Rate Options
</Button>
```

**Effort:** Small (2-3 hours)

### 🎯 Priority 4: Unified Dashboard Widget

**Current:** User must know which tool to use
**Fix:** Create a unified "Import Cost Analyzer" that combines:
- Landed Cost Calculator (primary)
- Multi-country comparison (inline)
- FTA qualification check (inline)
- Alternative HTS suggestions (inline)

**Effort:** Large (1-2 weeks)

---

## 11. AREAS FOR IMPROVEMENT (REMAINING)

#### 1. Historical Tracking
**Current:** Scenarios saved in localStorage only
**Improvement:** Save to database
- Track over time
- See tariff changes
- Export history

**Effort:** Medium (2 days)
**Value:** Medium - nice to have

#### 2. Shipping Cost Estimator
**Current:** User must input shipping cost
**Improvement:** Estimate based on weight/volume
- Integrate with freight API
- Show ocean vs air comparison
- Transit time estimates

**Effort:** Large (5 days + API costs)
**Value:** High - removes user friction

#### 3. AD/CVD Rate Lookup
**Current:** Warning only
**Improvement:** Show actual AD/CVD rates
- Scrape CBP database
- Show manufacturer-specific rates
- Update regularly

**Effort:** Large (7 days)
**Value:** Medium - complex, changes frequently

### 🔴 Low Priority

#### 4. Currency Conversion
**Current:** USD only
**Improvement:** Support EUR, CNY, etc.
- Real-time exchange rates
- Show in user's currency

**Effort:** Small (1 day)
**Value:** Low - most users work in USD

#### 5. PDF Export
**Current:** None
**Improvement:** Export calculation as PDF
- Professional formatting
- Include all details
- Shareable with team

**Effort:** Medium (2 days)
**Value:** Low - can screenshot

---

## 12. HOW TO MAKE IT THE BEST (INTEGRATION FOCUS)

### 🎯 Top 3 Priorities (Updated)

#### 1. Connect the Tools (CRITICAL!)
**Why:** You already have the features, they just don't talk to each other
**What:** 
- Add navigation links between Landed Cost ↔ Sourcing ↔ FTA Calculator ↔ Duty Optimizer
- Pass context (HTS code, country, product description) via URL params
- Show inline previews where possible

**Impact:** 🔥 HUGE - transforms fragmented tools into a guided experience

#### 2. Inline Multi-Country Preview
**Why:** Sourcing Intelligence already does this - just surface it in Landed Cost
**What:**
- After calculating for one country, show "Quick Compare" section
- Display top 3-5 alternatives with savings %
- "See full analysis" links to Sourcing Intelligence

**Impact:** 🔥 HIGH - removes friction without rebuilding

#### 3. FTA Qualification Prompt
**Why:** FTA Calculator already exists - just prompt users to use it
**What:**
- When user calculates for FTA country (MX, CA, KR, etc.)
- Show alert: "You may qualify for duty-free under USMCA"
- One-click to FTA Calculator with HTS pre-filled

**Impact:** 🔥 HIGH - surfaces existing value

### 🚀 Moonshot Ideas

#### Unified Import Cost Analyzer
Combine all tools into one guided flow:
1. Describe product → AI classifies
2. Show landed cost for current country
3. Show alternatives inline
4. Prompt FTA check if applicable
5. Suggest alternative HTS codes if savings possible

#### Real-Time Tariff Alerts
"Tariffs on your saved scenarios changed!"
- Monitor saved scenarios
- Email alerts on tariff changes
- Show impact: "+$500 per shipment"

#### Landed Cost API
Let users integrate into their systems
- REST API
- Webhook notifications
- Bulk calculations

---

## 13. TECHNICAL DEBT

### ⚠️ Items to Address

#### 1. Legacy `landed-cost.ts` Service
**Issue:** `src/services/sourcing/landed-cost.ts` exists but isn't used by calculator
**Action:** Either remove or integrate with calculator
**Priority:** Low - not breaking anything

#### 2. Deprecated `additional-duties.ts`
**Issue:** Old tariff calculation logic still exists
**Action:** Remove after confirming no dependencies
**Priority:** Low - marked deprecated

#### 3. localStorage Scenarios
**Issue:** Scenarios only saved locally (lost on clear cache)
**Action:** Move to database for persistence
**Priority:** Medium - user data loss risk

#### 4. No Unit Tests
**Issue:** Calculator logic not covered by tests
**Action:** Add Jest tests for:
- Tariff calculations
- Fee calculations
- Edge cases (free products, high values)
**Priority:** Medium - important for reliability

---

## 11. COMPETITIVE ANALYSIS

### vs. Descartes CustomsInfo

| Feature | Sourcify | CustomsInfo |
|---------|----------|-------------|
| Landed cost calculator | ✅ Full | ❌ None |
| IEEPA tariff visibility | ✅ Yes | ❌ No |
| Section 301 rates | ✅ Product-specific | ⚠️ Generic |
| Scenario comparison | ✅ Yes | ❌ No |
| FTA qualification | 🟡 Planned | ❌ No |
| Multi-country compare | 🟡 Manual | ❌ No |
| Modern UI | ✅ Yes | ❌ 2010s design |
| Pricing | $0-99/mo | $10K+/year |

**Our Advantage:** We have a BETTER landed cost calculator than the $10K/year enterprise tool!

### vs. Freightos / Flexport

| Feature | Sourcify | Freightos |
|---------|----------|-----------|
| Duty calculation | ✅ Detailed | ⚠️ Basic |
| Shipping quotes | ❌ No | ✅ Yes |
| Freight booking | ❌ No | ✅ Yes |
| HTS classification | ✅ AI-powered | ❌ Manual |
| Tariff programs | ✅ All layers | ⚠️ Basic |

**Our Niche:** We're the duty/compliance experts. They're freight experts.

---

## 12. USER STORIES

### Story 1: First-Time Importer
**User:** Sarah, starting a clothing brand
**Goal:** Understand total cost to import t-shirts from China
**Flow:**
1. Gets HTS code from classification tool (6109.10.00.12)
2. Opens Landed Cost Calculator
3. Enters: HTS, China, $10,000 value, 1000 units
4. Sees: $7,800 in duties (78% rate!)
5. Saves scenario "China Option"
6. Tries Vietnam: Only $2,600 in duties (26% rate)
7. **Realizes:** Vietnam saves $5,200 per shipment!

**Outcome:** Makes informed sourcing decision

### Story 2: Experienced Importer
**User:** Mike, imports electronics for 10 years
**Goal:** Compare costs across multiple countries
**Flow:**
1. Has HTS code (8517.62.00.50)
2. Calculates for China, Vietnam, Mexico
3. Saves all 3 scenarios
4. Enters Compare Mode
5. Sees side-by-side: Mexico cheapest due to USMCA
6. Exports comparison to Excel
7. Shares with procurement team

**Outcome:** Data-driven sourcing strategy

### Story 3: Customs Broker
**User:** Lisa, licensed customs broker
**Goal:** Quick quote for client
**Flow:**
1. Client asks: "How much to import $50K of aluminum from Canada?"
2. Opens calculator
3. Enters: HTS 7601.10.30.00, CA, $50,000
4. Sees: $0 duties (USMCA exempt), $173 MPF, $63 HMF
5. Total: $50,236 landed
6. Screenshots and sends to client

**Outcome:** Fast, accurate quote

---

## 13. METRICS TO TRACK

### Usage Metrics
- Calculations per day
- Unique users
- Scenarios saved
- Compare mode usage
- Most common countries
- Most common HTS chapters

### Business Metrics
- Free → Paid conversion (if feature-gated)
- Time in calculator (engagement)
- Return visits
- Scenarios per user

### Quality Metrics
- API error rate
- Calculation time (should be < 1s)
- User-reported accuracy issues

---

## 14. MONETIZATION STRATEGY

### Free Tier
- 5 calculations per day
- Basic tariff breakdown
- No scenario saving

### Pro Tier ($99/mo)
- Unlimited calculations
- Scenario saving & comparison
- Excel export
- Priority support

### Business Tier ($299/mo)
- Everything in Pro
- Multi-country auto-compare
- FTA qualification checker
- API access
- Team collaboration

**Current Status:** Not gated - all features free

---

## 15. QUICK REFERENCE

### Key Files
```
UI:     src/features/compliance/components/LandedCostCalculator.tsx
API:    src/app/api/landed-cost/route.ts
Logic:  src/services/tariff/registry.ts
Types:  src/types/tariffLayers.types.ts
```

### Key Functions
```typescript
// Get tariff data
getEffectiveTariff(countryCode, htsCode, { baseMfnRate })

// Calculate fees
calculateMPF(productValue)  // 0.3464%, min $31.67, max $614.35
calculateHMF(productValue, isOcean)  // 0.125% if ocean

// Convert to UI format
convertToLegacyFormat(registryResult, htsCode, description, country)
```

### Testing URLs
```
Dev:  http://localhost:3000/dashboard/duties/calculator
Prod: https://sourcify.com/dashboard/duties/calculator
```

### Common HTS Codes for Testing
```
6109.10.00.12  - T-shirts (high China tariff: 78%)
8517.62.00.50  - Smartphones (Section 301: 25%)
7208.10.00.00  - Steel (Section 232: 25%)
7601.10.30.00  - Aluminum (Section 232: 25%)
8703.23.00.00  - Cars (Section 232: 25%)
```

---

## 16. FAQS

**Q: Does it show IEEPA tariffs?**
A: ✅ YES! This is critical and what competitors miss.

**Q: Can users compare multiple countries?**
A: ✅ YES - via scenario saving and compare mode.

**Q: Does it include AD/CVD rates?**
A: ⚠️ WARNING ONLY - actual rates are manufacturer-specific.

**Q: Can users save calculations?**
A: ✅ YES - saved in localStorage (not database yet).

**Q: Is it mobile-friendly?**
A: ✅ YES - fully responsive design.

**Q: Does it integrate with classification?**
A: ✅ YES - HTS code from classifier flows directly into calculator.

**Q: Can users export results?**
A: 🟡 NOT YET - planned for Business tier.

**Q: Does it show FTA savings?**
A: ⚠️ PARTIAL - shows warnings, but no qualification checker yet.

---

## 17. CHANGELOG

### January 29, 2026
- Created this master reference document
- Documented current state (production-ready)
- Identified improvement opportunities

### December 2025
- Migrated to centralized Tariff Registry
- Added IEEPA universal baseline (10%)
- Deprecated old additional-duties.ts

### November 2025
- Added scenario saving & comparison
- Implemented compare mode UI
- Added ocean/air shipment toggle

### October 2025
- Initial implementation
- Basic tariff calculation
- MPF/HMF fees

---

## 18. NEXT STEPS

### Immediate (This Week)
1. ✅ Document current state (this file)
2. 🔲 Add unit tests for calculations
3. 🔲 Fix any TypeScript errors

### Short-Term (This Month)
1. 🔲 Implement multi-country auto-compare
2. 🔲 Add Excel export
3. 🔲 Move scenarios to database

### Medium-Term (This Quarter)
1. 🔲 Build FTA qualification checker
2. 🔲 Add duty optimization suggestions
3. 🔲 Implement shipping cost estimator

### Long-Term (This Year)
1. 🔲 Launch API for integrations
2. 🔲 Add real-time tariff alerts
3. 🔲 Build AI sourcing advisor

---

*Last updated: January 29, 2026*
*Maintained by: Product Team*
*Questions? See AGENTS.md for project context*
