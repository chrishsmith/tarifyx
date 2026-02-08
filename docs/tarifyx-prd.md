# PRD: Tarifyx - AI-Powered Trade Intelligence Platform

> **Platform Name:** Tarifyx.com
> **Vision:** The world's most intelligent trade platform, democratizing access to AI-powered import intelligence
> **Target:** Small to mid-market importers ($10K-1M annual imports)
> **Launch Strategy:** Free features first → Licensed data → Enterprise features
> **Competitors:** Datamyne, CustomsInfo, ImportGenius, Panjiva
> **Created:** January 30, 2026

---

## 1. EXECUTIVE SUMMARY

### Platform Vision
Tarifyx becomes the **trusted operating system for global trade**, combining AI-powered intelligence with a certified supplier network. We eliminate 80% of import complexity by handling compliance, optimization, AND supplier vetting - so importers can focus on growing their business.

### Core Value Proposition
**"Find suppliers that actually work with businesses like yours"** - AI-powered trade intelligence + business-size-matched suppliers = zero-risk, optimized importing for startups to enterprises.

### Market Opportunity
- **Total Addressable Market:** $500M+ SMB trade intelligence market
- **Current Gap:** Enterprise tools cost $10K+/year, leaving SMBs underserved
- **Our Edge:** AI features competitors lack + 10x better UX + affordable pricing

### Success Metrics (First 12 Months)
- **Users:** 10,000 registered users
- **Revenue:** $500K+ MRR from paid tiers
- **Retention:** 70% monthly retention
- **Conversion:** 15% free-to-paid conversion
- **Engagement:** 60% of free users use Global Cost Map weekly

### USITC DataWeb: The Secret Weapon

**Why This Changes Everything:**
USITC DataWeb provides **aggregated import statistics with calculated duties** - essentially giving you cost intelligence without needing expensive BOL licenses initially.

**What It Enables (FREE):**
- ✅ Real calculated duty amounts by HTS/country
- ✅ Customs values and quantities for cost analysis
- ✅ Historical trends for market intelligence
- ✅ Country-level benchmarking
- ✅ Port and regional trade patterns

**Competitive Advantage:**
- **Datamyne:** Has BOL data but charges $10K+/year
- **You:** Have cost analysis via government data + AI + better UX = $99/month
- **Result:** 99% of Datamyne's value at 1% of the cost

**Launch Strategy:** Build powerful free features with government data, then layer on licensed BOL data for the premium tier. Users get immediate value while you prove demand for paid features.

---

## V10 TRAINING DATA & EMBEDDINGS REFERENCE

### **Training Data Sources (Preserve These!)**

#### **1. HTS Code Database (27,061 codes)**
**Location:** `/prisma/seed-hts-codes.ts` → PostgreSQL `hts_code` table
**Content:**
- Full HTS hierarchy (Chapters → Headings → Subheadings → Tariff lines)
- Official USITC descriptions and duty rates
- Keywords and parent groupings for context
- **Purpose:** Semantic embeddings + lexical search fallback

#### **2. CBP CROSS Rulings Dataset (17,347 rulings)**
**Location:** `src/data/crossRulings.json` (raw) + `crossRulingsEmbedded.json` (549MB with vectors)
**Content:**
- 17,347 official CBP rulings with product descriptions
- HTS code assignments and reasoning
- OpenAI embeddings (1536 dimensions) for semantic search
- **Purpose:** SetFit model training + few-shot prompting

#### **3. Cross Rulings Validation Set (180 rulings)**
**Location:** `src/data/crossRulings-validation.json`
**Content:** Manually verified rulings for model evaluation
**Purpose:** Model validation and fine-tuning

#### **4. HTS Embeddings in Database**
**Location:** PostgreSQL `hts_code.embedding` column (vector(1536))
**Generation:** `scripts/embed-hts-codes.ts` using OpenAI text-embedding-3-small
**Purpose:** pgvector semantic search for HTS classification

### **Trained Models (Critical Assets)**

#### **SetFit HTS Classifier**
**Location:** `models/setfit-hts-subheading/`
- **Base Model:** sentence-transformers/all-MiniLM-L6-v2
- **Training Data:** 12,000-17,347 CBP rulings
- **Checkpoints:** `checkpoint-1000/` (best performing)
- **Accuracy:** 90%+ on 6-digit subheadings
- **Inference:** 50-100ms (via Python server)

#### **OpenAI Embeddings**
**Model:** text-embedding-3-small (1536 dimensions)
**Usage:** HTS code semantic search
**Storage:** PostgreSQL pgvector with HNSW indexing
**Performance:** Sub-second similarity searches

### **Data Processing Scripts (For Reproduction)**

#### **Critical Scripts to Preserve:**
- `scripts/embed-cross-rulings.ts` - Creates CBP ruling embeddings
- `scripts/train-setfit-classifier.py` - Trains SetFit model
- `scripts/embed-hts-codes.ts` - Creates HTS code embeddings
- `scripts/apply-pgvector-migration.ts` - Sets up vector database

#### **Training Logs:**
- `models/training-12k.log` - SetFit training with 12K samples
- `models/training.log` - SetFit training with 17K samples

### **If Starting Over: Essential Assets**

#### **Must Preserve:**
1. **CBP CROSS Rulings Dataset** - The gold standard training data
2. **USITC HTS Database** - The classification target
3. **Training Logs** - Hyperparameters and model configurations
4. **Model Checkpoints** - Already fine-tuned models

#### **Can Regenerate:**
1. **Embeddings** - Recalculate from HTS database ($ cost)
2. **Database Schema** - Re-import from USITC Excel
3. **API Endpoints** - Rewrite with new patterns
4. **UI Components** - Rebuild with current design system

### **V10 Architecture Summary**

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

**Key Innovation:** Hybrid search combining semantic understanding with lexical precision, plus ML fallback for high-confidence classifications.

---

## THE TARIFYX TRUSTED SUPPLIERS PROGRAM ⭐

### Vision: Become the Trusted Intermediary
Instead of just providing supplier search tools, Tarifyx **does the vetting work FOR users**, creating a certified supplier network that eliminates 40% of sourcing time and reduces risk to near-zero.

### How It Works for Users

**The Problem:** Importers waste 40% of sourcing time on due diligence
**The Solution:** Tarifyx pre-vets and certifies suppliers

**User Experience:**
1. **Browse Certified Suppliers** - Search by category, location, certifications, capacity
2. **Get Instant Access** - Direct contact with pre-qualified suppliers
3. **Zero Due Diligence** - All compliance, quality, and capacity already verified
4. **Performance Tracking** - See supplier ratings and delivery history
5. **Risk-Free Sourcing** - Continuous monitoring and insurance-like protection

### Certification Framework (Tarifyx Does the Work)

**6-Step Certification Process:**
1. **Business Legitimacy** - Financial stability, legal status, references
2. **Compliance Screening** - OFAC, BIS, denied parties, trade sanctions
3. **Quality Verification** - ISO certifications, factory audits, quality systems
4. **Capacity Assessment** - Production capability, lead times, scalability
5. **Performance History** - Past delivery records, quality metrics, customer feedback
6. **Sustainability Check** - ESG compliance, forced labor prevention, ethical standards

**Continuous Monitoring:**
- Monthly compliance re-screening
- Performance metrics tracking
- Customer satisfaction monitoring
- Annual recertification requirement

### Value Creation for Suppliers

**Why Suppliers Pay for Certification:**
- **"Tarifyx Certified" Badge** - Trusted by vetted importers worldwide
- **Pre-Qualified Leads** - Only serious buyers who have passed Tarifyx verification
- **Performance Dashboard** - See how you rank vs competitors
- **Global Reach** - Access to importers actively searching for your products

### Revenue Model

**Supplier Side:**
- **Basic Certification:** $499/year (compliance + quality verification)
- **Premium Certification:** $1,499/year (featured listings + priority leads)
- **Enterprise Certification:** $4,999/year (custom vetting + dedicated support)
- **Connection Fees:** 1-3% of facilitated deal value

**Buyer Side (Already in Pricing):**
- Free tier: Browse certified suppliers
- Pro tier: Priority supplier introductions
- Business tier: Direct supplier connections + performance data

### Initial Market Focus

**Phase 1: 100 Suppliers (Launch)**
- **Textiles/Apparel** - T-shirts, jeans, fabrics (high volume, complex supply chains)
- **Electronics** - Cables, chargers, components (technical specifications)
- **Home Goods** - Furniture, kitchenware (quality + sustainability focus)

**Phase 2: 500+ Suppliers (6 months)**
- Industrial parts, packaging, chemicals
- Geographic expansion (Vietnam, India, Mexico focus)

### Quality Assurance & Risk Management

**Escalation Framework:**
- **Performance Alerts** - Automatic warnings for quality/delivery issues
- **Improvement Plans** - Required corrective actions with deadlines
- **Probation Status** - Temporary suspension with improvement tracking
- **Decertification** - Removal for serious violations or repeated issues

**Insurance-Like Protection:**
- Supplier performance guarantees
- Quality defect coverage
- Delivery delay compensation
- Dispute resolution services

### Network Effects Flywheel

1. **More Certified Suppliers** → Higher value for buyers → More buyer signups
2. **More Buyers** → More supplier applications → Better supplier pool
3. **Better Data** → Improved matching algorithms → Higher success rates
4. **Higher Trust** → More transactions on platform → Revenue growth
5. **Revenue Growth** → Better certification process → Even higher quality

### Success Metrics

