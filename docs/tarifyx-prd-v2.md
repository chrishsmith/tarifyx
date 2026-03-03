# PRD v2: Tarifyx - AI-Powered Import Intelligence Platform

> **Platform Name:** Tarifyx.com  
> **Version:** 2.0  
> **Created:** February 8, 2026  
> **Previous Version:** `tarifyx-prd.md` (v1 - retained as reference)  
> **Status:** ACTIVE  

---

## 1. VISION & POSITIONING

### What Tarifyx Is

Tarifyx is an **AI-powered import intelligence platform** that helps SMB importers classify products, calculate true landed costs, and find duty optimization opportunities — using free government data and AI that enterprise competitors don't have.

### What Tarifyx Is NOT (Yet)

Tarifyx is not a supplier marketplace, freight broker, or ERP system. Those are future expansion options documented in Section 8, contingent on revenue and validated demand.

### Core Value Proposition

**"The only tool that tells you exactly how much you'd save by moving production from China to Vietnam — with one click."**

Tarifyx gives SMB importers ($10K–$1M annual imports) the cost intelligence and compliance tools that enterprise platforms charge $10K+/year for, powered by free government data + AI classification that competitors don't offer.

### Why We Win

| Advantage | Detail | Hard to Copy? |
|-----------|--------|---------------|
| **AI Classification** | V10 hybrid engine (semantic + lexical + ML) with reasoning | Yes — requires training data + ML expertise |
| **Full Tariff Stack** | MFN + Section 301 + IEEPA + Section 232 + ADD/CVD in one view | Medium — but we're years ahead |
| **Country Cost Comparison** | Real import data + tariff calculation for 199 countries | Yes — unique combination |
| **Tariff Monitoring** | Alerts when policy changes affect your specific products | Yes — requires the whole stack |
| **SMB Pricing** | $0–$99/mo vs $10K+/yr | Yes — their cost structure won't allow it |

### What We're NOT Claiming

- We don't have BOL/shipment-level data (that requires $10K+ licenses — see Phase 3)
- USITC DataWeb provides **aggregate national statistics**, not individual supplier/shipper data
- Our cost map shows **import cost comparison** (tariffs + fees), not manufacturing cost estimates
- Average unit values from USITC are rough benchmarks, not precise FOB prices

---

## 2. TARGET AUDIENCE

### Primary: SMB Importer

**Profile:** Business owner/manager importing $10K–$500K annually  
**Pain Points:**
- Gets surprised by unexpected duties at customs
- Has no idea what duties would be from a different country
- Can't afford $10K+/year enterprise tools (Datamyne, CustomsInfo)
- Finds out about tariff changes reactively, not proactively
- Wastes hours on manual HTS classification and compliance research

**Current Workflow:**
1. Describe product to broker → Wait for classification and quote
2. Get surprised by fees at customs
3. React to compliance issues after the fact
4. No visibility into optimization opportunities

**Tarifyx Workflow:**
1. Describe product → Instant AI classification with confidence scores
2. See full landed cost breakdown with all tariff layers
3. Compare costs across countries → Find savings opportunities
4. Get alerted when tariff changes affect your products

### Secondary: Trade Compliance Manager

**Profile:** Mid-market companies ($100K–$1M imports) with dedicated compliance roles  
**Needs:** Batch screening, audit trails, FTA qualification tools, tariff monitoring  
**Tier:** Pro ($99/mo)

### Future: Enterprise (Year 2+)

**Profile:** Large importers ($1M+ imports)  
**Needs:** API access, BOL data, team collaboration  
**Tier:** Business ($299/mo) or custom

---

## 3. THE PRODUCT: CLASSIFY → CALCULATE → OPTIMIZE → MONITOR

This is the core product loop. Each stage builds on the previous one, and together they form a complete value chain that no competitor offers at this price point.

### Stage 1: CLASSIFY (The Hook — Free Tier)

**What it does:** User describes a product in natural language → AI returns HTS classification with confidence scores, alternatives, and reasoning.

**Why it matters:** Without an accurate HTS code, nothing else works — no landed cost, no compliance screening, no optimization. This is the keystone of the entire platform.

