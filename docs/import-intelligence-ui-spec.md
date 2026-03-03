# Import Intelligence - Unified UI Specification

> **Version:** 1.0  
> **Created:** January 29, 2026  
> **Status:** SPECIFICATION  
> **Audience:** SMB + Enterprise (Traditional UI)

---

## 1. OVERVIEW

### Vision
A unified "Import Intelligence" experience that guides users through the complete import analysis workflow - from product classification to landed cost calculation to optimization opportunities - in a single, seamless interface.

### Design Principles
1. **Progressive Disclosure** - Show summary first, details on demand
2. **Guided Flow** - Walk users through steps, but allow skipping
3. **Escape Hatches** - Direct links to any section for power users
4. **Scale Agnostic** - Same experience for 1 product or 1,000 products
5. **Context Preservation** - Data flows between sections automatically

### Target Users
- **SMB/Entrepreneur:** First-time importers, small businesses, 1-10 products
- **Mid-Market:** Growing importers, 10-100 products, some complexity
- **Enterprise:** Large importers, 100+ products, compliance teams, bulk operations

---

## 2. INFORMATION ARCHITECTURE

### URL Structure
```
/dashboard/import                      → Main entry (mode selector)
/dashboard/import/analyze              → Single product analysis
/dashboard/import/analyze?section=X    → Jump to specific section
/dashboard/import/bulk                 → Bulk upload analysis
/dashboard/import/portfolio            → Saved products dashboard
```

### Navigation Menu
```
├── Overview
├── Classify
├── Import Intelligence          ← NEW (replaces Duties)
│   ├── Analyze Product         (single product flow)
│   ├── Bulk Analysis           (CSV upload)
│   └── My Portfolio            (saved products + monitoring)
├── Compliance
│   ├── Screening
│   ├── ADD/CVD
│   ├── FTA Rules
│   ├── FTA Calculator
│   ├── PGA
│   ├── Tariff Tracker
│   └── HTS History
├── Intelligence
│   ├── Trade Stats
│   └── Sourcing
├── Alerts
└── Settings
```

---

## 3. SINGLE PRODUCT FLOW

### 3.1 Entry Point - Mode Selector

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧭 IMPORT INTELLIGENCE                                          │
│                                                                  │
│ How would you like to analyze?                                   │
│                                                                  │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│ │                 │  │                 │  │                 │   │
│ │  📦 Single      │  │  📊 Bulk        │  │  📁 My          │   │
│ │  Product        │  │  Upload         │  │  Portfolio      │   │
│ │                 │  │                 │  │                 │   │
│ │  Analyze one    │  │  Upload CSV     │  │  View saved     │   │
│ │  product with   │  │  with multiple  │  │  products and   │   │
│ │  guided flow    │  │  products       │  │  monitoring     │   │
│ │                 │  │                 │  │                 │   │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                  │
│ Recent Analyses:                                                 │
│ • Cotton T-Shirts from China (Jan 28) - $7,800 duty            │
│ • Wireless Earbuds from Vietnam (Jan 27) - $2,700 duty         │
│ • Bulk Analysis: 500 products (Jan 25) - $340K savings found   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Product Input Section

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ PRODUCT INFORMATION                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ How would you like to identify your product?                     │
│                                                                  │
│ [I have an HTS code]  [Describe my product]  [Use saved product]│
│                                                                  │
│ ─────────────────────────────────────────────────────────────── │
│                                                                  │
│ IF "Describe my product":                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Describe your product in detail...                          │ │
│ │                                                              │ │
│ │ e.g., "Cotton t-shirts, 100% cotton, knit fabric,          │ │
│ │ short sleeve, for adults, printed designs"                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Country of Origin:  [China ▼]                                   │
│ Product Value:      [$10,000    ]                               │
│ Quantity:           [1,000 units]                               │
│                                                                  │
│ Additional Details (improves accuracy):                          │
│ ☐ Contains lithium battery                                      │
│ ☐ Contains chemicals/hazardous materials                        │
│ ☐ For children (under 12)                                       │
│ ☐ Food or food contact                                          │
│ ☐ Wireless/radio frequency                                      │
│ ☐ Medical device                                                │
│                                                                  │
│ [Analyze Product →]                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Results - Collapsible Sections