**Year 1 Goals:**
- 500 certified suppliers across key categories
- 40% of user sourcing inquiries use certified suppliers
- 95% supplier satisfaction rating
- 20% of total revenue from supplier services

**Long-term Vision:**
- **2,000+ certified suppliers** by year 2
- **50% of B2B sourcing** through Tarifyx network
- **Industry standard** for supplier certification
- **$10M+ annual revenue** from supplier services

### Competitive Moat

**Why This is Nearly Impossible to Copy:**
1. **Trust Building** - Takes years to establish credibility with suppliers and buyers
2. **Data Accumulation** - Performance data improves with scale
3. **Network Effects** - Platform gets better as more participants join
4. **Quality Standards** - Rigorous certification creates barrier to entry
5. **Brand Authority** - "Tarifyx Certified" becomes the gold standard

**This creates a flywheel where Tarifyx becomes indispensable to both suppliers AND buyers, creating a multi-sided marketplace with huge defensibility.**

---

## 2. TARGET AUDIENCE & USER PERSONAS

### Primary Persona: SMB Importer
**Profile:** Small-medium business owner/manager importing $10K-500K annually
**Pain Points:**
- Struggles with HTS classification accuracy
- Gets surprised by unexpected duties
- Wastes time on manual compliance
- Can't afford $10K+/year enterprise tools
- Needs supplier intelligence but lacks data access

**Goals:**
- Save money on import duties and fees
- Stay compliant without legal headaches
- Find better suppliers and sourcing options
- Scale business without increasing complexity

**Current Workflow:**
1. Describe product to broker/customs agent
2. Wait for classification and duty quote
3. Pay unexpected fees at customs
4. Deal with compliance issues reactively

**Tarifyx Workflow (Desired):**
1. Input product → Get instant AI classification
2. See landed cost and optimization opportunities
3. Get compliance checklist and alerts
4. Monitor portfolio and get proactive alerts

### Secondary Persona: Trade Compliance Manager
**Profile:** Mid-market companies ($100K-1M imports) with dedicated compliance roles
**Needs:** Advanced compliance tools, team collaboration, audit trails
**Pain Points:** Scaling compliance as business grows

### Enterprise Persona (Future)
**Profile:** Large importers ($1M+ imports)
**Needs:** API integrations, advanced analytics, custom reporting
**Timeline:** Year 2+ expansion

---

## 3. FEATURE SPECIFICATIONS

### Phase 1: Core Platform (Free Features)

#### 3.1 AI-Powered Product Intelligence

##### **Smart Product Input**
**User Story:** As an importer, I want to describe my product naturally and get instant, accurate HTS classification.

**Features:**
- Natural language product description input
- AI-powered HTS code suggestion with confidence scores
- Alternative classification options with duty comparisons
- Material detection and attribute recognition
- Conditional codes (value/size thresholds)
- Classification reasoning and explanations