**What's built:**
- V10 classification engine (semantic search + lexical + SetFit ML)
- 27,061 HTS codes with embeddings in pgvector
- 17,347 CBP CROSS rulings for training/validation
- Alternative classifications with duty comparisons
- Confidence scoring and AI reasoning
- Bulk classification via CSV upload

**Free tier limits:** 5 classifications/day, 10 saved products

### Stage 2: CALCULATE (The Value — Free/Pro)

**What it does:** Given an HTS code + country of origin + product value → Full landed cost breakdown including every tariff layer, customs fees, and per-unit costs.

**Why it matters:** Most importers have no idea what their true import cost is. The tariff landscape (especially post-2025 IEEPA changes) is so complex that even brokers miss layers. Showing the full stack — Base MFN + Section 301 + IEEPA + Section 232 + ADD/CVD + MPF + HMF — in one view is immediately valuable.

**What's built:**
- Tariff Registry with 199 country profiles
- All special tariff programs (Section 301 Lists 1-4, IEEPA baseline/fentanyl/reciprocal, Section 232)
- Landed Cost Calculator with customs fees (MPF, HMF)
- Scenario saving and side-by-side comparison
- Per-unit cost breakdown

**Data sources (all free):**
- USITC HTS API (base MFN rates)
- `tariffPrograms.ts` (special tariff programs, maintained from USTR/Federal Register)
- CBP fee schedules
- `CountryTariffProfile` database table (199 countries)

### Stage 3: OPTIMIZE (The Aha Moment — Free/Pro)

**What it does:** Given an HTS code, shows what the landed cost would be from every major sourcing country — ranked by total cost, with savings vs. current source highlighted. This is the Global Cost Map feature.

**Why it matters:** This is where Tarifyx becomes indispensable. An importer sourcing from China at 145% total duty can instantly see that Vietnam is 35%, Mexico under USMCA could be 0%. That kind of savings visibility doesn't exist anywhere else at this price point.

**What's built / what to build:**

| Component | Status | Data Source |
|-----------|--------|-------------|
| Tariff calculation by country | ✅ Built | Tariff Registry (199 countries) |
| USITC import volume by country | ✅ Built | USITC DataWeb API (free) |
| Average unit value by country | ✅ Built | USITC DataWeb (customs value ÷ quantity) |
| Country comparison table | ✅ Built | Combines tariff + USITC data |
| Interactive cost map (Mapbox) | 🔲 To Build | Mapbox + calculated data |
| FTA qualification indicators | ✅ Built | FTA Rules Engine |
| ADD/CVD risk warnings | ✅ Built | ADD/CVD database |

**What the cost map honestly shows:**
- **Landed cost comparison** — accurate (tariff calculations from our registry)
- **Import volume by country** — accurate (USITC DataWeb, proves manufacturing capacity exists)
- **Average unit value benchmarks** — approximate (aggregate data, not transaction-level)
- **FTA savings opportunities** — accurate (our FTA rules engine)

**What it does NOT show:**
- Individual supplier names or prices (requires BOL data — Phase 3)
- Actual manufacturing/production costs (no free data source for this)
- Freight costs by route (requires freight API integration — future option)

### Stage 4: MONITOR (The Retention Engine — Pro Tier)

**What it does:** Watches for tariff and regulatory changes that affect the user's saved products, and alerts them with dollar-impact analysis and optimization recommendations.

**Why it matters:** The tariff landscape changes constantly — new IEEPA rates, Section 301 list modifications, exclusion expirations, ADD/CVD orders, FTA renegotiations. Most SMBs find out about these changes when they get hit with an unexpected bill. Monitoring converts Tarifyx from a tool you use once into a platform you depend on weekly.

**What's built / what to build:**

| Component | Status | Data Source |
|-----------|--------|-------------|
| Product portfolio (save/track) | ✅ Built | User database |
| Tariff change detection | ✅ Built | Federal Register API + tariffPrograms.ts |
| Compliance alerts system | ✅ Built | Alert subscriptions |
| Section 301/IEEPA tracker | ✅ Built | USTR announcements |
| Dollar-impact alerts | 🔲 To Build | Tariff diff × user's product value |
| Optimization recommendations in alerts | 🔲 To Build | "Switch to X country, save $Y" |
| Geopolitical risk flags | 🔲 To Build | Federal Register + OFAC/sanctions changes |
| Email/push notification delivery | 🔲 To Build | SendGrid or similar |

