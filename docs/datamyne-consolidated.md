# Datamyne & CustomsInfo - Core Functionality Analysis

## Executive Summary

**Two Descartes Products Analyzed:**
- **Datamyne**: Trade intelligence platform answering "Who is trading what, with whom, and where?"
- **CustomsInfo**: Tariff research & compliance platform answering "What is the tariff classification and duty rate?"

---

## DATAMYNE: Trade Intelligence Platform

### Core Value Proposition
Trade intelligence platform that reveals global trade flows through Bills of Lading (BOL) data and customs declarations.

### Key Use Cases
- **Competitor Intelligence**: See what competitors import/export
- **Supplier Discovery**: Find suppliers by analyzing competitor shipments
- **Market Research**: Trade volumes, trends, country flows
- **Lead Generation**: Buyer/supplier contacts from shipment data
- **Due Diligence**: Company trade history analysis

### Data Products

| Product | Scale | Source | History | Detail Level |
|---------|-------|--------|---------|--------------|
| **US Maritime BOL** | ~200K records/week | CBP AMS License | 22 years (2004-present) | High - shipper/consignee names, addresses, contacts |
| **Global Trade** | 575M+ records/year | 50+ country customs | 8 years (2018-present) | Medium - basic company names |

### Data Sources

#### Primary Data Sources
- **CBP Automated Manifest System (AMS)**: US Bill of Lading data (commercial license)
  - Ocean carriers file manifests electronically with CBP
  - Contains: Shipper, Consignee, Notify Party, Vessel, Container, Product description
  - Near real-time updates (within days)
  - Data types: House BOLs, Master BOLs, Census statistics

- **Foreign Customs Agencies**: 50+ countries
  - Americas: USA, Mexico, Brazil, Argentina, Colombia, Ecuador, Peru, Chile
  - Asia: China, Vietnam, India, Indonesia, Japan, Korea, Bangladesh
  - Europe: EU, UK, Spain, Germany
  - Others: Australia, South Africa, Turkey

- **US Census Bureau**: Aggregated trade statistics
- **Dun & Bradstreet**: Company enrichment (DUNS, hierarchy, revenue, contacts)

### Core Functionality Matrix

| Feature | Description |
|---------|-------------|
| **BOL Search** | Search by company, product, HS code, port, carrier |
| **Filters** | Country, port, carrier, date range, containerized, weight |
| **Visualizations** | Pie charts, bar charts, trend lines, maps |
| **Aggregations** | Total by carrier, country, HS code, company, time |
| **Company Profiles** | D&B integration with hierarchy, contacts, revenue |
| **Contact Database** | Employee names, titles, emails, phones |
| **Denied Party Screening** | Basic lookup against 10 government lists |
| **Alerts** | Email alerts on search criteria |
| **Export** | Excel, PDF exports |

### Technical Architecture

#### Data Flow
```
DATA SOURCES → DATAMYNE DATA WAREHOUSE → USER INTERFACE
     ↓              ↓                        ↓
  CBP AMS      Entity Resolution        Search Interface
Foreign Customs   Company Matching      Filter System
US Census       HS Code Enrichment     Visualization Engine
D&B Data       Value Estimation       Company Intelligence
              DUNS Linking           Alerts & Exports
```

#### Key Technical Capabilities

1. **Entity Resolution / Company Matching**
   - Normalizes inconsistent company names from raw data
   - Creates "Unified" and "Consolidated" company profiles
   - Links to DUNS numbers for definitive matching
   - Shows corporate hierarchy (parent/subsidiary relationships)

2. **Value Estimation**
   - Many records lack declared values
   - Estimates values using HS code, quantity, historical data
   - Displays as "Total calculated value (US$)" with disclaimers

3. **Search & Filtering**
   - Full-text search across multiple fields
   - Boolean operators (AND, OR), wildcards
   - 70+ filterable/displayable fields
   - Saved queries for repeated searches

4. **Analytics Engine**
   - Aggregation by any dimension ("Total by" feature)
   - Time series analysis ("Trend by" feature)
   - Interactive charts: pie, bar, line, maps
   - Grid/pivot table reports

5. **Company Intelligence (US-focused)**
   - Full D&B company profiles
   - Employee directory with titles and contact info
   - Corporate hierarchy visualization
   - Denied party screening integration

### APIs & Data Sources Needed