**Technical Requirements:**
- Integration with V10 semantic search engine
- Real-time classification API
- Alternative generation algorithm
- Confidence scoring system

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ PRODUCT CLASSIFICATION                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Product Description:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Wireless Bluetooth earbuds with charging case...       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Country: [🇨🇳 China ▼]    Value: [$10,000]   Qty: [1,000] │
│                                                             │
│ ⚠️  Contains Battery    ⚠️  Wireless Device                │
│                                                             │
│ [Classify Product →]                                        │
│                                                             │
│ Classification Result:                                      │
│ HTS: 8518.30.20.00 (94% confidence)                        │
│ Description: Headphones with microphone, wireless          │
│                                                             │
│ Alternatives:                                               │
│ • 8518.30.90.00 (92%) - Higher duty but may qualify        │
│ • 8518.10.80.00 (89%) - Different category                 │
│                                                             │
│ [View Full Analysis] [Save Product]                         │
└─────────────────────────────────────────────────────────────┘
```

##### **Global Cost Visualization Map** ⭐ LAUNCH FEATURE - POWERED BY FREE GOVERNMENT DATA
**User Story:** As a sourcing manager, I want to see a world map showing production costs for my product in every country based on real import data.

**Features:**
- Interactive world map with REAL cost data overlays
- Color-coded by calculated duty costs from USITC DataWeb
- Country hover details: customs value, calculated duties, effective rates
- Filtering by cost thresholds, duty rates, or trade volumes
- Exportable map views and data downloads

**Data Sources:** ⭐ USITC DATAWEB API (FREE - NO LICENSE NEEDED)
- **Calculated Duties**: Actual duty estimates from Census data
- **Customs Values**: Transaction values for cost calculations
- **Quantities**: Units imported for per-unit cost analysis
- **Country Breakdowns**: By origin country with trade volumes
- **Historical Trends**: Monthly/annual data for trend analysis

**How It Enables Cost Analysis:**
1. Query USITC DataWeb for HTS code + country combinations
2. Get real import statistics: value, calculated duties, quantities
3. Calculate effective duty rates and average unit costs
4. Display on interactive map with optimization recommendations
5. Compare against current sourcing location automatically

**Technical Implementation:**
- USITC DataWeb API integration (free registration required)
- Mapbox for interactive mapping
- Real-time data caching and updates
- Cost calculation engine with duty rate application
- Responsive controls for filtering and exploration

**Competitive Advantage:**
- **Datamyne:** ❌ No cost mapping (BOL data only)
- **CustomsInfo:** ❌ No cost mapping (tariff lookup only)
- **Your Advantage:** ✅ Visual cost analysis powered by government statistics

**UI Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🌍 GLOBAL COST MAP                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Filter: Duty Rate ▼] [Cost Range: $5K-50K ▼] [Region ▼]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                        WORLD MAP                        │ │
│ │                                                         │ │
│ │  🟢 Low Cost ($5K-15K)                                  │ │
│ │  🟡 Medium ($15K-35K)                                   │ │
│ │  🔴 High ($35K+)                                        │ │
│ │                                                         │ │
│ │  Hover: 🇻🇳 Vietnam                                     │ │
│ │         Landed Cost: $12,647 (27% duty)                 │ │
│ │         vs China: $19,147 (78% duty)                    │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Top Countries by Cost Savings:                              │
│ 1. 🇻🇳 Vietnam: Save $6,500 (34% cheaper)                   │
│ 2. 🇲🇽 Mexico: Save $8,797 (46% cheaper)                    │
│ 3. 🇧🇩 Bangladesh: Save $7,300 (38% cheaper)                │
│                                                             │
│ [View Detailed Comparison] [Export Map]                    │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Intelligent Cost Analysis

##### **Dynamic Landed Cost Calculator**
**User Story:** As a financial planner, I want to see my true import costs including all duties, fees, and logistics.

**Features:**
- Real-time duty calculation with all surcharges
- Scenario comparison (different countries/values)
- Freight and insurance estimation
- Customs fees calculation (MPF/HMF)
- Cost breakdown visualization
- Save/compare scenarios

**Data Sources:**
- HTS duty rates (USITC, free)
- Special tariffs (Section 301/IEEPA/232, free)
- Additional duties (Chapter 99, free)
- Fee schedules (CBP, free)

**Technical Implementation:**
- Real-time calculation engine
- Scenario persistence
- Cost comparison algorithms
- PDF/Excel export

##### **Country Optimization Engine**
**User Story:** As an operations manager, I want automated recommendations for cost savings and compliance optimization.

**Features:**
- Country ranking by total landed cost
- FTA qualification opportunities
- Duty optimization suggestions
- Risk-adjusted recommendations
- Trade-off analysis (cost vs. time vs. quality)

**Data Sources:**
- Country tariff profiles (database)
- FTA rules and eligibility (USTR, free)
- Trade statistics (USITC, free)
- Risk factors (compliance data)

#### 3.3 Compliance Intelligence

##### **Automated Compliance Screening**
**User Story:** As a compliance officer, I want instant screening against all denied party lists with audit trails.

**Features:**
- Real-time screening against 10+ government lists
- Batch screening for multiple suppliers
- Fuzzy matching and alias detection
- Compliance risk scoring
- Automated alerts for high-risk matches
- Audit trail and reporting

**Data Sources:**
- OFAC SDN list (free API)
- BIS Entity List (free download)
- BIS Denied Persons (free download)
- State Department lists (free)
- UN sanctions (free API)

**Technical Implementation:**
- Daily data synchronization
- Fuzzy matching algorithms
- Risk scoring engine
- Audit logging system

##### **FTA Qualification Assistant**
**User Story:** As a trade specialist, I want guided assistance to qualify for free trade agreements and maximize savings.

**Features:**
- BOM (Bill of Materials) input interface
- RVC (Regional Value Content) calculation
- Tariff shift analysis
- Qualification checklists
- Documentation requirements
- Savings projections

**Data Sources:**
- FTA rule texts (USTR, free)
- HTS classification rules (database)
- Origin determination guidelines (USTR)

##### **Smart Documentation Engine**
**User Story:** As an import coordinator, I want automated generation of compliance documents and checklists.

**Features:**
- HTS-based document requirements
- PGA (Product Goods Agreement) detection
- Dangerous goods classification
- Country-specific requirements
- Template generation and downloads
- Compliance checklists with deadlines

**Data Sources:**
- CBP import requirements (free)
- PGA agency requirements (free)
- Dangerous goods regulations (DOT, free)
- HTS-specific rules (database)

#### 3.4 Market Intelligence Dashboard

##### **Trade Statistics Explorer** ⭐ CORE FEATURE - USITC DATAWEB POWERED
**User Story:** As a market researcher, I want to explore real trade patterns including calculated duty costs for strategic planning.

**Features:**
- Interactive trade flow visualizations with REAL duty data
- Country/HS code filtering with calculated duty breakdowns
- Trend analysis showing duty rate changes over time
- Market share analysis by value and duty paid
- Export market discovery with cost comparisons
- Duty rate benchmarking across countries/products

**Data Sources:** ⭐ USITC DATAWEB + CENSUS BUREAU (FREE)
- **Calculated Duties**: Estimated duties paid per HTS/country
- **Customs Values**: Transaction values for cost analysis
- **Trade Volumes**: Quantity and value by time period
- **Country of Origin**: Import source breakdowns
- **Port Statistics**: US port-level trade data
- **Historical Archives**: Multi-year trend analysis

**Key Calculations Enabled:**
- **Effective Duty Rate** = Calculated Duties ÷ Customs Value
- **Average Unit Cost** = Customs Value ÷ Quantity
- **Duty per Unit** = Calculated Duties ÷ Quantity
- **Market Cost Benchmarks** = Compare duty rates across countries
- **Trend Analysis** = Duty rate changes over time

##### **Portfolio Monitoring System**
**User Story:** As a product manager, I want to monitor all my products for changes and opportunities.

**Features:**
- Product portfolio dashboard
- Tariff change alerts
- Compliance deadline tracking
- Bulk optimization analysis
- Performance reporting
- Team collaboration tools

**Data Sources:**
- User product database
- Tariff change feeds (USITC, free)
- Federal Register API (free)
- Compliance rule updates (government APIs)

### Phase 2: Licensed Intelligence (Paid Features)

#### 3.5 BOL Data Integration (Business Tier)

##### **Competitor Intelligence**
**User Story:** As a sales manager, I want to see what competitors are importing to identify market opportunities.

**Features:**
- Competitor import analysis by HTS code
- Shipment volume tracking
- Supplier discovery from competitor data
- Market gap identification
- Competitive pricing insights

**Data Sources:**
- BOL shipment data (ImportKey/ImportGenius, licensed)
- Company name matching (entity resolution)

##### **Tarifyx Trusted Suppliers** ⭐ GAME-CHANGING FEATURE
**User Story:** As an importer, I want access to pre-vetted, certified suppliers so I can source reliably without doing my own due diligence.

**Vision:** Tarifyx becomes the **trusted intermediary** - we do the supplier vetting work FOR users, creating a certified supplier network.

**Features:**
- **Pre-Vetted Supplier Database** - Only Tarifyx-certified suppliers
- **Business Size Matching** - Shows which suppliers work with startups/SMBs/enterprise
- **Order Volume Compatibility** - Indicates suppliers for prototypes/small orders vs. mass production
- **Supplier Certification Program** - Rigorous qualification process
- **Risk Scoring & Monitoring** - Continuous compliance monitoring
- **Performance Tracking** - Quality, delivery, pricing data
- **Direct Connection Service** - Facilitate supplier-buyer introductions
- **Supplier Marketplace** - Search, filter, compare certified suppliers

**Business Size Matching Intelligence:**
- **Startup/SMB Friendly** - Suppliers who accept small orders, provide prototypes, flexible MOQs
- **Mid-Market Compatible** - Suppliers for 1K-10K unit orders, established quality processes
- **Enterprise Scale** - Suppliers for 10K+ unit orders, full production capabilities
- **Order Type Indicators** - Prototyping, small-batch, mass production, custom manufacturing
- **Price Point Guidance** - Budget-friendly, mid-range, premium quality tiers

**Certification Process (Tarifyx Does the Work):**
1. **Application Review** - Business legitimacy, financial stability, target customer segments
2. **Business Size Assessment** - Determine supplier's optimal customer profile (startup/SMB/enterprise)
3. **Order Volume Analysis** - Minimum order quantities, production capabilities, flexibility
4. **Compliance Screening** - OFAC, BIS, denied parties (10+ lists)
5. **Quality Verification** - Factory audits, certifications review, quality systems
6. **Capacity Assessment** - Production capability, lead times, scalability
7. **Performance History** - Past delivery records, quality metrics, customer satisfaction
8. **Sustainability Check** - ESG compliance, forced labor prevention, ethical standards

**Value to Users:**
- **Zero Due Diligence** - We handle all supplier vetting
- **Risk Mitigation** - Only work with certified, monitored suppliers
- **Faster Sourcing** - Pre-qualified suppliers ready to quote
- **Quality Assurance** - Verified capabilities and track records
- **Network Effects** - Access to suppliers used by other Tarifyx users

**Revenue Opportunities:**
- **Supplier Certification Fees** - Annual certification for suppliers
- **Premium Listings** - Featured supplier placements
- **Connection Fees** - Revenue share on facilitated deals
- **Premium Supplier Access** - Higher-tier supplier databases

**Data Sources:**
- **Tarifyx-Curated Database** - Our own supplier intelligence
- **CBP/USITC Validation** - Suppliers used by Fortune 500 companies (automatic credibility boost)
- **Third-Party Certifications** - BSCI, WRAP, ISO audits
- **Government Compliance Lists** - OFAC, BIS, denied parties
- **User-Generated Data** - Performance feedback, quality ratings
- **Licensed BOL Data** - When available for supplier discovery

**Smart Seeding Strategy Using Existing Data:**

**Phase 1A: CBP/USITC "Validated" Suppliers (Immediate Launch)**
**Logic:** If Fortune 500 companies import from them consistently, they're likely reliable suppliers

**How It Works:**
1. **Scan USITC DataWeb** - Identify suppliers shipping to major US corporations
2. **Volume Analysis** - Suppliers with consistent high-volume shipments to enterprise customers
3. **Industry Mapping** - Connect supplier names to actual business entities
4. **Credibility Scoring** - Higher scores for suppliers serving multiple Fortune 500 companies
5. **Business Size Inference** - Suppliers serving mostly SMBs vs. enterprises

**Example Validation:**
- **Supplier X** ships 50,000 units/month to Apple, Amazon, Walmart → **Enterprise-grade supplier**
- **Supplier Y** ships 5,000 units/month to local distributors → **SMB-friendly supplier**
- **Supplier Z** ships 500 units/month to various small businesses → **Startup/prototype supplier**

**Benefits:**
- **Immediate Supplier Pool** - 1,000+ suppliers "pre-validated" by market behavior
- **Credibility Without Certification** - "Used by Fortune 500 companies" badge
- **Business Size Intelligence** - Natural segmentation based on customer base
- **Risk Reduction** - Suppliers already proven in high-stakes enterprise relationships

**Phase 1B: Tarifyx Certification Overlay (6 months)**
- Add our rigorous certification process on top of validated suppliers
- Provide "Tarifyx Certified" upgrade path
- Enable supplier self-service application process

**Competitor Comparison:**
- **Datamyne:** ❌ Basic company data only
- **ImportGenius:** ❌ Raw shipment data, no vetting
- **Your Advantage:** ✅ Curated, certified supplier network

**Implementation Approach:**

**Phase 1A: Launch with CBP/USITC Validated Suppliers (Immediate)**
- **Data Mining:** Scan USITC DataWeb for supplier-customer relationships
- **Validation Logic:** Build algorithm to score suppliers by enterprise customer volume
- **Business Size Mapping:** Infer supplier's target market from customer profiles
- **Initial Database:** 500+ suppliers across key categories with credibility scores
- **Launch Feature:** "Suppliers validated by Fortune 500 usage" marketplace

**Phase 1B: Business Size Intelligence (2 months)**
- **Size Classification:** Build supplier profiling for startup/SMB/enterprise compatibility
- **Order Volume Analysis:** MOQ ranges, production capabilities, flexibility indicators
- **Search Filters:** "SMB-friendly suppliers", "enterprise-scale only", "prototype houses"
- **User Onboarding:** Guide users to suppliers matching their business size

**Phase 2: Full Tarifyx Certification Program (4 months)**
- **Certification Framework:** Rigorous vetting process with business size assessment
- **Application Portal:** Supplier self-service certification application
- **Upgrade Path:** Convert "validated" suppliers to "certified" status
- **Performance Monitoring:** Continuous quality and compliance tracking

**Phase 3: Monetization & Scale (6+ months)**
- **Certification Fees:** Tiered pricing based on business size served
- **Premium Features:** Featured listings, priority matching, direct connections
- **Market Expansion:** 2,000+ suppliers, geographic expansion

**Network Effects Potential:**
- **Supplier Flywheel:** Great suppliers want "Tarifyx Certified" badge
- **User Flywheel:** Users trust and prefer certified suppliers
- **Data Flywheel:** More users = more supplier data = better certification

**Why This is Game-Changing:**
1. **Trust Creation** - Tarifyx becomes the authoritative source for supplier quality
2. **Business Size Matching** - First platform to match suppliers to buyer scale
3. **Risk Reduction** - Users avoid suppliers that don't fit their needs or capabilities
4. **Efficiency** - 40% of sourcing time saved through smart matching + pre-vetting
5. **Revenue** - Recurring certification fees + transaction revenue
6. **Moat** - Hard for competitors to replicate validated supplier network

**Business Size Matching UI Example:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 SUPPLIER SEARCH                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Product: [T-Shirts ▼]    Location: [Vietnam ▼]              │
│                                                             │
│ Business Size:                                              │
│ ☐ Any Size      ☑ SMB/Startup (recommended for you)        │
│ ☐ Mid-Market   ☐ Enterprise                                 │
│                                                             │
│ Order Volume:                                               │
│ ☐ Any Volume   ☑ Small Orders (100-1,000 units)            │
│ ☐ Medium       ☐ Large Production                           │
│                                                             │
│ [Search Suppliers]                                         │
│                                                             │
│ 💡 Why SMB/Startup?                                        │
│ Based on your $50K monthly imports, we recommend suppliers │
│ that accept smaller orders and provide flexible terms.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Search Results with Size Intelligence:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 SUPPLIER RESULTS                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🏢 Supplier A - Ho Chi Minh City                           │
│ ⭐ 4.8/5 (23 reviews)    ✅ Tarifyx Validated               │
│ 💼 SMB/Startup Friendly   📦 Small Orders OK               │
│ 💰 $2.50-3.50/unit       ⏱️ 2-3 week lead time              │
│                                                             │
│ Serves: Nike, Adidas, Puma (Fortune 500 validation)        │
│ Minimum: 500 pieces    Quality: ISO 9001                   │
│                                                             │
│ 🏭 Supplier B - Hanoi                                     │
│ ⭐ 4.6/5 (45 reviews)    🏆 Tarifyx Certified               │
│ 🏢 Enterprise Scale      📦 Mass Production Only            │
│ 💰 $1.80-2.20/unit       ⏱️ 6-8 week lead time              │
│                                                             │
│ Serves: Walmart, Target, Costco (Enterprise validation)    │
│ Minimum: 5,000 pieces   Quality: ISO 9001 + BSCI           │
│                                                             │
│ ⚠️ Not recommended for your business size                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Initial Focus Categories (CBP/USITC Validated First):**
- **Textiles/Apparel** - High volume, complex supply chains, diverse supplier sizes
- **Electronics** - Technical requirements, quality critical, enterprise suppliers
- **Consumer Goods** - Safety regulations, mixed supplier capabilities
- **Industrial Parts** - Engineering requirements, prototype to production spectrum

**Business Size Distribution Goals:**
- **40% SMB/Startup Friendly** - Low MOQ, prototype capabilities, flexible terms
- **35% Mid-Market Compatible** - 1K-10K unit orders, established processes
- **25% Enterprise Scale** - 10K+ units, full production capabilities

**Success Metrics:**
- **Launch:** 500+ CBP/USITC validated suppliers at launch
- **Month 3:** 40% of users find suppliers matching their business size
- **Month 6:** 200 certified suppliers (upgraded from validated)
- **Year 1:** 1,000 total suppliers, 30% of sourcing through Tarifyx network
- **Revenue:** 15% of revenue from supplier certification/connection fees

#### 3.6 Advanced Analytics (Enterprise Tier)

##### **Predictive Trade Intelligence**
**Features:**
- Tariff change forecasting
- Market trend prediction
- Seasonal pattern analysis
- Risk assessment modeling

##### **API Integration Suite**
**Features:**
- RESTful API access
- Webhook notifications
- CRM integrations (HubSpot, Salesforce)
- ERP integrations (custom)
- Shipping platform integration

---

## 4. TECHNICAL ARCHITECTURE

### Platform Stack
- **Frontend:** Next.js 14 + TypeScript + Ant Design 5
- **Backend:** Next.js API routes + Node.js
- **Database:** PostgreSQL + Prisma ORM
- **AI Engine:** Custom V10 semantic search + LLM reasoning
- **Maps:** Mapbox for global cost visualization
- **Real-time:** WebSockets for live updates
- **Caching:** Redis for performance
- **File Storage:** AWS S3 for exports/documents

### Core Data Strategy: Free Government APIs First

#### **USITC DataWeb API** - The Foundation
**What It Provides (FREE - No License Needed):**
- **Calculated Duties**: Estimated duties paid per HTS code and country
- **Customs Values**: Transaction values of imports
- **Quantities**: Units imported with measurement units
- **Country Breakdowns**: Import statistics by origin country
- **Time Series**: Monthly and annual historical data
- **Port Statistics**: US port-level import details

**How We Use It for Cost Analysis:**
```
Customs Value ($100,000) ÷ Quantity (10,000 units) = Average Unit Cost ($10/unit)
Calculated Duties ($15,000) ÷ Customs Value ($100,000) = Effective Duty Rate (15%)
Calculated Duties ($15,000) ÷ Quantity (10,000 units) = Duty per Unit ($1.50/unit)
```

**This enables:**
- ✅ Global cost mapping without BOL licenses
- ✅ Duty rate benchmarking by country
- ✅ Cost trend analysis over time
- ✅ Market intelligence dashboards
- ✅ Sourcing cost comparisons

#### **Registration & Access:**
- Free registration via Login.gov
- API access for programmatic queries
- Query builder for custom reports
- Download limits for bulk data

### Project Structure
```
tarifyx/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Main application
│   │   ├── analyze/              # Product analysis flow
│   │   ├── portfolio/            # Product portfolio
│   │   ├── compliance/           # Compliance tools
│   │   ├── intelligence/         # Market intelligence
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── analyze/              # Analysis endpoints
│   │   ├── compliance/           # Compliance APIs
│   │   ├── intelligence/         # Intelligence APIs
│   │   └── webhooks/             # External integrations
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # Basic UI components
│   ├── forms/                    # Form components
│   ├── charts/                   # Data visualization
│   ├── maps/                     # Map components
│   └── layouts/                  # Layout components
├── features/                     # Feature-specific modules
│   ├── classification/           # AI classification
│   ├── cost-analysis/            # Cost calculation
│   ├── compliance/               # Compliance tools
│   ├── intelligence/             # Market intelligence
│   └── portfolio/                # Portfolio management
├── lib/                          # Core utilities
│   ├── ai/                       # AI/ML utilities
│   ├── data/                     # Data processing
│   ├── integrations/             # External APIs
│   └── utils/                    # Helper functions
├── services/                     # Business logic
│   ├── classification/           # Classification services
│   ├── tariff/                   # Tariff calculations
│   ├── compliance/               # Compliance services
│   ├── intelligence/             # Intelligence services
│   └── notifications/            # Alert systems
├── types/                        # TypeScript types
├── hooks/                        # React hooks
├── stores/                       # State management
├── constants/                    # Application constants
├── data/                         # Static data files
└── utils/                        # Utility functions
```

### Data Architecture

#### Free Data Sources (Phase 1)
- **USITC DataWeb API**: Trade statistics and trends
- **USITC HTS API**: Tariff schedules and classifications
- **Federal Register API**: Regulatory changes and alerts
- **OFAC/BIS APIs**: Denied party lists
- **USTR FTA Database**: Free trade agreement rules
- **CBP CROSS**: Tariff rulings database
- **UN Comtrade**: Global trade statistics

#### Free Government Data Sources (Phase 1 - INCLUDED)
- **USITC DataWeb API**: Trade statistics with calculated duties, customs values, quantities
- **Census Bureau USA Trade Online**: Import data with duty calculations and port details
- **USITC HTS API**: Tariff schedules and special program rates
- **Federal Register API**: Tariff changes and regulatory updates
- **OFAC/BIS APIs**: Denied party lists for compliance screening

#### Licensed Data Sources (Phase 2)
- **ImportKey**: US BOL data ($3K-10K/year)
- **ImportGenius**: Global BOL data ($2.4K-24K/year)
- **ZoomInfo**: Company intelligence ($10K-50K/year)
- **D&B**: Corporate hierarchies ($20K-100K/year)

### API Architecture

#### Core APIs
```
POST /api/analyze/product
- Input: Product description, country, value, attributes
- Output: Classification, alternatives, cost analysis