**Alert examples (target experience):**
- "IEEPA rate on China increased 10% on Feb 1. Your polo shirts (HTS 6109.10) now cost $2,400 more annually. Vietnam would save you $8,700."
- "New ADD/CVD order issued on steel fasteners from India. Your HTS 7318.15 imports may be affected. Review required."
- "USMCA rules of origin for HTS 8471.30 updated. Your laptop imports from Mexico may need re-qualification."

### Stage 5: ACT (Pro Tier)

**What it does:** Export compliance reports, share analysis with brokers, generate documentation checklists.

**What's built:**
- PDF classification reports
- Excel/CSV data exports
- Compliance screening reports
- FTA qualification summaries

---

## 4. PHASE 1 — LAUNCH FEATURES

Everything below is either already built or achievable with free government data. This is the MVP.

### Already Complete ✅

| Feature | Description |
|---------|-------------|
| **AI Classification (V10)** | Hybrid semantic + lexical + ML classification engine |
| **Landed Cost Calculator** | Full tariff stack with customs fees |
| **Tariff Registry** | 199 countries, 7 data sources |
| **Trade Statistics Dashboard** | USITC DataWeb integration |
| **Compliance Screening** | OFAC SDN, BIS Entity List, BIS Denied Persons |
| **ADD/CVD Lookup** | 20+ product categories |
| **FTA Rules Engine** | 14 FTAs, 30+ rules |
| **FTA Qualification Calculator** | BOM input, RVC calculation |
| **PGA Requirements** | 13 agencies, 30+ flags |
| **Tariff Tracker** | Section 301/IEEPA/Section 232 current rates |
| **Compliance Alerts** | Subscription-based alert system |
| **Historical HTS Archives** | Code changes 2020–2025 |
| **Export** | PDF, Excel, CSV |
| **Country Comparison** | Side-by-side duty analysis |

### To Build for Launch 🔲

| Feature | Effort | Priority | Description |
|---------|--------|----------|-------------|
| **Interactive Cost Map** | M | P0 | Mapbox visualization of landed cost by country |
| **Dollar-Impact Alerts** | M | P0 | "This change costs you $X/year" in alert notifications |
| **Optimization in Alerts** | S | P0 | "Switch to country X, save $Y" recommendations |
| **Stripe Integration** | M | P0 | Payment collection for Pro tier |
| **Usage Limits & Gating** | M | P0 | Free tier limits (5/day), Pro feature locks |
| **Upsell Flows** | S | P1 | "Upgrade to unlock" prompts in free tier |
| **Email Notifications** | M | P1 | Alert delivery via email (SendGrid) |
| **Geopolitical Risk Flags** | S | P2 | Flag countries with active sanctions/trade actions |
| **Onboarding Flow** | S | P2 | Guided first-use experience |

---

## 5. PRICING

### Tier Structure

| | Free | Pro ($99/mo) |
|---|---|---|
| **Classification** | 5/day | Unlimited |
| **Saved Products** | 10 | 100 |
| **Landed Cost Calculator** | ✅ | ✅ |
| **Country Cost Comparison** | 3 countries | All 199 countries |
| **Interactive Cost Map** | View only | Full interaction + export |
| **Trade Statistics** | Basic | Full with trends |
| **Compliance Screening** | ❌ | ✅ (OFAC, BIS, batch) |
| **FTA Qualification** | ❌ | ✅ |
| **ADD/CVD Lookup** | ❌ | ✅ |
| **Tariff Monitoring & Alerts** | 1 product | 100 products |
| **Dollar-Impact Alerts** | ❌ | ✅ |
| **Optimization Recommendations** | ❌ | ✅ |
| **Export (PDF/Excel)** | ❌ | ✅ |
| **Bulk Classification** | ❌ | ✅ (CSV upload) |

### Conversion Strategy

**Free tier value:** Classify + see landed cost from current country. Enough to be useful, enough to show what's behind the paywall.

**Upgrade trigger:** The country comparison. Free users see 3 countries. The moment they see "Vietnam saves you $8,000" and want to explore more — that's the conversion point.