| Data Type | Source | Access Method | Status |
|-----------|--------|---------------|--------|
| US Maritime BOL | CBP AMS | Commercial license required | Expensive ($50K-200K/yr) |
| US Census Trade | Census Bureau API | Free public API | ✅ Already using |
| Foreign Declarations | UN Comtrade API | Free global API | Planned |
| Company Intelligence | D&B, proprietary | Commercial APIs | Expensive ($20K-100K/yr) |

### FREE Government APIs Available (Already Partially Implemented)

#### USITC DataWeb API ✅ ACTIVE
- **What it provides**: Import/export volumes, values, country breakdowns
- **Cost**: Free (API key required)
- **Coverage**: All US trade data since 2005
- **Usage**: Already integrated for trade statistics

#### Census Bureau International Trade API ✅ PLANNED
- **What it provides**: Granular trade stats by HS code, country, port
- **Cost**: Free public API
- **Coverage**: Monthly data since 2013, annual since 2005
- **Endpoint**: `https://api.census.gov/data/timeseries/intltrade`

#### USITC HTS API ✅ ACTIVE
- **What it provides**: Tariff schedules, Chapter 99 rates, special tariffs
- **Cost**: Free
- **Coverage**: Current + historical HTS schedules
- **Endpoint**: `https://hts.usitc.gov/reststop`

#### Federal Register API ✅ ACTIVE
- **What it provides**: Trade regulations, executive orders, tariff announcements
- **Cost**: Free
- **Coverage**: All federal regulations since 1994

#### CBP CROSS Rulings Database ✅ PLANNED
- **What it provides**: Official tariff rulings and classifications
- **Cost**: Free
- **Coverage**: CBP binding rulings database

#### UN Comtrade API ✅ PLANNED
- **What it provides**: Global trade flows from 200+ countries
- **Cost**: Free
- **Coverage**: 99% of world trade since 1962

#### ImportYeti (Free Alternative to Commercial BOL Data)
- **What it provides**: US/Mexico trade records, supplier info
- **Cost**: Free
- **Coverage**: Millions of shipment records

### Cost Comparison: Free vs Commercial

| Feature | Datamyne (Commercial) | Government APIs (Free) |
|---------|----------------------|------------------------|
| US Import Data | CBP AMS ($50K-200K/yr) | Census Bureau API (Free) |
| Company Intelligence | D&B ($20K-100K/yr) | Limited (can build from BOL data) |
| Global Trade Stats | Foreign customs ($Varies) | UN Comtrade (Free) |
| Tariff Classifications | BOL matching only | HTS API + Rulings (Free) |
| Total Annual Cost | $70K-400K+ | $0 (API keys only) |

### What You Can Build with Free APIs

#### Phase 1: Trade Statistics Foundation ✅ (Already Built)
- **USITC DataWeb**: Import volumes, values by country/HTS
- **Census Bureau API**: Granular trade statistics
- **UN Comtrade**: Global trade flows and trends

#### Phase 2: Enhanced Intelligence (Build These)
- **Company Matching**: Use shipment data to build basic company profiles
- **Supplier Discovery**: Find suppliers by reverse-engineering import patterns
- **Market Intelligence**: Trade flow analysis and trend identification
- **Risk Assessment**: Denied party screening with free government lists