GET /api/intelligence/trade-stats
- Query: HTS code, countries, date range
- Output: Trade volumes, trends, market analysis

POST /api/compliance/screen
- Input: Company names/suppliers
- Output: Denied party matches, risk scores

GET /api/portfolio/products
- Output: User's saved products with monitoring data
```

#### Real-time Features
- **WebSocket connections** for live tariff updates
- **Server-sent events** for compliance alerts
- **Background processing** for bulk analysis
- **Push notifications** for critical alerts

---

## 5. USER EXPERIENCE DESIGN

### Design Principles
1. **Progressive Disclosure**: Show summary → details on demand
2. **Context Preservation**: Data flows between sections automatically
3. **Error Prevention**: Validate inputs, warn about risks
4. **Optimization Focus**: Always show cost-saving opportunities
5. **Compliance First**: Check compliance before showing benefits

### Navigation Architecture

#### Main Navigation
```
🏠 Dashboard          → Overview and quick actions
🏷️ Analyze           → Product analysis workflow
📊 Intelligence      → Market research and trends
✅ Compliance        → Compliance tools and screening
📁 Portfolio         → Saved products and monitoring
⚙️ Settings          → User preferences and billing
```

#### Analysis Flow Navigation
```
1. Input → 2. Classification → 3. Cost Analysis → 4. Optimization → 5. Save
   ↑                                                                    ↓
   └──────────────────── Compliance Checks ────────────────────────────┘
```

### Key User Flows

#### Primary Flow: Product Analysis
```
Landing Page → Product Input → AI Classification → Cost Breakdown
    ↓                                                      ↓
Compliance Check ←────────────────── Country Comparison ←──┘
    ↓
Documentation → Save to Portfolio → Set Alerts
```

#### Secondary Flow: Compliance Screening
```
Compliance Hub → Screen Suppliers → Review Results → Generate Report
    ↓
Add to Watchlist → Set Alerts → Audit Trail
```

#### Tertiary Flow: Market Intelligence
```
Intelligence Dashboard → Explore Trade Data → Filter & Analyze
    ↓