**Retention driver:** Monitoring alerts. Pro users get dollar-impact alerts on their portfolio. The recurring value of "we watch for changes so you don't have to" justifies the monthly subscription.

### Revenue Targets (Conservative)

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Registered users | 1,000 | 3,000 | 8,000 |
| Free-to-Pro conversion | 5% | 7% | 10% |
| Paying users | 50 | 210 | 800 |
| MRR | $5K | $21K | $80K |

---

## 6. COMPETITIVE POSITIONING

### Feature Comparison (Launch)

| Feature | Tarifyx | Datamyne | CustomsInfo | ImportGenius |
|---------|---------|----------|-------------|--------------|
| AI Classification | ✅ With reasoning | ❌ | ⚠️ Basic | ❌ |
| Landed Cost (all tariffs) | ✅ Full stack | ❌ | ❌ | ❌ |
| Country Cost Comparison | ✅ 199 countries | ❌ | ❌ | ❌ |
| Interactive Cost Map | ✅ | ❌ | ❌ | ❌ |
| IEEPA/301/232 Visibility | ✅ All layers | ❌ | Partial | ❌ |
| Tariff Change Monitoring | ✅ With $ impact | ❌ | ❌ | ❌ |
| Compliance Screening | ✅ OFAC + BIS | ⚠️ Basic | ⚠️ Basic | ❌ |
| FTA Qualification Calc | ✅ | ❌ | ❌ | ❌ |
| BOL Shipment Data | ❌ (Phase 3) | ✅ | ❌ | ✅ |
| Supplier Names | ❌ (Phase 3) | ✅ | ❌ | ✅ |
| Company Intelligence | ❌ (Phase 4) | ✅ (D&B) | ❌ | ❌ |
| Modern UX | ✅ | ❌ | ❌ | ❌ |
| Price | $0–$99/mo | $10K+/yr | $10K+/yr | $2.4K+/yr |

**Our honest position:** We don't compete on transaction-level shipment data. We compete on **cost intelligence, optimization, and AI** — things they don't have at all.

---

## 7. TECHNICAL ARCHITECTURE

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| UI | Ant Design 5 |
| Database | PostgreSQL + Prisma ORM |
| Auth | Better Auth (session-based) |
| AI/ML | xAI (Grok) for reasoning, OpenAI embeddings, SetFit classifier |
| Vector Search | pgvector with HNSW indexing |
| Maps | Mapbox (for cost map) |

### Data Sources (All Free)

| Source | What It Provides | API? | Used For |
|--------|-----------------|------|----------|
| USITC DataWeb | Import volumes, customs values, quantities by HTS + country | ✅ | Cost map, trade stats, volume validation |
| USITC HTS API | Tariff schedules, duty rates | ✅ | Base MFN rates |
| Federal Register | Regulatory changes, tariff actions | ✅ | Monitoring alerts |
| OFAC | SDN list (sanctioned entities) | ✅ | Denied party screening |
| BIS | Entity List, Denied Persons | Download | Denied party screening |
| USTR | FTA texts, 301 actions | Download | FTA rules, tariff tracker |
| CBP | Fee schedules, rulings database | Mixed | Customs fees, classification training |

### Key Services

| Service | File | Purpose |
|---------|------|---------|
| Classification V10 | `src/services/classificationEngineV10.ts` | AI-powered HTS classification |
| Tariff Registry | `src/services/tariffRegistry.ts` | Single source of truth for tariff rates |
| USITC DataWeb | `src/services/usitcDataWeb.ts` | Import statistics API |
| Landed Cost | `src/features/compliance/components/LandedCostCalculator.tsx` | Cost calculation UI |
| Tariff Programs | `src/data/tariffPrograms.ts` | Special tariff program database |

### V10 Classification Architecture

```
Input Text → Preprocessing → Multiple Search Paths
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
               Semantic Search   Lexical Search   SetFit ML
               (pgvector)        (BM25)          (Python server)
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                               Scoring & Ranking
                                      │
                               Confidence Score + Reasoning
```

### Critical Training Data & Models (Preserve These)