After analysis, display results in collapsible accordion sections:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧭 IMPORT INTELLIGENCE                                          │
│                                                                  │
│ Cotton T-Shirts • HTS 6109.10.00.12 • China → USA               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ▼ 1. PRODUCT CLASSIFICATION                              [Edit] │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ HTS Code: 6109.10.00.12                                     │ │
│ │ Description: T-shirts, singlets, tank tops and similar      │ │
│ │              garments, knitted or crocheted, of cotton      │ │
│ │                                                              │ │
│ │ Confidence: 94% ████████████░░                              │ │
│ │                                                              │ │
│ │ Classification Path:                                         │ │
│ │ Chapter 61 > Heading 6109 > Subheading 6109.10 > Item .12   │ │
│ │                                                              │ │
│ │ [View alternatives] [Why this code?]                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ▼ 2. LANDED COST                                    [$19,147.14]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ COST BREAKDOWN                                               │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ Product Value (FOB)                          $10,000.00     │ │
│ │ Shipping (user input)                           $800.00     │ │
│ │ Insurance (user input)                           $50.00     │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ DUTIES                                                       │ │
│ │   Base MFN (16.5%)                           $1,650.00      │ │
│ │   Section 301 List 4A (7.5%)                   $750.00      │ │
│ │   IEEPA Fentanyl (20%)                       $2,000.00      │ │
│ │   IEEPA Reciprocal (34%)                     $3,400.00      │ │
│ │   ─────────────────────────────────────────────────────    │ │
│ │   Total Duty (78%)                           $7,800.00      │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ FEES                                                         │ │
│ │   MPF (0.3464%)                                 $34.64      │ │
│ │   HMF (0.125%)                                  $12.50      │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ ESTIMATED ADDITIONAL                                         │ │
│ │   Customs Broker Fee                           $150.00      │ │
│ │   Drayage (estimated)                          $300.00      │ │
│ │ ═══════════════════════════════════════════════════════════│ │
│ │ TOTAL LANDED COST                           $19,147.14      │ │
│ │ Per Unit (1,000 units)                          $19.15      │ │
│ │                                                              │ │
│ │ [Save scenario] [Compare scenarios]                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ▼ 3. COMPARE COUNTRIES                          [5 alternatives]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SOURCING ALTERNATIVES                                        │ │
│ │                                                              │ │
│ │ Country      Landed Cost   Duty Rate   Savings    FTA       │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ 🇨🇳 China     $19,147       78%         —         No        │ │
│ │ 🇻🇳 Vietnam   $12,647       27%         $6,500    No        │ │
│ │ 🇲🇽 Mexico    $10,350       0%*         $8,797    USMCA*    │ │
│ │ 🇮🇳 India     $13,547       35%         $5,600    No        │ │
│ │ 🇧🇩 Bangladesh $11,847      18%         $7,300    GSP       │ │
│ │                                                              │ │
│ │ * USMCA qualification required - not automatic               │ │
│ │                                                              │ │
│ │ 💡 RECOMMENDATION                                            │ │
│ │ Vietnam offers the best balance of savings ($6,500) and     │ │
│ │ supplier availability. Mexico is better if you can qualify  │ │
│ │ for USMCA (saves $8,797).                                   │ │
│ │                                                              │ │
│ │ [Full comparison] [Find suppliers] [Check USMCA]             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ▶ 4. COMPLIANCE & RISK                             [3 alerts ⚠️]│
│   UFLPA risk • High tariff exposure • 5 documents required      │
│                                                                  │
│ ▶ 5. DOCUMENTATION REQUIRED                     [8 docs needed] │
│   2 critical • 3 required • 3 recommended                       │
│                                                                  │
│ ▶ 6. OPTIMIZATION OPPORTUNITIES                 [$8,797 savings]│
│   FTA qualification • Alternative HTS • Country switch          │
│                                                                  │
│ ─────────────────────────────────────────────────────────────── │
│                                                                  │
│ [Save to My Products] [Export PDF] [Share Analysis] [Start New] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Compliance & Risk Section (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ 4. COMPLIANCE & RISK                             [3 alerts ⚠️]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔴 HIGH PRIORITY                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ UFLPA / FORCED LABOR RISK                                 │ │
│ │                                                              │ │
│ │ Cotton products from China require due diligence under the  │ │
│ │ Uyghur Forced Labor Prevention Act (UFLPA).                 │ │
│ │                                                              │ │
│ │ Required actions:                                            │ │
│ │ • Verify cotton is NOT sourced from Xinjiang region         │ │
│ │ • Obtain supplier declaration of compliance                  │ │
│ │ • Document supply chain traceability                         │ │
│ │                                                              │ │
│ │ Risk: Shipment detention and potential seizure               │ │
│ │                                                              │ │
│ │ [UFLPA Compliance Guide] [Supplier Declaration Template]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟡 MEDIUM PRIORITY                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📈 TARIFF VOLATILITY                                         │ │
│ │                                                              │ │
│ │ This product's duty rate has changed significantly:          │ │
│ │ • 2018: 16.5% (Base MFN only)                               │ │
│ │ • 2019: 41.5% (+Section 301)                                │ │
│ │ • 2025: 78.0% (+IEEPA) ← Current                            │ │
│ │                                                              │ │
│ │ Tariff increased 373% since 2018.                           │ │
│ │ Future changes possible - monitor alerts.                    │ │
│ │                                                              │ │
│ │ [View full history] [Set up alerts]                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 CBP EXAMINATION RISK                                      │ │
│ │                                                              │ │
│ │ Estimated exam rate for this HTS/country: ~8%                │ │
│ │                                                              │ │
│ │ Factors increasing exam likelihood:                          │ │
│ │ • First-time importer                                        │ │
│ │ • High-risk country (China)                                  │ │
│ │ • Textile product (high scrutiny category)                   │ │
│ │                                                              │ │
│ │ If examined: Add 3-7 days + $300-800 exam fees               │ │
│ │                                                              │ │
│ │ [Reduce exam risk tips]                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟢 PASSED CHECKS                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✓ Denied Party Screening: No matches found                   │ │
│ │ ✓ AD/CVD Orders: No active orders for this HTS/country      │ │
│ │ ✓ Section 301 Exclusions: Not applicable (List 4A)          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Documentation Section (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ 5. DOCUMENTATION REQUIRED                     [8 docs needed] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Based on your product (Cotton T-Shirts from China), you need:   │
│                                                                  │
│ 🔴 CRITICAL (Shipment WILL be held without these)               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ Commercial Invoice                                         │ │
│ │   Must include: Seller, buyer, description, value, terms     │ │
│ │   [Template] [Requirements]                                   │ │
│ │                                                              │ │
│ │ ☐ Packing List                                               │ │
│ │   Must include: Carton count, weights, dimensions            │ │
│ │   [Template] [Requirements]                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟡 REQUIRED (PGA Agency Requirements)                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ CPSC Certificate of Compliance                             │ │
│ │   Agency: Consumer Product Safety Commission                 │ │
│ │   Why: Textile products must meet flammability standards     │ │
│ │   [CPSC Requirements] [Testing Labs]                         │ │
│ │                                                              │ │
│ │ ☐ Country of Origin Labels                                   │ │
│ │   Agency: CBP / FTC                                          │ │
│ │   Why: All textile products must be labeled with COO         │ │
│ │   Requirement: "Made in China" on each garment               │ │
│ │   [Labeling Guide]                                           │ │
│ │                                                              │ │
│ │ ☐ Fiber Content Labels                                       │ │
│ │   Agency: FTC                                                │ │
│ │   Why: Textile Fiber Products Identification Act             │ │
│ │   Requirement: "100% Cotton" or actual fiber percentages     │ │
│ │   [FTC Requirements]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟢 RECOMMENDED (Speeds clearance, reduces risk)                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ UFLPA Compliance Documentation                             │ │
│ │   Supplier declaration + supply chain traceability           │ │
│ │   [Template] [Guide]                                         │ │
│ │                                                              │ │
│ │ ☐ Product Photos                                             │ │
│ │   Photos of product, labels, and packaging                   │ │
│ │   Helps if CBP has questions                                 │ │
│ │                                                              │ │
│ │ ☐ Quality/Inspection Certificate                             │ │
│ │   Third-party inspection report                              │ │
│ │   Reduces exam likelihood                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Download All Templates] [Save Checklist] [Print Checklist]     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Optimization Section (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ 6. OPTIMIZATION OPPORTUNITIES                 [$8,797 savings]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ We found 3 ways to reduce your import costs:                    │
│                                                                  │
│ 1️⃣ COUNTRY SWITCH                              Save: $6,500/yr  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Switch from China to Vietnam                                 │ │
│ │                                                              │ │
│ │ Current (China):  $19,147 landed cost (78% duty)            │ │
│ │ Proposed (Vietnam): $12,647 landed cost (27% duty)          │ │
│ │                                                              │ │
│ │ Trade-offs:                                                  │ │
│ │ • Lead time: Similar (28-32 days vs 25-30 days)             │ │
│ │ • Supplier availability: Good (growing capacity)            │ │
│ │ • Quality: Comparable (verify with samples)                  │ │
│ │                                                              │ │
│ │ [Find Vietnam Suppliers] [Compare in Detail]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 2️⃣ FTA QUALIFICATION                           Save: $8,797/yr  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Qualify for USMCA (Mexico sourcing)                          │ │
│ │                                                              │ │
│ │ If you source from Mexico AND qualify for USMCA:             │ │
│ │ • Duty drops from 78% to 0%                                  │ │
│ │ • Landed cost: $10,350 (vs $19,147 from China)              │ │
│ │                                                              │ │
│ │ USMCA Requirements for this product:                         │ │
│ │ • Yarn forward rule: Yarn must originate in USMCA region    │ │
│ │ • Tariff shift: From outside Chapter 61                      │ │
│ │                                                              │ │
│ │ ⚠️ This is the highest savings but requires supply chain    │ │
│ │   restructuring and compliance verification.                 │ │
│ │                                                              │ │
│ │ [Check USMCA Qualification] [Find Mexico Suppliers]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 3️⃣ CLASSIFICATION REVIEW                       Save: $1,200/yr  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Alternative HTS codes may apply                              │ │
│ │                                                              │ │
│ │ If your product is >50% synthetic fiber:                     │ │
│ │ • Current: 6109.10.00.12 (cotton) - 78% duty                │ │
│ │ • Alternative: 6109.90.10.40 (man-made) - 66% duty          │ │
│ │                                                              │ │
│ │ ⚠️ Classification is importer's responsibility.              │ │
│ │   Verify fiber content before changing.                      │ │
│ │                                                              │ │
│ │ [Review Classification Options] [Get Broker Opinion]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ─────────────────────────────────────────────────────────────── │
│                                                                  │
│ TOTAL POTENTIAL SAVINGS: $8,797/year (best option: USMCA)       │
│                                                                  │
│ [Generate Optimization Report] [Schedule Consultation]          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. BULK ANALYSIS FLOW

### 4.1 Upload Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 BULK IMPORT ANALYSIS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Upload your product catalog for comprehensive analysis:         │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │     📄 Drop CSV or Excel file here                          │ │
│ │        or click to browse                                    │ │
│ │                                                              │ │
│ │     Supports: .csv, .xlsx, .xls                             │ │
│ │     Max: 5,000 products per upload                          │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Required columns:                                                │
│ • SKU or Product ID                                             │
│ • Product Description                                            │
│ • Country of Origin (ISO code: CN, VN, MX, etc.)               │
│ • Product Value (USD)                                           │
│                                                                  │
│ Optional columns (improves accuracy):                            │
│ • HTS Code (if known)                                           │
│ • Quantity                                                       │
│ • Materials                                                      │
│ • Contains Battery (yes/no)                                     │
│ • For Children (yes/no)                                         │
│                                                                  │
│ [Download Template]  [View Sample File]                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Processing Status

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 ANALYZING YOUR PRODUCTS                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Processing 500 products...                                       │
│                                                                  │
│ ████████████████████████░░░░░░░░░░░░░░░░ 62% (310/500)         │
│                                                                  │
│ Current step: Calculating landed costs                          │
│                                                                  │
│ ✓ File validated                                                │
│ ✓ Products parsed (500 found)                                   │
│ ✓ HTS codes assigned (487 classified, 13 need review)          │
│ ◉ Calculating landed costs...                                   │
│ ○ Analyzing optimization opportunities                          │
│ ○ Generating compliance alerts                                  │
│ ○ Building report                                               │
│                                                                  │
│ Estimated time remaining: 2 minutes                             │
│                                                                  │
│ [Cancel]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Portfolio Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 PORTFOLIO ANALYSIS                         [Export] [Save]   │
│ 500 products analyzed • January 29, 2026                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ SUMMARY                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│ │ 500          │ │ $2.4M        │ │ $890K        │ │ 37%      ││
│ │ Products     │ │ Total Value  │ │ Total Duty   │ │ Avg Rate ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│                                                                  │
│ ⚠️ ATTENTION REQUIRED                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • 13 products need HTS classification review                 │ │
│ │ • 8 products have compliance alerts                          │ │
│ │ • 3 products affected by recent tariff changes               │ │
│ │                                                              │ │
│ │ [Review Issues]                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ DUTY EXPOSURE BY COUNTRY                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🇨🇳 China      │████████████████████████│ $650K (73%)      │ │
│ │ 🇻🇳 Vietnam    │████████                │ $180K (20%)      │ │
│ │ 🇲🇽 Mexico     │██                      │ $40K  (4%)       │ │
│ │ 🇮🇳 India      │█                       │ $20K  (2%)       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 💡 OPTIMIZATION OPPORTUNITIES                    Total: $340K/yr│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 1. Country Reallocation (47 products)           $180K/yr    │ │
│ │    Switch high-tariff products to lower-tariff countries    │ │
│ │    [View Products] [Export List]                             │ │
│ │                                                              │ │
│ │ 2. FTA Qualification (23 products)              $120K/yr    │ │
│ │    Products from FTA countries that may qualify              │ │
│ │    [Start FTA Verification] [Export List]                    │ │
│ │                                                              │ │
│ │ 3. Classification Review (15 products)           $40K/yr    │ │
│ │    Products with potential alternative HTS codes             │ │
│ │    [Review Classifications] [Export List]                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ PRODUCT LIST                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Filter: [All ▼] [Country ▼] [Duty >50% ▼] Search: [______]  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SKU      │ Product        │ Country │ Duty  │ Status        │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ SKU-001  │ Cotton T-Shirt │ CN      │ 78%   │ ⚠️ High duty  │ │
│ │ SKU-002  │ Wireless Buds  │ VN      │ 27%   │ ✓ OK          │ │
│ │ SKU-003  │ Plastic Parts  │ MX      │ 0%    │ ✓ USMCA       │ │
│ │ SKU-004  │ Steel Bolts    │ CN      │ 103%  │ 🔴 232+301    │ │
│ │ ...                                                          │ │
│ │                                                              │ │
│ │ Showing 1-50 of 500    [← Previous] [Next →]                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Export Full Report] [Save to My Products] [Schedule Monitoring]│
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Drill-Down to Single Product

When user clicks on a product in the portfolio:

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Portfolio                                              │
│                                                                  │
│ SKU-001: Cotton T-Shirts                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ (Same single-product view as Section 3.3, with all              │
│  collapsible sections: Classification, Landed Cost,             │
│  Compare Countries, Compliance, Documentation, Optimization)    │
│                                                                  │
│ PORTFOLIO CONTEXT                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ This product represents:                                     │ │
│ │ • 8% of your total import value                              │ │
│ │ • 12% of your total duty paid                                │ │
│ │ • Highest duty rate in your portfolio                        │ │
│ │                                                              │ │
│ │ Similar products in portfolio:                               │ │
│ │ • SKU-015: Cotton Polo Shirts (same HTS)                    │ │
│ │ • SKU-089: Cotton Hoodies (same chapter)                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Apply Changes] [Add Note] [Flag for Review] [Remove from List] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. MY PORTFOLIO (Saved Products)