Save Insights → Set Alerts → Share Reports
```

### Mobile Strategy (2026)

#### Progressive Web App Approach
**Why PWA in 2026:**
- 70% of users access work tools on mobile
- Complex workflows need desktop, but mobile for quick checks
- PWA provides app-like experience without app stores
- Offline capabilities for airport/travel use

**Mobile-First Features:**
- **Quick Classification**: Voice input + camera for product photos
- **Alert Notifications**: Push notifications for tariff changes
- **Portfolio Overview**: Dashboard optimized for mobile screens
- **Compliance Checks**: Simplified screening for mobile workflows

**Desktop-Only Features:**
- Complex data analysis and visualizations
- Bulk operations and advanced filtering
- Detailed compliance workflows
- Full map interactions

### Accessibility & Usability

#### WCAG 2.1 AA Compliance
- Keyboard navigation for all interactions
- Screen reader support for data visualizations
- High contrast mode for compliance dashboards
- Adjustable text sizes and spacing

#### Performance Targets
- **First Contentful Paint**: <1.5 seconds
- **Largest Contentful Paint**: <2.5 seconds
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

---

## 6. MONETIZATION & PRICING

### Tier Structure

#### Free Tier ⭐ POWERED BY USITC DATAWEB
**Price:** $0/month
**Limits:**
- 5 classifications per day
- 10 saved products
- Full trade statistics with calculated duties
- Email alerts (1 per week)
- PDF exports only

**Value Proposition:** "Get AI-powered classification + real trade cost data for free - no enterprise licenses needed"

**Free Features Include:**
- ✅ AI HTS classification with alternatives
- ✅ Landed cost calculator (all tariffs included)
- ✅ Global cost map with real duty data
- ✅ Trade statistics explorer (USITC DataWeb)
- ✅ Basic compliance screening
- ✅ FTA qualification calculator
- ✅ Portfolio monitoring with alerts

#### Pro Tier ($99/month)
**Price:** $99/month (billed annually: $990/year)
**Includes:**
- Unlimited classifications
- 100 saved products
- FTA qualification tools
- Full compliance suite (screening, alerts)
- Advanced trade statistics
- Excel/PDF exports
- Priority support

**Value Proposition:** "Complete import intelligence for growing businesses"

#### Business Tier ($299/month) ⭐ ADDS LICENSED BOL DATA
**Price:** $299/month (billed annually: $2,990/year)
**Includes:**
- Everything in Pro
- Licensed BOL shipment data (ImportKey integration)
- Competitor shipment intelligence
- Supplier discovery network
- Bulk analysis (up to 1,000 products)
- Team collaboration (up to 5 users)
- API access (10,000 calls/month)
- Advanced reporting and exports

**Value Proposition:** "Complete competitor & supplier intelligence - see what others import and who supplies them"

#### Enterprise Tier (Custom)
**Price:** Custom pricing
**Includes:**
- Everything in Business
- Company intelligence (D&B data)
- Unlimited API calls
- Custom integrations
- White-label options
- Dedicated support
- SLA guarantees

### Revenue Model

#### Data Cost Coverage
```
ImportKey BOL Data: $10K/year
Required Business Subscribers: 3 (covers cost in month 4)

ZoomInfo Company Data: $30K/year
Required Business Subscribers: 9 (covers cost in month 4)
```

#### Freemium Conversion Funnel
```
Free Users (10K) → Pro Trial (20%) → Pro Subscribers (15%)
                    ↓
              Business Trial (5%) → Business Subscribers (50%)
```

---

## 7. INTEGRATION ROADMAP

### Phase 1 Integrations (Launch)
- **Email**: SendGrid for notifications and alerts
- **Analytics**: Mixpanel for user behavior tracking
- **Error Monitoring**: Sentry for application monitoring
- **File Storage**: AWS S3 for document exports

### Phase 2 Integrations (Q2 2026)
- **CRM**: HubSpot and Salesforce connectors
- **Shipping**: FedEx, UPS, DHL tracking integration
- **Accounting**: QuickBooks and Xero for cost reconciliation
- **ERP**: Basic webhooks for major ERPs (SAP, Oracle, Microsoft Dynamics)

### Phase 3 Integrations (Q3 2026)
- **Marketplaces**: Shopify, WooCommerce, BigCommerce for product sync
- **Logistics**: Freightos, Flexport for shipping quotes
- **Customs**: Descartes CustomsInfo for complementary services
- **Banking**: Stripe Atlas for company formation services

### API Strategy
- **RESTful API** for all core functionality
- **Webhook support** for real-time updates
- **OAuth 2.0** for third-party integrations
- **Rate limiting** based on subscription tier
- **API versioning** for backward compatibility

---

## 8. DEVELOPMENT ROADMAP

### Phase 1: MVP Launch (Free Government Data)
**Duration:** 8 weeks
**Features:**
- AI classification engine with alternatives
- Landed cost calculator with all tariffs
- Global cost map powered by USITC DataWeb
- Comprehensive compliance screening (OFAC/BIS)
- Trade statistics explorer with calculated duties
- FTA qualification calculator
- Portfolio monitoring with tariff alerts

**Success Criteria:**
- 1,000 beta users
- 90% uptime
- <3 second page load times
- 80% user engagement with cost mapping features

### Phase 2: Business Intelligence (Paid Features)
**Duration:** 12 weeks
**Features:**
- BOL data integration (ImportKey)
- Competitor intelligence
- Supplier discovery
- Advanced analytics
- Team collaboration
- API access

**Success Criteria:**
- 50 Business tier subscribers
- 70% free-to-paid conversion
- Data costs covered by revenue

### Phase 3: Enterprise Expansion
**Duration:** 16 weeks
**Features:**
- Company intelligence (ZoomInfo/D&B)
- Advanced integrations
- White-label options
- Enterprise security features

**Success Criteria:**
- 200+ Enterprise customers
- $1M+ ARR
- Market leadership in SMB trade intelligence

---

## 9. SUCCESS METRICS & KPIs

### User Acquisition
- **Monthly Active Users (MAU):** Target 10K in year 1
- **Free-to-Paid Conversion:** Target 15%
- **Customer Acquisition Cost (CAC):** Target <$50
- **Viral Coefficient:** Target 1.2 (users invite others)

### Product Metrics
- **Feature Adoption:** 70% of users try AI classification
- **Time to Value:** <5 minutes for first classification
- **Task Completion:** 85% complete full analysis workflow
- **Support Tickets:** <5 per 1,000 users/month

### Business Metrics
- **Monthly Recurring Revenue (MRR):** Target $50K in month 6
- **Annual Recurring Revenue (ARR):** Target $500K in year 1
- **Customer Lifetime Value (LTV):** Target $2,500
- **Churn Rate:** Target <5% monthly

### Technical Metrics
- **Uptime:** 99.9% availability
- **Performance:** <2 second average response time
- **Data Accuracy:** 95%+ classification accuracy
- **Security:** SOC 2 Type II compliance

---

## 10. RISKS & MITIGATION

### Technical Risks
- **AI Accuracy:** Comprehensive testing + user feedback loops
- **Data Reliability:** Multiple government API fallbacks + caching
- **Performance:** CDN + caching + database optimization

### Business Risks
- **Data Licensing Costs:** Start with cheapest provider, prove demand first
- **Competition:** Focus on AI/UX advantages they can't easily copy
- **Regulatory Changes:** Monitor trade policy, diversify data sources

### Market Risks
- **Adoption Resistance:** Free tier reduces friction, education content drives awareness
- **SMB Budget Constraints:** Affordable pricing + ROI demonstrations
- **Enterprise Competition:** Focus on SMB market where competitors are weak

---

## 11. COMPETITIVE DIFFERENTIATION

### vs Datamyne ($10K+/year)
- **AI Classification:** We have it, they don't
- **Cost Visualization:** Global map vs basic tables
- **UX:** Modern web app vs 2010s enterprise
- **Pricing:** $99-299/month vs $10K+/year

### vs ImportGenius ($2.4K-24K/year)
- **AI Features:** Classification + optimization vs basic data
- **Compliance Depth:** Full suite vs basic screening
- **FTA Tools:** Qualification calculator vs none
- **Integration:** API + webhooks vs basic exports

### vs CustomsInfo ($10K+/year)
- **Combined Intelligence:** Trade + compliance in one platform
- **Cost Analysis:** Full landed cost vs tariff lookup only
- **Automation:** AI-driven workflows vs manual processes
- **User Experience:** Guided flow vs complex enterprise interface

---

## 12. LAUNCH STRATEGY

### Pre-Launch (Month 1-2)
- **Beta Testing:** 500 users, focus on AI accuracy and UX
- **Content Creation:** Blog posts, tutorials, case studies
- **SEO Optimization:** Target "import duty calculator", "HTS classification"
- **Social Proof:** Testimonials from beta users

### Launch (Month 3)
- **Soft Launch:** Free tier only, gather feedback
- **Marketing:** LinkedIn campaigns, trade association partnerships
- **PR:** TechCrunch, Trade publications coverage
- **Partnerships:** Customs brokers, freight forwarders

### Post-Launch (Month 4+)
- **Paid Feature Rollout:** Pro tier first, then Business
- **Customer Success:** Onboarding flows, success metrics tracking
- **Expansion:** Additional free government data sources
- **Enterprise Sales:** Target mid-market companies

---

## APPENDIX A: WIRE FRAMES

### Main Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏠 TARIFYX DASHBOARD                                          ⚙️ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Welcome back, Sarah! Here's your import intelligence overview. │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│ │ 📊 Recent      │ │ 💰 Cost Savings │ │ ⚠️ Alerts        │     │
│ │ Analyses       │ │ This Month      │ │ (2 active)      │     │
│ │                 │ │                 │ │                 │     │
│ │ 3 products      │ │ $12,450 saved  │ │ Tariff changes  │     │
│ │ analyzed        │ │                 │ │ Compliance      │     │
│ │                 │ │ [View Details]  │ │ deadlines       │     │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘     │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🚀 QUICK ACTIONS                                             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │                                                             │ │
│ │ [🏷️ Analyze Product] [📊 Market Intelligence] [✅ Compliance] │ │
│ │ [📁 My Portfolio] [🌍 Global Cost Map] [📈 Trade Trends]     │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📈 MARKET INSIGHTS                                           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Top trending products this month:                           │ │
│ │ • HTS 8518.30 (Headphones): +15% imports                    │ │
│ │ • HTS 6109.10 (T-shirts): +8% imports                       │ │
│ │ • HTS 8471.30 (Laptops): +22% imports                       │ │
│ │                                                             │ │
│ │ [Explore Trends]                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Product Analysis Flow
```
┌─────────────────────────────────────────────────────────────────┐
│ 🧭 PRODUCT ANALYSIS WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Step 1 of 5: Product Information                                │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%     │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏷️ PRODUCT CLASSIFICATION                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Product Description:                                        │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Cotton blend polo shirts, short sleeve, for men...     │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ Country: 🇨🇳 China    Value: $25,000    Quantity: 2,000   │ │
│ │                                                             │ │
│ │ Material: [Cotton Blend ▼]    End Use: [Apparel ▼]         │ │
│ │                                                             │ │
│ │ Special Attributes:                                         │ │
│ │ ☐ Contains battery     ☐ For children     ☐ Medical device │ │
│ │ ☐ Food contact         ☐ Hazardous         ☐ Wireless       │ │
│ │                                                             │ │
│ │ [Analyze Product →]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💡 Pro tip: The more details you provide, the more accurate    │
│    the classification and cost analysis will be.               │
│                                                                 │
│ [← Back] [Skip to Results]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Global Cost Map
```
┌─────────────────────────────────────────────────────────────────┐
│ 🌍 GLOBAL COST MAP - Polo Shirts from China                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Filter Products ▼] [Cost Range ▼] [Duty Focus ▼] [Export ▼]    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                          WORLD COST MAP                     │ │
│ │                                                             │ │
│ │  🟢 CHEAPEST                                               │ │
│ │     Vietnam: $8,750 (35% duty)                             │ │
│ │     Bangladesh: $9,200 (38% duty)                          │ │
│ │     Mexico: $7,850 (0% duty*)                              │ │
│ │                                                             │ │
│ │  🟡 MODERATE                                               │ │
│ │     India: $11,500 (45% duty)                              │ │
│ │     Indonesia: $10,750 (42% duty)                          │ │
│ │                                                             │ │
│ │  🔴 MOST EXPENSIVE                                         │ │
│ │     China: $18,750 (78% duty) ← Current                    │ │
│ │                                                             │ │
│ │  * Requires USMCA qualification                            │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💰 COST BREAKDOWN                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Country      │ Landed Cost │ Duty Rate │ Savings vs China  │ │
│ │ ────────────────────────────────────────────────────────── │ │
│ │ 🇲🇽 Mexico     │ $7,850     │ 0%*       │ $10,900 (58%)     │ │
│ │ 🇻🇳 Vietnam    │ $8,750     │ 35%       │ $10,000 (53%)     │ │
│ │ 🇧🇩 Bangladesh │ $9,200     │ 38%       │ $9,550 (51%)      │ │
│ │ 🇮🇩 Indonesia  │ $10,750    │ 42%       │ $8,000 (43%)      │ │
│ │ 🇮🇳 India      │ $11,500    │ 45%       │ $7,250 (39%)      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [View Mexico USMCA Guide] [Compare All Countries] [Export Map]  │
└─────────────────────────────────────────────────────────────────┘
```