| Asset | Location | Purpose |
|-------|----------|---------|
| HTS Database | `prisma/seed-hts-codes.ts` → `hts_code` table | 27,061 codes with embeddings |
| CBP CROSS Rulings | `src/data/crossRulings.json` + `crossRulingsEmbedded.json` | 17,347 rulings for training |
| Validation Set | `src/data/crossRulings-validation.json` | 180 manually verified rulings |
| SetFit Model | `models/setfit-hts-subheading/` | Trained classifier (90%+ accuracy) |
| HTS Embeddings | PostgreSQL `hts_code.embedding` | pgvector semantic search |
| Embedding Scripts | `scripts/embed-hts-codes.ts`, `scripts/embed-cross-rulings.ts` | Reproduction |
| Training Scripts | `scripts/train-setfit-classifier.py` | Model retraining |

---

## 8. FUTURE OPTIONS (NOT COMMITTED)

These are expansion opportunities that depend on Phase 1 revenue, user feedback, and strategic decisions. They are documented here to preserve the thinking, not as commitments.

### Phase 2: Licensed Data — Supplier & Competitor Intelligence

**Trigger:** Pro tier revenue covers data licensing costs ($10K+/yr minimum)  
**Timeline:** Earliest Q3 2026, only if Phase 1 metrics justify investment

| Feature | What It Enables | Data Required | Cost |
|---------|----------------|---------------|------|
| Supplier Discovery | Find suppliers by HTS code from BOL data | ImportKey or ImportGenius license | $3K–$24K/yr |
| Competitor Analysis | See what competitors import and from whom | Same BOL license | Included |
| Shipment Tracking | Individual shipment-level detail | Same BOL license | Included |

**Pricing:** Business tier ($299/mo) — need ~3 subscribers to cover base data costs

**Honest note:** BOL data is what gives you individual company names. USITC DataWeb only provides country-level aggregates. Until we license BOL data, we cannot offer supplier discovery or competitor intelligence.

### Phase 3: Supplier Marketplace / Trusted Suppliers

**Trigger:** Validated demand from Phase 2 BOL data users + revenue to fund vetting operations  
**Timeline:** Year 2 at earliest

This is a fundamentally different business (two-sided marketplace) from a SaaS intelligence tool. It requires:
- Supplier acquisition and vetting operations
- Certification processes and ongoing monitoring
- Marketplace infrastructure (search, matching, reviews)
- Insurance/guarantee frameworks

**Options for supplier data without BOL licenses:**
- Government export promotion agencies (VIETRADE, DGFT, etc.)
- Trade show exhibitor databases
- User-contributed supplier reviews (organic growth)

See `tarifyx-prd.md` (v1) Sections 2–3 for detailed supplier marketplace design if/when we pursue this.

### Phase 4: Freight & Logistics Integration

**Trigger:** User demand for "full landed cost including shipping"  
**Timeline:** When freight API partnerships make economic sense

- Real-time freight rate APIs (Flexport, Freightos)
- Shipping cost added to landed cost calculation
- Route optimization recommendations

### Phase 5: Company Intelligence

**Trigger:** Enterprise customers requesting company data  
**Timeline:** 2027+, depends on Phase 2–3 success

- D&B or ZoomInfo integration ($20K–$80K/yr)
- Corporate hierarchy, revenue, contacts
- Enterprise tier (custom pricing)

### Phase 6: Predictive Intelligence

**Trigger:** Sufficient historical data + user base to justify investment  

- Tariff change forecasting (ML on Federal Register + trade policy patterns)
- Supply chain disruption prediction
- Demand forecasting integration
- Automated optimization recommendations

---

## 9. WHAT WE'RE NOT BUILDING (AND WHY)

| Feature | Why Not Now |
|---------|------------|
| Supplier marketplace | Two-sided marketplace is a different business; requires BOL data we don't have |
| Freight rate shopping | Requires API partnerships and adds complexity; landed cost without freight is still valuable |
| ERP integration | Premature — validate core product first |
| Mobile PWA | Desktop-first is fine for professional import analysis workflows |
| Predictive analytics | Need historical data accumulation and user base first |
| White-label / API-first | Enterprise play that distracts from SMB focus |

---

## 10. DEVELOPMENT ROADMAP

### Now → Launch (8 weeks)

**Goal:** Ship the Classify → Calculate → Optimize → Monitor loop with monetization.