### 5.1 Portfolio Home

```
┌─────────────────────────────────────────────────────────────────┐
│ 📁 MY PRODUCTS                                    [+ Add] [Upload]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ALERTS                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 3 products have tariff changes since last week            │ │
│ │ 🟡 12 products may qualify for FTA (not verified)            │ │
│ │ 🟢 485 products up to date                                   │ │
│ │                                                              │ │
│ │ [Review Alerts]                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ QUICK STATS                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│ │ 500          │ │ $890K        │ │ $340K        │ │ 3         ││
│ │ Products     │ │ Annual Duty  │ │ Savings Opp. │ │ Alerts    ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│                                                                  │
│ PRODUCTS                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Filter: [All ▼] [Alerts ▼] [Country ▼]  Search: [________]  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SKU      │ Product        │ Country │ Duty  │ Status        │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ SKU-001  │ Cotton T-Shirt │ CN      │ 78%   │ ⚠️ +10% Apr 9 │ │
│ │ SKU-002  │ Wireless Buds  │ VN      │ 27%   │ ⚠️ +36% Apr 9 │ │
│ │ SKU-003  │ Plastic Parts  │ MX      │ 0%    │ ✓ Stable      │ │
│ │ ...                                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Export All] [Re-analyze All] [Set Up Email Alerts]             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. DANGEROUS GOODS DOCUMENTATION

### 6.1 Detection Logic

The system detects dangerous goods requirements based on:

1. **HTS Chapter:**
   - Chapter 28-29: Chemicals
   - Chapter 36: Explosives
   - Chapter 38: Chemical products
   - Chapter 85.06-85.07: Batteries

2. **Product Attributes (user-provided):**
   - Contains lithium battery
   - Contains chemicals
   - Flammable
   - Pressurized

3. **Keywords in description:**
   - "battery," "lithium," "li-ion"
   - "chemical," "solvent," "acid"
   - "aerosol," "spray," "pressurized"

### 6.2 Documentation Rules Engine

```typescript
interface DangerousGoodsRule {
  id: string;
  name: string;
  triggers: {
    htsChapters?: string[];
    htsCodes?: string[];
    keywords?: string[];
    productAttributes?: string[];
  };
  unClass?: string;           // UN classification
  packingGroup?: string;      // I, II, or III
  documents: DocumentRequirement[];
  carrierRestrictions?: string[];
  specialHandling?: string[];
}