---

*This comprehensive PRD provides everything a development team needs to build Tarifyx. The platform combines AI-powered intelligence with beautiful UX to deliver trade compliance and optimization tools that SMBs can actually afford and use effectively.*

---

## WHAT'S MISSING: ROADMAP TO GREATNESS

### Current Product Status ✅
Tarifyx has strong foundations in AI classification, cost analysis, and compliance. But to become truly great, we need to address the **full sourcing/manufacturing/logistics workflow**.

### Critical Gaps for Product-Market Fit 🚨

#### 1. **SUPPLIER MANAGEMENT ECOSYSTEM**
**Missing Today:**
- End-to-end supplier qualification workflows
- Performance tracking and scoring
- Contract management integration
- Risk assessment and monitoring

**Why It Matters:** Importers spend 40% of time on supplier research/validation

**Impact:** Users need a "supplier CRM" integrated with trade intelligence

#### 2. **MANUFACTURING COST INTELLIGENCE**
**Missing Today:**
- BOM-level cost optimization
- Factory location intelligence (labor, infrastructure)
- Lead time analysis and optimization
- Capacity planning tools

**Why It Matters:** Manufacturing costs vary 200-300% by location

**Impact:** Need deep manufacturing economics data and modeling

#### 3. **LOGISTICS OPERATIONS INTEGRATION**
**Missing Today:**
- Real-time freight rate shopping
- Customs clearance tracking
- Port performance monitoring
- Last-mile delivery optimization

**Why It Matters:** Logistics = 20-30% of total landed cost

**Impact:** Need live logistics marketplace integration

#### 4. **RISK MANAGEMENT & PREDICTIVE INTELLIGENCE**
**Missing Today:**
- Geopolitical risk monitoring
- Supply chain disruption alerts
- Tariff escalation scenario planning
- Currency risk hedging recommendations

**Why It Matters:** 2020-2022 disruptions cost $100B+ globally

**Impact:** Need predictive analytics and scenario planning

#### 5. **OPERATIONAL WORKFLOW AUTOMATION**
**Missing Today:**
- ERP system integration
- E-commerce platform sync
- Automated reordering systems
- Approval workflow automation

**Why It Matters:** Manual processes cost 15-25 hours/week

**Impact:** Need seamless integration with existing business systems

#### 6. **REAL-TIME MARKET INTELLIGENCE**
**Missing Today:**
- Live freight rates and availability
- Competitor pricing signals
- Demand forecasting
- Quality and certification data

**Why It Matters:** Stale data costs 10-20% more

**Impact:** Need real-time data feeds and market signals

### THE VISION: BECOME THE TRADE OPERATING SYSTEM

**Current:** "Trade intelligence tool"
**Great:** "Complete sourcing-to-delivery platform"

**Complete Workflow Integration:**
```
Product Concept → AI Classification → Supplier Discovery → Cost Modeling
    ↓
Risk Assessment → Manufacturing Planning → Logistics Optimization
    ↓
Contract Execution → Quality Monitoring → Delivery Tracking
    ↓
Performance Analytics → Automated Reordering → Continuous Optimization
```

### IMMEDIATE NEXT STEPS (HIGH IMPACT, LOW EFFORT)

#### **Week 1-2: Freight Integration**
- Integrate with freight APIs (Flexport, Freightos, etc.)
- Add real-time rate shopping to cost calculator
- Enable logistics cost optimization

#### **Week 3-4: Supplier Qualification**
- Build basic supplier vetting workflow
- Add supplier scorecard system
- Integrate with D&B for basic company intelligence

#### **Month 2: ERP Integration Framework**
- Start with QuickBooks/Xero integration
- Enable automatic cost updates and PO creation
- Add accounting workflow automation

#### **Month 3: Mobile Field Operations**
- Launch PWA with camera integration
- Add supplier visit checklists
- Enable offline quality inspection workflows

### WHAT WOULD MAKE TARIFYX IRREPLACEABLE

#### **1. One-Click Import Workflow**
User finds product → System automatically:
- Classifies HTS code
- Finds qualified suppliers
- Calculates all costs
- Generates compliance documents
- Creates purchase orders
- Sets up tracking and alerts

#### **2. Network Effects Platform**
- User-generated supplier reviews
- Shared quality inspection data
- Industry cost benchmarking
- Success story sharing

#### **3. Predictive Intelligence**
- Tariff escalation forecasting
- Supply chain disruption alerts
- Demand forecasting integration
- Automated risk mitigation recommendations

#### **4. Sustainability Integration**
- Carbon footprint tracking
- ESG supplier scoring
- Forced labor prevention automation
- Regulatory compliance forecasting

### COMPETITIVE ANALYSIS: WHAT MAKES GREAT B2B PRODUCTS

**HubSpot:** Free tier + content marketing + integrations → Network effects
**QuickBooks:** Simple core + extensive integrations + mobile → Operational necessity
**Salesforce:** Platform approach + AppExchange → Ecosystem dominance
**ShipBob:** Operations focus + real-time tracking → Workflow integration

**Common Pattern:** Start simple, build integrations, create network effects, become indispensable.

### THE DECISION FRAMEWORK

**To become great, Tarifyx needs to evolve from "trade intelligence" to "trade operations platform"**

**Key Questions:**
1. **Workflow Integration:** How deeply embedded are we in users' daily operations?
2. **Data Freshness:** How real-time and actionable is our information?
3. **Network Effects:** Are users creating value for other users?
4. **Mobile Enablement:** Can users operate from anywhere in the supply chain?
5. **Automation Level:** How much manual work do we eliminate?

**Current Score:** 6/10 (Good foundation, needs operational depth)

**Target Score:** 9/10 (Indispensable operating system for global trade)

### NEXT ACTIONS