| Week | Focus |
|------|-------|
| 1–2 | Stripe integration + usage limits + feature gating |
| 3–4 | Interactive cost map (Mapbox) + enhanced country comparison |
| 5–6 | Dollar-impact alerts + optimization recommendations in alerts |
| 7 | Email notification delivery + onboarding flow |
| 8 | Polish, testing, soft launch |

### Post-Launch (Months 3–6)

- Iterate based on user feedback
- Optimize conversion funnel (free → Pro)
- Add geopolitical risk flags
- Evaluate demand signals for Phase 2 (BOL data)
- Content marketing / SEO for acquisition

### Phase 2 Decision Point (Month 6)

Evaluate whether to invest in BOL data licensing based on:
- Pro subscriber count and MRR
- User requests for supplier/competitor data
- Available runway for $10K+ annual data costs

---

## 11. SUCCESS METRICS

### Launch Metrics (Month 1–3)

| Metric | Target |
|--------|--------|
| Registered users | 1,000 |
| Classifications performed | 5,000+ |
| Users who reach cost comparison step | 40% of classifiers |
| Uptime | 99.5% |
| Average classification response time | <3 seconds |

### Growth Metrics (Month 3–6)

| Metric | Target |
|--------|--------|
| Monthly active users | 2,000+ |
| Free-to-Pro conversion | 5–7% |
| Pro subscriber retention (monthly) | 85%+ |
| MRR | $15K+ |
| Weekly alert engagement | 50% of Pro users check alerts |

### Product-Market Fit Signals

| Signal | What It Means |
|--------|---------------|
| Users return weekly without prompting | Monitoring loop is working |
| Users share reports with brokers/team | Tool is embedded in workflow |
| Users ask for BOL/supplier data | Demand for Phase 2 is real |
| Organic signups > paid acquisition | Word-of-mouth is working |
| <5% monthly Pro churn | Value justifies $99/mo |

---

## 12. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI classification accuracy issues | Users lose trust | V10 has 90%+ accuracy; add user feedback loops, CBP ruling validation |
| USITC DataWeb API changes/downtime | Cost map breaks | Cache aggressively, build fallback to static dataset |
| Tariff policy volatility | Data goes stale fast | Federal Register monitoring + manual review process |
| Low conversion rate | Revenue doesn't materialize | Iterate on paywall placement; test what free users value most |
| Enterprise competitors add AI | Lose differentiation | Move fast on optimization/monitoring features they can't quickly replicate |
| Government API access restricted | Lose data foundation | Diversify sources; maintain static snapshots as fallback |

---

## APPENDIX A: Data Source Limitations (Be Honest)

### USITC DataWeb — What It Actually Provides

**Provides:**
- Import volume statistics by HTS code + country (aggregate)
- Customs values (aggregate dollar amounts)
- Quantities with units
- Annual and monthly time series
- District/port-level breakdowns

**Does NOT provide:**
- Individual company/shipper/consignee names
- Individual transaction or shipment details
- Actual tariff rates paid (we calculate these ourselves)
- Section 301/IEEPA duty amounts (we calculate from our tariff registry)
- FTA preferences applied
- Supplier contact information

### What This Means for Features

- **Cost map:** Shows calculated landed cost comparison (accurate) + import volume as proxy for manufacturing capacity (accurate) + avg unit value benchmarks (approximate)
- **Supplier discovery:** Not possible without BOL data license
- **Competitor intelligence:** Not possible without BOL data license
- **Trade trend analysis:** Fully supported at aggregate level

---

## APPENDIX B: Reference Documents

| Document | Purpose |
|----------|---------|
| `tarifyx-prd.md` (v1) | Original PRD — retained for supplier marketplace designs, wireframes, technical specs |
| `prd-trade-intelligence.md` | Current Sourcify source of truth — feature status tracking |
| `master-feature-spec.md` | Feature inventory across all modules |
| `import-intelligence-ui-spec.md` | UI specification for the unified import analysis flow |
| `landedcost-master.md` | Landed cost calculator technical reference |
| `competitive-analysis-datamyne.md` | Detailed Datamyne/CustomsInfo competitor analysis |
| `datamyne-consolidated.md` | Consolidated competitor functionality analysis |

---

*Document version: 2.0*  
*Last updated: February 8, 2026*