interface DocumentRequirement {
  name: string;
  criticality: 'critical' | 'required' | 'recommended';
  description: string;
  agency?: string;
  templateUrl?: string;
  learnMoreUrl?: string;
}
```

### 6.3 Lithium Battery Documentation Display

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔋 LITHIUM BATTERY REQUIREMENTS                                  │
│                                                                  │
│ Your product contains lithium batteries. Special requirements:   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ UN CLASSIFICATION                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ UN3481: Lithium ion batteries contained in equipment         │ │
│ │ Class 9: Miscellaneous dangerous goods                       │ │
│ │ Packing Instruction: PI967 (Section II)                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🔴 CRITICAL DOCUMENTS                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ UN38.3 Test Summary                                        │ │
│ │   Proves batteries passed UN safety tests                    │ │
│ │   Must include:                                              │ │
│ │   • Manufacturer name and contact                            │ │
│ │   • Cell/battery identification                              │ │
│ │   • Test laboratory name                                     │ │
│ │   • Test report reference                                    │ │
│ │   • Summary of tests passed                                  │ │
│ │   • Watt-hour rating                                         │ │
│ │                                                              │ │
│ │   ⚠️ Your supplier MUST provide this. No exceptions.         │ │
│ │   [Request from Supplier Template] [UN38.3 Guide]            │ │
│ │                                                              │ │
│ │ ☐ Shipper's Declaration for Dangerous Goods                  │ │
│ │   Required for: Air freight                                  │ │
│ │   Not required for: Ocean freight (but recommended)          │ │
│ │   Your freight forwarder prepares this using UN38.3 data     │ │
│ │   [IATA DGD Form] [How to Complete]                          │ │
│ │                                                              │ │
│ │ ☐ Lithium Battery Handling Label                             │ │
│ │   Must be affixed to outer packaging                         │ │
│ │   [Label Specifications] [Order Labels]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟡 CARRIER RESTRICTIONS                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Watt-hour rating determines restrictions:                    │ │
│ │                                                              │ │
│ │ Your product: [Enter Wh rating: _____]                       │ │
│ │                                                              │ │
│ │ • ≤100 Wh: Standard shipping, most carriers accept          │ │
│ │ • >100 Wh: Restricted, requires carrier approval            │ │
│ │ • >160 Wh: Forbidden on passenger aircraft                  │ │
│ │                                                              │ │
│ │ Airline restrictions (varies by carrier):                    │ │
│ │ • Some airlines prohibit all lithium batteries              │ │
│ │ • Cargo-only aircraft may be required                        │ │
│ │ • Check with your forwarder before booking                   │ │
│ │                                                              │ │
│ │ [Carrier Restriction Database]                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 📦 PACKAGING REQUIREMENTS                                        │ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ PI967 Section II requirements:                               │ │
│ │ • Batteries must be protected from short circuit            │ │
│ │ • Equipment must be protected from activation               │ │
│ │ • Strong outer packaging                                     │ │
│ │ • Max 5 kg lithium ion cells per package                    │ │
│ │ • Lithium battery mark on outer package                      │ │
│ │                                                              │ │
│ │ [Packaging Guide] [Compliant Packaging Suppliers]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Chemical Products Documentation

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧪 CHEMICAL PRODUCT REQUIREMENTS                                 │
│                                                                  │
│ Your product contains chemicals. Special requirements:           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔴 CRITICAL DOCUMENTS                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ Safety Data Sheet (SDS/MSDS)                               │ │
│ │   16-section GHS format required                             │ │
│ │   Must be in English                                         │ │
│ │   Must include: Hazard classification, handling, storage     │ │
│ │   [SDS Requirements] [GHS Guide]                             │ │
│ │                                                              │ │
│ │ ☐ TSCA Certification                                         │ │
│ │   Toxic Substances Control Act compliance                    │ │
│ │   Required statement on commercial invoice:                  │ │
│ │   "I certify that all chemical substances in this           │ │
│ │    shipment comply with all applicable rules or orders      │ │
│ │    under TSCA and that I am not offering a chemical         │ │
│ │    substance for entry in violation of TSCA."               │ │
│ │   [TSCA Certification Language]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟡 MAY BE REQUIRED (Depends on chemical type)                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ EPA Registration (if pesticide/biocide)                    │ │
│ │ ☐ FDA Notification (if cosmetic ingredient)                  │ │
│ │ ☐ DOT Hazmat Papers (if hazardous for transport)            │ │
│ │ ☐ State-specific certifications (CA Prop 65, etc.)          │ │
│ │                                                              │ │
│ │ [Chemical Classification Tool]                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. COMPONENT ARCHITECTURE

### 7.1 File Structure

```
src/features/import-intelligence/
├── components/
│   ├── ImportIntelligencePage.tsx       # Main page orchestrator
│   ├── ModeSelector.tsx                  # Entry point selector
│   ├── ProductInput/
│   │   ├── ProductInputSection.tsx      # Main input component
│   │   ├── DescribeProduct.tsx          # Natural language input
│   │   ├── HtsCodeInput.tsx             # Direct HTS input
│   │   └── ProductAttributes.tsx        # Checkboxes for DG, etc.
│   ├── Results/
│   │   ├── ResultsContainer.tsx         # Accordion container
│   │   ├── ClassificationSection.tsx    # HTS classification
│   │   ├── LandedCostSection.tsx        # Cost breakdown
│   │   ├── CountryCompareSection.tsx    # Alternatives
│   │   ├── ComplianceSection.tsx        # Risks & alerts
│   │   ├── DocumentationSection.tsx     # Required docs
│   │   └── OptimizationSection.tsx      # Savings opportunities
│   ├── Bulk/
│   │   ├── BulkUpload.tsx               # File upload
│   │   ├── ProcessingStatus.tsx         # Progress indicator
│   │   └── PortfolioDashboard.tsx       # Results dashboard
│   ├── Portfolio/
│   │   ├── MyProductsPage.tsx           # Saved products
│   │   ├── ProductCard.tsx              # Individual product
│   │   └── AlertsBanner.tsx             # Tariff change alerts
│   └── Documentation/
│       ├── DocumentChecklist.tsx        # Main checklist
│       ├── DangerousGoodsSection.tsx    # DG-specific docs
│       ├── PGARequirements.tsx          # Agency requirements
│       └── DocumentTemplate.tsx         # Template download
├── hooks/
│   ├── useImportAnalysis.ts             # Main analysis hook
│   ├── useDocumentationRules.ts         # Doc requirements
│   ├── useDangerousGoods.ts             # DG detection
│   └── usePortfolio.ts                  # Saved products
├── services/
│   ├── analysisOrchestrator.ts          # Coordinates all analyses
│   ├── documentationRules.ts            # Rules engine
│   ├── dangerousGoodsClassifier.ts      # DG classification
│   └── portfolioManager.ts              # CRUD for saved products
├── data/
│   ├── documentationRules.ts            # Static rules data
│   ├── dangerousGoodsRules.ts           # DG rules data
│   └── carrierRestrictions.ts           # Carrier-specific rules
└── types/
    └── import-intelligence.types.ts     # TypeScript types