#### Phase 3: Advanced Features (Your Competitive Edge)
- **AI Classification**: Your LLM-powered HTS classification (Datamyne doesn't have this)
- **Duty Optimization**: Automatic tariff calculations with special programs
- **Landed Cost Calculator**: Full cost modeling including duties and logistics
- **FTA Qualification**: Smart calculator for trade agreement benefits

### The Key Insight: Datamyne's "Secret Sauce" is Available for Free

Datamyne's core value comes from **entity resolution** (company matching) and **value estimation** algorithms applied to government data. You can:

1. **Use free government APIs** instead of licensed CBP AMS data
2. **Build your own entity resolution** using AI/ML (potentially better than theirs)
3. **Add superior AI features** they don't have (classification, duty optimization)
4. **Offer modern UX** that enterprise customers actually want

**Result**: Compete directly with Datamyne at 1/100th the cost while offering better features.

---

## CUSTOMSINFO: Tariff Research & Compliance Platform

### Core Value Proposition
Tariff research and compliance platform focused on classification, duty rates, and trade regulations.

### Key Use Cases
- **HTS Classification**: Find correct tariff codes
- **Duty Research**: Look up rates, FTAs, special programs
- **Rulings Research**: Search CBP rulings database
- **Rules of Origin**: FTA qualification requirements
- **Compliance**: PGA requirements, ADD/CVD, denied parties

### Core Functionality Matrix

| Feature | Description |
|---------|-------------|
| **HTS Lookup** | Search tariff schedules (US, Canada, Mexico, EU, UK, etc.) |
| **Classification Tool** | AI suggestions based on BOL data + confidence scores |
| **Trade Agreements** | 300+ FTAs with rules of origin text |
| **Rulings Database** | CBP rulings, CIT cases, CAFC decisions |
| **PGA Lookup** | Check HTS for agency requirements (FDA, EPA, etc.) |
| **ADD/CVD Lookup** | Antidumping/countervailing duty by HTS + country |
| **HTS Mapper** | Map old HTS codes to new versions |
| **Denied Party Lookup** | Basic search of 10 government lists |
| **Federal Register** | 29 years of trade regulations |
| **Historical Archives** | HTS schedules back to 1996 |

### Data Sources
- **USITC**: HTS schedules and trade statistics
- **CBP**: Rulings, decisions, bulletins, AMS data
- **WCO**: Explanatory notes, opinions
- **USTR**: Trade agreement text and rules of origin
- **OFAC/BIS**: Denied party lists (government feeds)
- **Federal Register**: 29 years of trade regulations

---

## Cost Structure Analysis

### Datamyne Estimated Costs
| Component | Estimated Cost | Notes |
|-----------|----------------|-------|
| **CBP AMS License** | $50K-$200K+/year | Core BOL data access |
| **D&B Integration** | $20K-$100K+/year | Company enrichment |
| **Foreign Customs Data** | Varies by country | Individual agreements |
| **Infrastructure** | Significant | 575M+ records, 22 years history |
| **Platform Subscription** | $10K-$50K+/year | Enterprise pricing |

### Key Insight
High costs explain why Datamyne targets enterprise customers only. The underlying data licenses are substantial barriers to entry.

---

## Reverse Engineering Opportunities

### What They Have That We Can Build Better with Free Data

| Capability | Free Alternative | Implementation Approach | Cost |
|------------|------------------|------------------------|------|
| **BOL Data Access** | Census Bureau API + UN Comtrade | Government APIs provide similar trade flow data | $0 |
| **Company Intelligence** | Build from shipment data | AI-powered entity resolution + web scraping | Development time |
| **Global Customs Data** | UN Comtrade + ImportYeti | 200+ countries, 99% of global trade | $0 |
| **Entity Resolution** | Custom AI solution | Better than Datamyne's with modern ML | Development time |
| **Value Estimation** | HTS-based algorithms | Similar approach with government data | Development time |

---

## COMPETITIVE LANDSCAPE: DATAMYNE vs OTHER TRADE DATA PROVIDERS

### Market Overview (2026)

The trade intelligence market is dominated by **enterprise-focused players** charging $10K-100K+/year, leaving a **huge SMB gap** that you can fill.

### Major Competitors

#### 1. **Datamyne** (Descartes Systems Group)
**Positioning:** Premium trade intelligence platform
**Target:** Enterprise sales, supply chain, compliance teams
**Pricing:** $10K-50K+/year (quote-based, enterprise-only)

**Strengths:**
- 575M+ global trade records from 50+ countries
- 200K+ weekly US BOL updates (22 years history)
- D&B company intelligence integration
- Corporate hierarchy mapping
- Contact database with employee details

**Weaknesses:**
- Dated 2010s enterprise UI
- No AI classification (basic text matching)
- No duty calculation or optimization
- Enterprise pricing excludes SMBs
- Siloed products (Datamyne + CustomsInfo separate)

#### 2. **Panjiva** (S&P Global)
**Positioning:** Enterprise-grade trade data & analytics
**Target:** Large corporations, policy research, supply chain analytics
**Pricing:** $20K-100K+/year (quote-based, enterprise-only)

**Strengths:**
- 2+ billion shipment records
- 190+ countries coverage
- Advanced entity matching & supply chain mapping
- Machine learning data normalization
- Multi-parameter search with semantic matching

**Weaknesses:**
- No public pricing (requires sales consultation)
- Complex enterprise interface
- No AI classification capabilities
- Focused on data access, not optimization

#### 3. **ImportGenius**
**Positioning:** SMB-friendly trade data platform
**Target:** Small-medium businesses, procurement teams
**Pricing:** $199-1,999+/month ($2,388-23,988/year)

**Strengths:**
- Transparent tiered pricing (most affordable competitor)
- AI-powered company profiler & HS code search
- 25+ regions with direct data access
- Daily US updates, instant signup
- US-based customer support

**Weaknesses:**
- Smaller dataset than Panjiva/Datamyne
- US-focused (global coverage more limited)
- No advanced analytics or entity matching
- Basic company intelligence (no hierarchy/contacts)

#### 4. **ImportKey**
**Positioning:** Budget trade data provider
**Target:** Price-sensitive SMBs
**Pricing:** $3K-10K/year (estimated)

**Strengths:**
- Most affordable BOL data access
- US import focus
- Simple interface

**Weaknesses:**
- Limited features and support
- Small dataset
- Basic functionality only

#### 5. **CustomsInfo** (Descartes Systems Group)
**Positioning:** Tariff research & compliance platform
**Target:** Customs brokers, compliance teams
**Pricing:** $10K-50K+/year (enterprise-only)

**Strengths:**
- 300+ FTA rules with full text
- CBP rulings database (29 years)
- Historical HTS archives (1996-present)
- PGA requirements database
- ADD/CVD case lookup

**Weaknesses:**
- No AI classification (basic BOL matching)
- No duty calculation or landed cost
- Dated enterprise UI
- Separate from Datamyne (siloed products)

### Pricing Comparison (Annual)

| Provider | SMB Pricing | Enterprise Pricing | Data Quality | Coverage |
|----------|-------------|-------------------|--------------|----------|
| **Datamyne** | ❌ None | $10K-50K+ | Excellent | 50+ countries |
| **Panjiva** | ❌ None | $20K-100K+ | Excellent | 190+ countries |
| **ImportGenius** | $2.4K-24K | $50K+ | Good | 25+ regions |
| **ImportKey** | $3K-10K | N/A | Basic | US-focused |
| **CustomsInfo** | ❌ None | $10K-50K+ | Excellent | Regulations only |

### Market Gap Analysis

#### **Enterprise Market** ($10K-100K+/year)
**Players:** Datamyne, Panjiva, Descartes CustomsInfo
**Customer Profile:** Fortune 500 companies, large trading firms
**Needs:** Massive datasets, advanced analytics, custom integrations
**Market Size:** Small (only enterprises can afford)

#### **SMB Market** ($100-10K/year) - **HUGE OPPORTUNITY**
**Players:** ImportGenius (partially), ImportKey, some free tools
**Customer Profile:** Small importers, procurement managers, consultants
**Needs:** Affordable access, easy-to-use interface, actionable insights
**Market Size:** Massive (90% of importers are SMBs)
**Current Gap:** No AI-powered, comprehensive solution

### Your Competitive Positioning

#### **vs Datamyne/CustomsInfo:**
- **AI Classification:** You win (they use basic text matching)
- **Duty Calculation:** You win (they don't calculate, just show rates)
- **FTA Qualification:** You win (they don't have this)
- **Modern UX:** You win (their UI is 2010s enterprise)
- **SMB Pricing:** You win ($99-999 vs $10K+)
- **BOL Data:** They win (but you can add this later)

#### **vs ImportGenius:**
- **AI Features:** You win (they're basic data access)
- **Compliance Depth:** You win (comprehensive denied parties, ADD/CVD, PGA)
- **Optimization:** You win (FTA qualification, duty savings)
- **Data Scope:** They win (you need BOL data)
- **Pricing:** Similar tier ($299 vs their $199-1999/month)

### Recommended Go-to-Market Strategy

#### **Phase 1: Free Government APIs** (What you have now)
**Positioning:** "AI-Powered Trade Intelligence for SMBs"
- **Free Tier:** USITC trade stats, AI classification, basic compliance
- **Pro Tier ($99):** FTA qualification, comprehensive compliance, PDF exports
- **Business Tier ($299):** Add BOL data when you license it

#### **Phase 2: Add BOL Data** (ImportKey or ImportGenius)
**Positioning:** "Complete Competitor & Supplier Intelligence"
- Add competitor analysis, supplier discovery
- Keep AI/UX advantages over all competitors
- Maintain SMB pricing vs enterprise competitors

#### **Key Differentiators:**
1. **AI Classification with Reasoning** (none have this)
2. **Integrated Duty Calculation** (only you do this)
3. **FTA Qualification Calculator** (unique feature)
4. **Modern UX** (enterprise competitors are dated)
5. **SMB Pricing** (you can be 10-100x cheaper)

### How Customers Will Choose

#### **SMB Importer ($10K-100K annual imports):**
- **Needs:** Classify products, calculate duties, find suppliers, stay compliant
- **Datamyne:** Too expensive ($10K+/year), enterprise-focused
- **ImportGenius:** $200-2000/month, basic data access, no AI features
- **Sourcify:** $99-299/month, AI-powered, comprehensive compliance, modern UX

#### **Mid-Market Importer ($100K-1M annual imports):**
- **Needs:** Advanced analytics, competitor intelligence, bulk operations
- **Datamyne:** Perfect fit but expensive
- **Panjiva:** Excellent data but complex and expensive
- **Sourcify:** Good middle ground with AI advantages

#### **Enterprise ($1M+ annual imports):**
- **Needs:** Massive datasets, custom integrations, advanced analytics
- **Datamyne/Panjiva:** Best fit for data volume needs
- **Sourcify:** Could compete on UX/AI but data limitations

### Market Opportunity

**Total Addressable Market:** $2-3 billion global trade intelligence market
- **Enterprise Segment:** $1-2 billion (Datamyne, Panjiva, Descartes)
- **SMB Segment:** $500-800 million (under-served, fragmented)

**Your Opportunity:** Capture 20-30% of SMB market = $100-240M annual revenue potential
- At $199/month average revenue per user
- 5,000-12,000 paying SMB customers
- Massive runway before hitting enterprise ceiling

### Implementation Roadmap for Competition

#### **Phase 1: Launch with Free APIs** (Immediate)
- **Positioning:** "AI-Powered Trade Intelligence for the Rest of Us"
- **Features:** AI classification, duty calc, compliance tools, FTA qualification
- **Pricing:** Free/$99/$299 tiers
- **Competitive Advantage:** Better AI/UX than all competitors

#### **Phase 2: Add BOL Data** (6 months)
- **License:** ImportKey ($3K-10K/year) for proof of concept
- **Features:** Competitor analysis, supplier discovery
- **Positioning:** "Complete Trade Intelligence Platform"
- **Revenue:** Scale to $50K/month with Business tier

#### **Phase 3: Enterprise Features** (12 months)
- **License:** Panjiva or direct CBP for global coverage
- **Features:** Company intelligence, global supply chains
- **Positioning:** "AI-Enhanced Enterprise Trade Intelligence"
- **Revenue:** Compete with Datamyne on features while keeping SMB pricing

**Key Insight:** Start with your AI/UX advantages (what competitors can't easily copy), add data later when you prove demand. This derisks the business while building a moat.

### Our Competitive Advantages to Build Upon

| Advantage | Implementation |
|-----------|----------------|
| **AI Classification** | LLM-powered HTS code assignment with reasoning |
| **Duty Calculation** | Automatic tariff math with special programs |
| **Landed Cost Calculator** | Full cost modeling (duties, freight, taxes) |
| **Modern UX** | 2025 web app vs their 2010s enterprise UI |
| **SMB Pricing** | $99-999/month vs their $10K+/year |
| **FTA Qualification** | Calculator showing how to qualify for lower rates |
| **Special Tariff Integration** | Section 301, IEEPA, AD/CVD coverage |

### Technical Implementation Roadmap

#### Phase 1: Foundation (Trade Statistics)
- USITC DataWeb API integration
- Basic search and filtering
- Simple visualizations
- Historical trend analysis

#### Phase 2: BOL Data Integration
- ImportGenius or similar BOL data provider
- Entity resolution system
- Company profile building
- Basic contact enrichment

#### Phase 3: Advanced Intelligence
- AI-powered company matching
- Value estimation algorithms
- Corporate hierarchy mapping
- Contact database integration

#### Phase 4: Global Expansion
- Additional country customs data
- Multi-language support
- Advanced analytics and reporting

---

## Key Technical Insights for Implementation

### Data Processing Pipeline
1. **Ingestion**: Raw BOL/customs data from multiple sources
2. **Normalization**: Standardize company names, addresses, product descriptions
3. **Enrichment**: Add DUNS numbers, corporate hierarchy, contact data
4. **Indexing**: Full-text search across all fields
5. **Analytics**: Pre-compute aggregations for performance

### Search Architecture
- **Fields**: 70+ searchable/filterable fields
- **Operators**: Boolean logic, wildcards, fuzzy matching
- **Performance**: Sub-second queries on 575M+ records
- **Caching**: Results caching for repeated queries

### Company Intelligence Features
- **Profiles**: Revenue, employee count, industry codes
- **Hierarchy**: Parent/subsidiary relationships
- **Contacts**: Employee directory with titles and contact info
- **Screening**: Denied party lookup integration

---

## FUNCTIONALITY BENCHMARK: FEATURE-BY-FEATURE ANALYSIS

### 1. PRODUCT CLASSIFICATION & SEARCH

#### **AI-Powered HTS Classification**
**User Story:** "As a product manager, I want to describe my product in plain English and get an accurate HTS code with reasoning, so I can classify products quickly without being a tariff expert."

**Benefits:**
- Reduces classification time from hours to seconds
- Increases accuracy (94%+ confidence)
- Explains WHY the code was chosen
- Handles complex products with multiple materials

**Data Sources:**
- USITC HTS database (free)
- CBP explanatory notes (free)
- Historical rulings database (free)
- AI training on BOL descriptions (when available)

**Competitor Comparison:**
- **Datamyne:** ❌ Basic text matching, no AI reasoning
- **CustomsInfo:** ⚠️ BOL-based suggestions, low confidence scores
- **Your Advantage:** ✅ LLM-powered with full justification

**Implementation:** Your V10 semantic search engine ✅ Complete

---

#### **Alternative Classification Suggestions**
**User Story:** "As an importer, I want to see alternative HTS codes for my product so I can choose the one with the lowest duty rate."

**Benefits:**
- Optimizes for cost savings
- Shows duty rate differences
- Highlights conditional codes (value thresholds)
- Includes confidence scores

**Data Sources:**
- HTS hierarchy database (USITC, free)
- Duty rate tables (USITC, free)
- CBP rulings (rulings.cbp.gov, free)

**Competitor Comparison:**
- **Datamyne:** ❌ No alternatives shown
- **CustomsInfo:** ❌ No alternatives shown
- **Your Advantage:** ✅ Duty-optimized suggestions

**Implementation:** Your alternative classifications ✅ Complete

---

### 2. DUTY CALCULATION & COST ANALYSIS

#### **Landed Cost Calculator**
**User Story:** "As a procurement manager, I want to input my product details and see the total cost to import including all duties, fees, and logistics, so I can make informed sourcing decisions."

**Benefits:**
- Shows true total cost (not just CIF)
- Includes all fees (MPF, HMF, customs)
- Compares scenarios side-by-side
- Saves money by revealing hidden costs

**Data Sources:**
- HTS duty rates (USITC, free)
- Section 301/IEEPA rates (USITC, free)
- Chapter 99 additional duties (USITC, free)
- Fee schedules (CBP, free)

**Competitor Comparison:**
- **Datamyne:** ❌ No duty calculation
- **CustomsInfo:** ❌ No duty calculation
- **Your Advantage:** ✅ Complete landed cost modeling

**Implementation:** Your landed cost calculator ✅ Complete

---

#### **Country Comparison Matrix**
**User Story:** "As a sourcing manager, I want to see my product's landed cost in every major manufacturing country so I can choose the optimal sourcing location."

**Benefits:**
- Global sourcing optimization
- Duty rate comparisons
- FTA eligibility visualization
- Cost-benefit analysis per country

**Data Sources:**
- Country tariff profiles (USITC + your database)
- FTA agreements (USTR, free)
- Trade statistics (USITC DataWeb, free)
- Currency exchange rates (public APIs)

**Competitor Comparison:**
- **Datamyne:** ⚠️ Basic country filtering
- **CustomsInfo:** ❌ No country comparison
- **Your Advantage:** ✅ Visual cost comparison

**Implementation:** Your country comparison ✅ Complete

---

#### **Global Cost Map** (Your Vision)
**User Story:** "As a strategic planner, I want to see a world map showing the cost to produce my product in every country so I can identify optimal sourcing regions."

**Benefits:**
- Visual global cost analysis
- Regional cost patterns
- Quick country ranking
- Strategic sourcing insights

**Data Sources:**
- Country tariff profiles (your database)
- Manufacturing cost indices (World Bank, ILO)
- Trade statistics (USITC DataWeb, UN Comtrade)
- Currency rates (public APIs)

**Competitor Comparison:**
- **Datamyne:** ❌ No cost mapping
- **CustomsInfo:** ❌ No cost mapping
- **Your Advantage:** ✅ Unique visual approach

**Implementation:** Phase 2 feature - integrate with mapping libraries

---

### 3. TRADE INTELLIGENCE & MARKET ANALYSIS

#### **Trade Statistics Dashboard**
**User Story:** "As a market researcher, I want to see import/export trends for my product category so I can understand market dynamics and demand patterns."

**Benefits:**
- Market size analysis
- Trend identification
- Country market shares
- Growth forecasting

**Data Sources:**
- USITC DataWeb API (free)
- Census Bureau trade data (free)
- UN Comtrade (free)
- Historical HTS changes (your database)

**Competitor Comparison:**
- **Datamyne:** ⚠️ Basic aggregations
- **CustomsInfo:** ⚠️ Basic census data
- **Your Advantage:** ✅ Interactive visualizations

**Implementation:** Your trade stats dashboard ✅ Complete

---

#### **Competitor Intelligence**
**User Story:** "As a sales manager, I want to see what products my competitors are importing so I can identify new product opportunities."

**Benefits:**
- Competitive advantage insights
- Market gap identification
- Supplier discovery
- Pricing intelligence

**Data Sources:**
- BOL shipment data (ImportGenius/Panjiva, licensed)
- Company profiles (when available)
- HTS classification data (your database)

**Competitor Comparison:**
- **Datamyne:** ✅ Core feature (their crown jewel)
- **CustomsInfo:** ❌ Not available
- **Your Advantage:** ⚠️ Needs BOL data license

**Implementation:** Phase 2 - requires BOL data license

---

#### **Supplier Discovery**
**User Story:** "As a procurement manager, I want to find suppliers who ship to my competitors so I can get introductions and competitive quotes."

**Benefits:**
- Access to proven suppliers
- Reduced supplier vetting time
- Competitive intelligence
- Risk assessment

**Data Sources:**
- BOL shipment records (licensed)
- Company directories (when available)
- Trade compliance data (your database)

**Competitor Comparison:**
- **Datamyne:** ✅ Advanced supplier mapping
- **CustomsInfo:** ❌ Not available
- **Your Advantage:** ⚠️ Needs BOL data license

**Implementation:** Phase 2 - requires BOL data license

---

### 4. COMPLIANCE & REGULATORY TOOLS

#### **FTA Qualification Calculator**
**User Story:** "As a compliance officer, I want to input my product's BOM and determine if it qualifies for FTA benefits so I can maximize duty savings."

**Benefits:**
- Automated qualification assessment
- RVC calculation (60% transaction value)
- Tariff shift analysis
- Documentation requirements

**Data Sources:**
- FTA rule texts (USTR, free)
- HTS classification (your database)
- Country of origin rules (USTR, free)

**Competitor Comparison:**
- **Datamyne:** ❌ No FTA tools
- **CustomsInfo:** ⚠️ Rules lookup only (no calculation)
- **Your Advantage:** ✅ Complete qualification workflow

**Implementation:** Your FTA calculator ✅ Complete

---

#### **Denied Party Screening**
**User Story:** "As a compliance manager, I want to screen my suppliers against all government denied party lists so I can avoid OFAC violations."

**Benefits:**
- Automated compliance checking
- Batch screening capability
- Audit trail generation
- Risk mitigation

**Data Sources:**
- OFAC SDN list (free)
- BIS Entity List (free)
- BIS Denied Persons (free)
- State Department lists (free)

**Competitor Comparison:**
- **Datamyne:** ⚠️ Basic screening (10 lists)
- **CustomsInfo:** ⚠️ Basic screening (10 lists)
- **Your Advantage:** ✅ Comprehensive (10+ lists)

**Implementation:** Your denied party screening ✅ Complete

---

#### **ADD/CVD Risk Assessment**
**User Story:** "As a risk manager, I want to check if my product is subject to antidumping duties before importing so I can avoid unexpected costs."

**Benefits:**
- Pre-import risk assessment
- Cost predictability
- Regulatory compliance
- Margin protection

**Data Sources:**
- ITA ADD/CVD orders (free)
- USITC determinations (free)
- CBP case updates (free)

**Competitor Comparison:**
- **Datamyne:** ❌ No ADD/CVD tools
- **CustomsInfo:** ✅ Case lookup
- **Your Advantage:** ✅ Risk warnings in classification

**Implementation:** Your ADD/CVD lookup ✅ Complete

---

### 5. REGULATORY DOCUMENTATION

#### **Documentation Requirements Engine**
**User Story:** "As an import coordinator, I want to know exactly what documents I need for my shipment so I can prepare everything correctly the first time."

**Benefits:**
- Reduces clearance delays
- Prevents costly mistakes
- Streamlines preparation
- Improves compliance

**Data Sources:**
- CBP import requirements (free)
- PGA agency requirements (free)
- HTS-specific rules (your database)
- Dangerous goods regulations (DOT, free)

**Competitor Comparison:**
- **Datamyne:** ❌ No documentation tools
- **CustomsInfo:** ❌ No documentation tools
- **Your Advantage:** ✅ Comprehensive checklist

**Implementation:** Your documentation engine ⚠️ 40% complete

---

#### **Dangerous Goods Classifier**
**User Story:** "As a shipping coordinator, I want to know if my product requires dangerous goods documentation so I can comply with transportation regulations."

**Benefits:**
- Prevents shipping violations
- Ensures proper handling
- Reduces liability
- Improves safety compliance

**Data Sources:**
- DOT hazardous materials regs (free)
- IATA dangerous goods rules (free)
- UN classification system (free)
- HTS dangerous goods flags (your database)

**Competitor Comparison:**
- **Datamyne:** ❌ No DG classification
- **CustomsInfo:** ❌ No DG classification
- **Your Advantage:** ✅ Automated DG detection

**Implementation:** Basic lithium battery logic ✅ Complete

---

### 6. MONITORING & ALERTS

#### **Tariff Change Alerts**
**User Story:** "As a supply chain manager, I want email alerts when duty rates change for my products so I can adjust pricing and sourcing strategies."

**Benefits:**
- Proactive risk management
- Cost predictability
- Competitive advantage
- Regulatory compliance

**Data Sources:**
- USITC tariff updates (free)
- Federal Register API (free)
- HTS revision tracking (your database)

**Competitor Comparison:**
- **Datamyne:** ❌ No alerts
- **CustomsInfo:** ❌ No alerts
- **Your Advantage:** ✅ Automated monitoring

**Implementation:** Your alert system ✅ Complete

---

#### **Product Portfolio Monitoring**
**User Story:** "As a product manager, I want to monitor all my products for tariff changes and compliance risks so I can manage my entire portfolio proactively."

**Benefits:**
- Holistic portfolio management
- Risk aggregation
- Bulk optimization opportunities
- Compliance oversight

**Data Sources:**
- User product database (your database)
- Tariff change feeds (USITC, free)
- Compliance rule updates (government APIs)

**Competitor Comparison:**
- **Datamyne:** ❌ No portfolio tools
- **CustomsInfo:** ❌ No portfolio tools
- **Your Advantage:** ✅ Complete portfolio management

**Implementation:** Your My Products page ✅ Complete

---

## DATA FLOW ARCHITECTURE

### **Intuitive User Journey**

```
1. PRODUCT INPUT
   ↓
2. AI CLASSIFICATION (with alternatives)
   ↓
3. LANDED COST CALCULATION (all scenarios)
   ↓
4. COUNTRY COMPARISON (global map view)
   ↓
5. COMPLIANCE CHECK (automated screening)
   ↓
6. DOCUMENTATION (requirements checklist)
   ↓
7. OPTIMIZATION (savings opportunities)
   ↓
8. SAVE & MONITOR (portfolio tracking)
```

### **Data Flow Principles**

1. **Progressive Disclosure**: Show summary → details on demand
2. **Context Preservation**: Data flows between sections automatically
3. **Error Prevention**: Validate inputs, warn about risks
4. **Optimization Focus**: Always show cost-saving opportunities
5. **Compliance First**: Check compliance before showing benefits

### **Integration Points**

- **Classification → Duty Calculation**: HTS code auto-flows
- **Duty Calculation → Country Comparison**: Base costs auto-populate
- **Country Comparison → FTA Tools**: Origin countries trigger qualification checks
- **Compliance → Documentation**: Risk levels determine document requirements
- **All → Portfolio**: Everything saves to monitoring system

### **Missing Functionality Gaps**

#### **Critical Gaps** (Need for Competition)
1. **BOL Data Integration** - Competitor/supplier intelligence
2. **Company Intelligence** - D&B-style profiles
3. **Advanced Entity Resolution** - Company name matching

#### **Nice-to-Have Gaps** (Competitive Advantages)
1. **Global Cost Map** - Your vision for visual sourcing
2. **Predictive Analytics** - Tariff change forecasting
3. **Supplier Relationship Management** - CRM integration

### **Your Unique Feature Set**

| Feature Category | Datamyne | CustomsInfo | Your Platform | Competitive Edge |
|------------------|----------|-------------|---------------|------------------|
| **AI Classification** | ❌ | ⚠️ | ✅ | Unique |
| **Duty Calculation** | ❌ | ❌ | ✅ | Unique |
| **FTA Qualification** | ❌ | ⚠️ | ✅ | Unique |
| **Compliance Suite** | ⚠️ | ⚠️ | ✅ | Strong |
| **BOL Intelligence** | ✅ | ❌ | ⚠️ | Needs Data |
| **Modern UX** | ❌ | ❌ | ✅ | Strong |
| **SMB Pricing** | ❌ | ❌ | ✅ | Strong |

This consolidated analysis focuses on the core technical and functional elements needed to reverse engineer and improve upon Datamyne's platform.