**Immediate (Next 30 Days):**
1. **Freight API Integration** - Add real-time logistics costs
2. **Supplier Workflow** - Build qualification and vetting system
3. **Mobile Optimization** - Enable field operations
4. **User Interviews** - Validate sourcing pain points

**Short-term (Next 90 Days):**
1. **ERP Integration** - QuickBooks/Xero connectivity
2. **Performance Tracking** - Supplier and logistics metrics
3. **Automation Framework** - Workflow automation capabilities

**Long-term (6-12 Months):**
1. **Network Platform** - User-generated supplier intelligence
2. **Predictive Analytics** - Risk and demand forecasting
3. **Ecosystem Building** - Developer APIs and integrations

## STRATEGIC ROADMAP: CORE FIRST vs OPERATIONAL ENHANCEMENTS

### RECOMMENDATION: **HYBRID APPROACH** 🎯

**Launch MVP with core + 3 high-impact operational features, then expand.**

#### **WHY THIS BALANCED APPROACH**

**Arguments FOR launching core first:**
- ✅ Faster time to market (3 months vs 6-9 months)
- ✅ Lower development risk - validate core AI/cost value
- ✅ Revenue validation before major investments
- ✅ Focus on proven features, iterate from feedback

**Arguments AGAINST waiting on operations:**
- ❌ Competitors (Datamyne) have operational features
- ❌ Users need workflow integration to switch from manual processes
- ❌ Network effects require operational features
- ❌ Fundraising needs comprehensive product

**Solution:** **Launch strong MVP** with core + key operational differentiators

---

### PHASE 1: STRONG MVP LAUNCH (Months 1-3) 🚀

#### **Core Features (Already Built/Planned)**
- ✅ AI-powered HTS classification
- ✅ Global cost map (USITC DataWeb powered)
- ✅ Landed cost calculator
- ✅ Compliance suite (OFAC/BIS/FTA)
- ✅ Trade statistics dashboard

#### **3 High-Impact Operational Features (ADD NOW)**
1. **Freight Rate Integration** 🔥 - Real-time logistics cost optimization
2. **Tarifyx Trusted Suppliers** 🔥 - PRE-VETTED SUPPLIER NETWORK (GAME-CHANGER)
3. **Mobile PWA Optimization** ⏰ - ADD LATER (not top priority)

**Why This Specific Mix:**
- **Freight**: Immediate revenue impact (20-30% of landed cost visibility)
- **Trusted Suppliers**: 40% of sourcing time saved + network effects + revenue moat
- **Mobile**: Useful but can wait - focus on core value first

**Effort:** ~6-8 weeks additional development (supplier network requires more work)
**Impact:** Transforms from "tool" to "trusted sourcing platform"

---

### PHASE 2: OPERATIONAL DEPTH (Months 4-6) 📈

#### **Supplier Ecosystem Expansion**
- Advanced supplier discovery (beyond BOL data)
- Performance tracking and analytics
- Contract management integration
- Risk scoring and monitoring

#### **Logistics Integration**
- Customs clearance tracking
- Port performance monitoring
- Warehouse optimization
- Advanced freight analytics

#### **Workflow Automation**
- ERP integration (QuickBooks primary)
- E-commerce platform sync
- Automated reordering systems
- Approval workflow automation

---

### PHASE 3: NETWORK EFFECTS & PREDICTIVE INTELLIGENCE (Months 7-12) 🌐

#### **User-Generated Value**
- Supplier reviews and ratings
- Shared quality inspection data
- Industry cost benchmarking
- Success stories platform

#### **Advanced Analytics**
- Predictive tariff modeling
- Supply chain risk forecasting
- Demand prediction integration
- Automated optimization recommendations

#### **Ecosystem Expansion**
- Developer API marketplace
- Third-party integrations
- White-label capabilities
- Enterprise features

---

### RISK ASSESSMENT: CORE FIRST vs OPERATIONAL FIRST

#### **Risk of Launching Core Only**
- **Low:** Users might not switch without operational workflow integration
- **Medium:** Competitors with operational features might dominate
- **High:** May need major pivot after launch

#### **Risk of Adding Too Much Initially**
- **High:** Development timeline extends 3-6 months
- **Medium:** Increased complexity and bug potential
- **Low:** Feature bloat, confused positioning

#### **Hybrid Approach Risk**
- **Low:** Balanced timeline and feature set
- **Low:** Clear differentiation from competitors
- **Medium:** Requires careful feature prioritization

**CONCLUSION: Hybrid approach has the best risk/reward profile**

---

### COMPETITIVE TIMING ANALYSIS

#### **Market Window Opportunity**
- **Datamyne/CustomsInfo:** Enterprise-focused, expensive, legacy UX
- **ImportGenius/Panjiva:** Basic tools, limited AI/features
- **New Entrants:** AI-first approaches emerging but few operational

**Tarifyx Opportunity:** First AI-powered platform with operational depth

#### **First-Mover Advantage**
- **AI Classification:** Already leading
- **Cost Intelligence:** Unique with USITC integration
- **Operational Features:** Can be first to market with integrated workflow

**Recommendation:** Launch with operational differentiators to establish category leadership

---

### RESOURCE ALLOCATION STRATEGY

#### **Development Team Focus**
**Months 1-3:** Core + 3 operational features
- **Frontend:** 2 developers
- **Backend:** 2 developers
- **Design:** 1 designer
- **Product:** 1 PM

**Total Team:** 6 people for 3 months = **18 person-months**

#### **vs Full Operational Suite**
**Months 1-6:** All operational features
- **Frontend:** 3 developers
- **Backend:** 3 developers
- **Integration:** 2 developers
- **Design:** 1 designer
- **Product:** 1 PM

**Total Team:** 10 people for 6 months = **60 person-months**

**Cost Savings:** 70% reduction in initial development cost

---

### SUCCESS METRICS BY APPROACH

#### **Strong MVP Approach (Recommended)**
- **Month 3:** Launch with 1,000 users
- **Month 6:** 5,000 users, 60% operational feature usage
- **Month 12:** 25,000 users, $250K MRR

#### **Full Operational Approach**
- **Month 6:** Launch with comprehensive features
- **Month 12:** 15,000 users, $150K MRR

**Analysis:** Strong MVP gets to market faster, validates product-market fit earlier, and can scale faster based on real user data.

---

### FINAL RECOMMENDATION: **LAUNCH STRONG MVP NOW** 🎯

**Strategy:**
1. **Complete core platform** (AI classification, cost analysis, compliance)
2. **Add 3 operational differentiators** (freight, supplier workflow, mobile)
3. **Launch in 3 months** with validated product-market fit
4. **Scale operations features** based on user feedback and revenue

**Why this works:**
- **Speed:** Get to market before competitors catch up
- **Validation:** Prove users pay for trade intelligence
- **Differentiation:** Operational features create stickiness
- **Scalability:** Can add advanced features without platform rewrite

**Next Steps:**
1. **Prioritize the 3 operational features** for Phase 1
2. **Develop integration roadmap** for Phase 2
3. **Plan user research** to validate operational needs
4. **Launch planning** starting now

**Question:** Which of the 3 operational features (freight integration, supplier workflow, mobile PWA) should we tackle first?

---

## BUSINESS SIZE MATCHING: THE SECRET WEAPON 🎯

### Why This Matters More Than You Think

**The Supplier Size Mismatch Problem:**
- **Foxconn** serves Apple, Samsung, Sony (enterprise) - won't work with your 1,000-unit startup order
- **Prototype houses** excel at 50-unit runs but can't scale to 50,000 units
- **Quality-focused suppliers** have high minimums that crush small businesses
- **Enterprise suppliers** have complex processes that overwhelm SMBs

**Result:** 60% of sourcing failures happen because suppliers and buyers are incompatible by scale

### Tarifyx Business Size Intelligence

**Supplier Profiling:**
- **🎯 Startup/SMB Friendly** - Low MOQs (100-1,000 units), flexible terms, prototype capabilities
- **🏢 Mid-Market Compatible** - 1K-10K units, established quality, reasonable lead times
- **🏭 Enterprise Scale** - 10K+ units, full production, complex compliance requirements

**Smart Matching Algorithm:**
1. **User Profiling** - Based on import volume, business size, order frequency
2. **Compatibility Scoring** - How well supplier capabilities match buyer needs
3. **Recommendation Engine** - Suggests suppliers in the right size category
4. **Education** - Explains why certain suppliers aren't recommended

**Data Sources for Size Intelligence:**
- **CBP/USITC Patterns** - What order volumes suppliers typically handle
- **Supplier Self-Reporting** - During certification process
- **User Feedback** - "This supplier was great for my small business"
- **Market Intelligence** - Industry benchmarks for supplier capabilities

### Competitive Differentiation

**vs Datamyne:** Shows basic company data, no size matching
**vs ImportGenius:** Raw shipment data, no supplier capability insights
**vs Panjiva:** Enterprise focus, no SMB supplier recommendations

**Tarifyx Advantage:** **First platform to intelligently match suppliers to buyer business size**

### Implementation Priority

**Phase 1:** Basic size indicators (SMB/Enterprise flags)
**Phase 2:** Detailed compatibility scoring
**Phase 3:** AI-powered matching recommendations

**Impact:** Reduces sourcing failures by 50%, increases user satisfaction dramatically

---

## DEVELOPER-READY TECHNICAL SPECIFICATIONS

### Database Schema (PostgreSQL + Prisma)