```

### 7.2 Key Types

```typescript
// Main analysis result
interface ImportAnalysis {
  id: string;
  createdAt: Date;
  
  // Input
  input: {
    description?: string;
    htsCode?: string;
    countryCode: string;
    value: number;
    quantity: number;
    attributes: ProductAttributes;
  };
  
  // Classification
  classification: {
    htsCode: string;
    description: string;
    confidence: number;
    alternatives: HtsAlternative[];
    path: string[];
  };
  
  // Landed Cost
  landedCost: {
    productValue: number;
    shipping: number;
    insurance: number;
    duties: DutyBreakdown;
    fees: FeeBreakdown;
    estimatedAdditional: AdditionalCosts;
    total: number;
    perUnit: number;
  };
  
  // Country Comparison
  countryComparison: {
    current: CountryOption;
    alternatives: CountryOption[];
    recommendation: string;
  };
  
  // Compliance
  compliance: {
    alerts: ComplianceAlert[];
    passedChecks: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Documentation
  documentation: {
    critical: DocumentRequirement[];
    required: DocumentRequirement[];
    recommended: DocumentRequirement[];
    dangerousGoods?: DangerousGoodsRequirements;
  };
  
  // Optimization
  optimization: {
    opportunities: OptimizationOpportunity[];
    totalPotentialSavings: number;
    topRecommendation: string;
  };
}

interface ProductAttributes {
  containsBattery: boolean;
  containsChemicals: boolean;
  forChildren: boolean;
  foodContact: boolean;
  wireless: boolean;
  medicalDevice: boolean;
  pressurized: boolean;
  flammable: boolean;
}

interface DangerousGoodsRequirements {
  unClass: string;
  unNumber: string;
  properShippingName: string;
  hazardClass: string;
  packingGroup?: string;
  packingInstruction: string;
  documents: DocumentRequirement[];
  carrierRestrictions: CarrierRestriction[];
  packagingRequirements: string[];
  labelingRequirements: string[];
}
```

---

## 8. API ENDPOINTS

### 8.1 Single Product Analysis

```
POST /api/import-intelligence/analyze

Request:
{
  "description": "Wireless Bluetooth earbuds with charging case",
  "htsCode": null,  // Optional, will classify if not provided
  "countryCode": "CN",
  "value": 10000,
  "quantity": 1000,
  "attributes": {
    "containsBattery": true,
    "wireless": true
  }
}

Response:
{
  "success": true,
  "data": ImportAnalysis  // Full analysis object
}
```

### 8.2 Bulk Analysis

```
POST /api/import-intelligence/bulk

Request:
{
  "products": [
    { "sku": "SKU-001", "description": "...", "countryCode": "CN", "value": 10000 },
    { "sku": "SKU-002", "description": "...", "countryCode": "VN", "value": 5000 },
    // ... up to 5000 products
  ]
}

Response:
{
  "success": true,
  "data": {
    "analysisId": "bulk-123",
    "status": "processing",
    "progress": 0,
    "estimatedTime": 300  // seconds
  }
}

// Poll for status
GET /api/import-intelligence/bulk/bulk-123

Response:
{
  "status": "complete",
  "progress": 100,
  "results": PortfolioAnalysis
}
```

### 8.3 Documentation Requirements

```
GET /api/import-intelligence/documentation?htsCode=8518302000&countryCode=CN&attributes=containsBattery,wireless

Response:
{
  "success": true,
  "data": {
    "critical": [...],
    "required": [...],
    "recommended": [...],
    "dangerousGoods": {...}
  }
}
```

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation ✅ COMPLETE
- [x] Create `/dashboard/import` route structure
- [x] Build ModeSelector component
- [x] Build ProductInput section
- [x] Integrate existing classification API
- [x] Integrate existing landed cost API
- [x] Build ResultsContainer with accordion

### Phase 2: Core Sections ✅ COMPLETE
- [x] Build LandedCostSection (enhanced from current)
- [x] Build CountryCompareSection (integrate Sourcing)
- [x] Build ComplianceSection (aggregate existing alerts)
- [x] Build OptimizationSection (integrate existing tools)

### Phase 3: Documentation ⚠️ PARTIAL
- [x] Build DocumentationSection UI
- [x] Add lithium battery specific logic (basic)
- [ ] Build comprehensive documentation rules engine
- [ ] Create dangerous goods classifier (full implementation)
- [ ] Add template downloads

### Phase 4: Bulk & Portfolio ✅ COMPLETE
- [x] Build BulkUpload component
- [x] Build ProcessingStatus component
- [x] Build PortfolioDashboard
- [x] Build MyProductsPage
- [ ] Add monitoring/alerts integration (backend needed)

### Phase 5: Polish 🚧 IN PROGRESS
- [ ] Add PDF export
- [ ] Add Excel export
- [ ] Add email alerts setup
- [x] Performance optimization (fallback calculations added)
- [ ] Mobile responsiveness (needs testing)
- [ ] User testing & iteration

---

## 10. SUCCESS METRICS

### User Engagement
- Time to complete analysis (target: <60 seconds for single product)
- Section expansion rate (which sections do users open?)
- Bulk upload adoption rate
- Products saved to portfolio

### Business Impact
- Conversion from free to paid (if feature-gated)
- User retention (return visits)
- Optimization recommendations acted upon
- Support ticket reduction (self-service)

### Quality
- Classification accuracy
- Landed cost accuracy vs. actual
- Documentation completeness
- Alert relevance

---

## 11. IMPLEMENTATION STATUS

**Last Updated:** January 30, 2026

### ✅ Completed Features

**Core Functionality:**
- Full UI implementation matching specification
- API endpoint: `POST /api/import-intelligence/analyze`
- Real-time classification using engine-v10
- Landed cost calculation with fallback for missing data
- Country comparison across 4 alternatives
- UFLPA compliance detection for cotton/textiles from China
- Basic documentation requirements
- Optimization opportunity identification

**UI Components:**
- ModeSelector with 3 modes (Single/Bulk/Portfolio)
- ProductInputSection with 3 input methods (Describe/HTS/Saved)
- ResultsContainer with 6 collapsible sections
- CountryCompareSection with sortable table
- ComplianceSection with alert levels
- DocumentationSection with dangerous goods detection
- OptimizationSection with savings calculations
- BulkUpload with file upload interface
- ProcessingStatus with progress tracking
- PortfolioDashboard with summary stats
- MyPortfolioPage with saved products

**Navigation:**
- Import Intelligence menu item in sidebar
- All routes functional (`/import`, `/import/analyze`, `/import/bulk`, `/import/portfolio`)

### 🚧 In Progress / Remaining Work

**High Priority:**
- Comprehensive documentation rules engine (currently basic)
- Full dangerous goods classifier implementation
- Document template downloads
- Backend for bulk processing (currently mock)
- Monitoring/alerts integration

**Medium Priority:**
- PDF export functionality
- Excel/CSV export
- Email alerts setup
- Mobile responsiveness testing and fixes

**Low Priority:**
- User testing and iteration
- Performance optimization for large datasets
- Advanced filtering and search in portfolio

### 📊 Completion Status

- **Phase 1 (Foundation):** 100% ✅
- **Phase 2 (Core Sections):** 100% ✅
- **Phase 3 (Documentation):** 40% ⚠️
- **Phase 4 (Bulk & Portfolio):** 80% 🚧
- **Phase 5 (Polish):** 20% 🚧

**Overall Progress:** ~75% complete

---

*Document Version: 1.1*
*Last Updated: January 30, 2026*