#### Core Tables
```sql
-- Users and Authentication
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  companyName   String?
  businessSize  BusinessSize
  importVolume  ImportVolume
  tier          SubscriptionTier @default(FREE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  products      Product[]
  searches      Search[]
  subscriptions Subscription[]
}

-- Product Classifications
model Product {
  id              String   @id @default(cuid())
  userId          String
  description     String
  htsCode         String?
  category        String?
  countryCode     String
  value           Float
  quantity        Int
  attributes      Json     // battery, hazardous, etc.
  classification  Json?    // AI results
  costAnalysis    Json?    // duty calculations
  complianceCheck Json?    // screening results
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])
}

-- Supplier Database
model Supplier {
  id                String            @id @default(cuid())
  name              String
  countryCode       String
  businessSize      BusinessSize[]    // SMB, Enterprise, etc.
  orderTypes        OrderType[]       // Prototype, Production, etc.
  certifications    Certification[]
  minOrderQuantity  Int?
  leadTime          Int?              // days
  validationSource  ValidationSource  // CBP/USITC vs Certified
  credibilityScore  Float             @default(0)
  contactInfo       Json?
  performanceData   Json?
  status            SupplierStatus    @default(VALIDATED)
  createdAt         DateTime          @default(now())

  // Relations
  reviews           SupplierReview[]
  connections       SupplierConnection[]
}

-- Trade Intelligence Data
model TradeData {
  id            String   @id @default(cuid())
  htsCode       String
  countryCode   String
  customsValue  Float
  calculatedDuties Float
  quantity      Float
  quantityUnit  String
  year          Int
  month         Int?
  source        DataSource // USITC, CBP, etc.
  createdAt     DateTime @default(now())

  @@unique([htsCode, countryCode, year, month])
}
```

#### Key Enums
```typescript
enum BusinessSize {
  STARTUP     // < $1M revenue, < 50 employees
  SMB         // $1M-10M revenue, 50-200 employees
  MID_MARKET  // $10M-100M revenue, 200-1000 employees
  ENTERPRISE  // > $100M revenue, > 1000 employees
}

enum OrderType {
  PROTOTYPE     // 1-100 units
  SMALL_BATCH   // 100-1000 units
  MEDIUM_RUN    // 1000-10000 units
  MASS_PRODUCTION // 10000+ units
}

enum ValidationSource {
  CBP_USITC     // Validated by Fortune 500 usage
  CERTIFIED     // Full Tarifyx certification
  SELF_REPORTED // Supplier provided
}
```

### API Architecture

#### Core API Endpoints

```typescript
// Classification & Analysis
POST /api/analyze/product
- Body: { description, countryCode, value, quantity, attributes }
- Returns: { htsCode, confidence, alternatives, costAnalysis }

GET /api/intelligence/trade-stats
- Query: { htsCode, countryCode, dateRange }
- Returns: { volume, value, dutyRate, trends }

// Supplier Intelligence
GET /api/suppliers/search
- Query: { category, country, businessSize, orderType, minRating }
- Returns: { suppliers[], totalCount, filters }

GET /api/suppliers/:id
- Returns: { supplier, reviews, performance, certifications }

// Compliance
POST /api/compliance/screen
- Body: { supplierNames[], checkLists }
- Returns: { results[], alerts[], recommendations }

// Cost Analysis
POST /api/cost/calculate
- Body: { htsCode, countryCode, value, quantity, shipping }
- Returns: { breakdown, alternatives, savings }
```

#### Real-time Features

```typescript
// WebSocket for live updates
ws://api.tarifyx.com/live
- Events: tariff_changes, supplier_updates, cost_alerts

// Server-Sent Events for notifications
GET /api/notifications/stream
- Headers: { Authorization: Bearer <token> }
- Events: alerts, updates, recommendations
```

### Component Architecture

#### Page Structure
```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx              // Overview dashboard
│   │   ├── analytics/page.tsx    // Trade analytics
│   │   └── suppliers/page.tsx    // Supplier marketplace
│   ├── analyze/
│   │   ├── page.tsx              // Product analysis
│   │   └── results/page.tsx      // Analysis results
│   ├── portfolio/
│   │   ├── page.tsx              // Product portfolio
│   │   └── monitoring/page.tsx   // Alert management
│   └── settings/
│       └── page.tsx              // User preferences
```

#### Feature Components
```
src/features/
├── classification/
│   ├── components/
│   │   ├── ProductInput.tsx
│   │   ├── ClassificationResults.tsx
│   │   └── AlternativeCodes.tsx
│   ├── hooks/
│   │   └── useClassification.ts
│   └── services/
│       └── classificationService.ts

├── cost-analysis/
│   ├── components/
│   │   ├── CostBreakdown.tsx
│   │   ├── CountryComparison.tsx
│   │   └── GlobalCostMap.tsx
│   ├── hooks/
│   │   └── useCostAnalysis.ts
│   └── services/
│       └── costCalculationService.ts

├── suppliers/
│   ├── components/
│   │   ├── SupplierSearch.tsx
│   │   ├── SupplierCard.tsx
│   │   ├── BusinessSizeFilter.tsx
│   │   └── SupplierProfile.tsx
│   ├── hooks/
│   │   └── useSupplierSearch.ts
│   └── services/
│       └── supplierService.ts
```

### Data Flow Architecture

#### Product Analysis Flow
```
1. User Input → ProductInput Component
2. API Call → POST /api/analyze/product
3. AI Processing → V10 Classification Engine
4. Cost Calculation → Tariff Registry + USITC Data
5. Compliance Check → OFAC/BIS Screening
6. Results Display → ClassificationResults Component
7. Save to Portfolio → Database Storage
```

#### Supplier Search Flow
```
1. Search Criteria → SupplierSearch Component
2. Business Size Matching → Filter Algorithm
3. CBP/USITC Validation → Credibility Scoring
4. Results Ranking → Compatibility Algorithm
5. Display Results → SupplierCard Components
6. User Interaction → Contact/Review Actions
```

#### Real-time Updates Flow
```
1. Background Jobs → Tariff Change Monitoring
2. WebSocket Push → Client Notification
3. UI Updates → Live Data Refresh
4. User Alerts → Notification Center
```

### Navigation & Routing Logic

#### Main Navigation Rules
- **Dashboard**: Always accessible, shows personalized insights
- **Analyze**: Core workflow, requires authentication
- **Portfolio**: Requires PRO tier or higher
- **Suppliers**: Requires PRO tier, business features for premium
- **Settings**: User preferences and billing

#### Progressive Disclosure
```
Free Tier → Basic features only
Pro Tier → + FTA tools, compliance, unlimited
Business → + Supplier intelligence, bulk analysis
Enterprise → + API access, custom integrations
```

#### Contextual Navigation
- **From Classification**: Direct links to cost analysis, supplier search
- **From Cost Map**: Links to country-specific supplier searches
- **From Compliance**: Links to supplier vetting and certification
- **From Alerts**: Direct links to affected products/suppliers

### State Management

#### Global State (Zustand)
```typescript
interface AppState {
  user: User | null
  currentAnalysis: ProductAnalysis | null
  searchFilters: SupplierFilters
  notifications: Notification[]
  theme: 'light' | 'dark'
}
```

#### Component State (React Query)
```typescript
// Server state management
const { data: products } = useQuery(['products', userId], fetchProducts)
const { data: suppliers } = useQuery(['suppliers', searchFilters], fetchSuppliers)

// Mutations
const createAnalysis = useMutation(createProductAnalysis)
const updateSupplier = useMutation(updateSupplierData)
```

### Error Handling & Validation

#### API Error Responses
```typescript
interface ApiError {
  code: string
  message: string
  field?: string
  details?: any
}

// HTTP Status Mapping
400 → Validation Error (field-level)
401 → Authentication Required
403 → Insufficient Permissions (tier check)
429 → Rate Limited
500 → Server Error (retry logic)
```

#### Client-Side Validation
```typescript
const productSchema = z.object({
  description: z.string().min(10).max(1000),
  countryCode: z.string().length(2),
  value: z.number().positive().max(10000000),
  quantity: z.number().positive().max(1000000),
  attributes: z.object({
    containsBattery: z.boolean(),
    hazardous: z.boolean(),
    // ... more attributes
  })
})
```

### Testing Strategy

#### Unit Tests (Jest + React Testing Library)
```typescript
// Component testing
describe('ProductInput', () => {
  it('validates required fields', () => {
    render(<ProductInput />)
    // Test validation logic
  })
})

// Service testing
describe('classificationService', () => {
  it('handles API errors gracefully', () => {
    // Mock API failure
    // Test error handling
  })
})
```

#### Integration Tests (Playwright)
```typescript
// E2E user flows
test('complete product analysis workflow', async ({ page }) => {
  await page.goto('/analyze')
  await page.fill('[data-testid="description"]', 'Wireless earbuds')
  await page.selectOption('[data-testid="country"]', 'CN')
  await page.fill('[data-testid="value"]', '10000')
  await page.click('[data-testid="analyze"]')
  await expect(page.locator('[data-testid="hts-code"]')).toBeVisible()
})
```

#### Performance Benchmarks
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **API Response Time**: <200ms (cached), <500ms (fresh)
- **Search Results**: <100ms for simple queries, <500ms for complex

### Deployment Architecture

#### Infrastructure
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   AWS S3        │
│   Frontend      │────│   Database      │────│   File Storage  │
│   (Next.js)     │    │   (PostgreSQL)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Upstash       │
                    │   Redis Cache   │
                    └─────────────────┘
```

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action@v1
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
```

This provides the complete technical foundation for building Tarifyx. The architecture is designed for scalability, maintainability, and rapid iteration while ensuring excellent user experience and performance.