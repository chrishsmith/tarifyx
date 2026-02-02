# Import Intelligence AI Agent - "Aria" Specification

> **Version:** 1.0  
> **Created:** January 29, 2026  
> **Status:** SPECIFICATION (FUTURE VISION)  
> **Inspiration:** [Claude Cowork](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)

---

## EXECUTIVE SUMMARY

**Aria** is a trade intelligence AI agent that goes beyond chat - it **creates real outputs** using external tools:

| Capability | What Aria Does | Tools Used |
|------------|---------------|------------|
| **Data Analysis** | Query databases, aggregate metrics, find patterns | Neon, Supabase, Sourcify DB |
| **Visualizations** | Create charts, maps, dashboards | Chart MCP, Mapbox, D3 |
| **Design** | Generate infographics, branded materials | Figma, Canva |
| **Documents** | Excel with formulas, PowerPoint, PDFs | Excel MCP, PowerPoint MCP, PDF MCP |
| **Research** | Browse web, verify suppliers, check regulations | Browser MCP |
| **Actions** | Send emails, request quotes, schedule meetings | Email, Calendar MCPs |
| **Monitoring** | Watch for tariff changes, alert on risks | Background agents |

**Key Cowork-Inspired Features:**
- **MCP Tool Integration** - Connects to external services (Figma, databases, browsers)
- **Sub-Agent Coordination** - Breaks complex tasks into parallel workstreams
- **Professional Outputs** - Excel with working formulas, not just CSVs
- **Long-Running Tasks** - Can work for extended periods without timeout
- **Transparency** - Shows what it's doing at each step

---

## 1. VISION

### The Future of Trade Intelligence

Traditional trade compliance software is **tool-centric**: users navigate forms, tables, and reports. They must know what to ask and where to find it.

**Aria** is **human-centric**: an intelligent agent that understands your business, monitors on your behalf, synthesizes insights, and takes action with your permission.

### Design Philosophy

1. **Conversation, Not Forms** - Express intent naturally, not through form fields
2. **Insight, Not Data** - Receive synthesized recommendations, not raw tables
3. **Proactive, Not Reactive** - Get alerts before problems happen
4. **Action, Not Just Information** - Agent can execute tasks, not just inform
5. **Continuous, Not Transactional** - Ongoing relationship, not one-off queries

### Inspiration: Claude Cowork

Like [Claude Cowork](https://support.claude.com/en/articles/13345190-getting-started-with-cowork), Aria:
- Breaks complex work into subtasks
- Coordinates parallel workstreams
- Produces professional outputs (documents, spreadsheets, reports)
- Works on long-running tasks without interruption
- Maintains transparency into what it's doing

Unlike Cowork (which is general-purpose), Aria is **domain-specific** for trade intelligence, with deep knowledge of:
- HTS classification
- Tariff programs (301, IEEPA, 232, etc.)
- FTA qualification rules
- Compliance requirements
- Supplier landscapes
- Documentation requirements

### The Cowork Model: MCP Tool Integration

The key innovation of Cowork is its **MCP (Model Context Protocol) integration**. Rather than just generating text responses, Cowork connects to external tools and services to produce real, tangible outputs:

- **Direct file access** - Read/write to local files
- **External tool connections** - Figma, databases, browsers, APIs
- **Professional output generation** - Excel with formulas, PowerPoint, PDFs
- **Sub-agent coordination** - Break work into parallel tasks
- **Long-running execution** - Work for extended periods without timeout

Aria adopts this same architecture but specialized for trade intelligence workflows.

---

## 2. MCP TOOL ECOSYSTEM

### 2.1 What Are MCPs?

MCPs (Model Context Protocol servers) are connectors that give Aria access to external tools and services. Each MCP exposes specific capabilities that Aria can invoke during task execution.

### 2.2 Trade Intelligence MCP Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARIA AGENT                                │
│                                                                  │
│  "Generate a sourcing comparison with supplier locations map"   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MCP ORCHESTRATION LAYER                      │
│                                                                  │
│  Aria breaks the task into sub-tasks and routes to MCPs:        │
│                                                                  │
│  1. Query tariff data → Sourcify Database MCP                   │
│  2. Generate comparison chart → Chart Generation MCP            │
│  3. Create supplier map → Mapbox/Google Maps MCP                │
│  4. Design presentation → Figma MCP                             │
│  5. Generate Excel file → Document Generation MCP               │
│  6. Send to user → File System / Email MCP                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Core MCPs for Trade Intelligence

#### Data & Analysis MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Sourcify Database** | Access HTS, tariffs, rulings | Query tariff rates, search rulings, get HTS hierarchy |
| **Trade Statistics** | USITC DataWeb, trade flows | Get import volumes, historical trends, country data |
| **Supplier Database** | Supplier profiles, verification | Search suppliers, get ratings, request quotes |
| **Compliance Lists** | OFAC, BIS, UFLPA entities | Screen parties, check restrictions |

#### Visualization MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Chart Generator** | Create data visualizations | Bar charts, line graphs, pie charts, treemaps |
| **Map Services** | Geographic visualizations | Supplier locations, shipping routes, country heat maps |
| **Diagram Builder** | Process flows, hierarchies | Supply chain diagrams, HTS trees, decision flows |

#### Document Generation MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Excel Generator** | Spreadsheets with formulas | Cost models, comparison tables, data exports |
| **PDF Generator** | Professional reports | Executive summaries, compliance reports, certificates |
| **PowerPoint Generator** | Presentations | Sourcing proposals, board decks, training materials |
| **Word Generator** | Documents | Compliance memos, broker instructions, contracts |

#### Design MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Figma** | UI mockups, infographics | Create visual summaries, design custom reports |
| **Canva** | Marketing materials | One-pagers, supplier comparisons, social graphics |

#### External Service MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Email** | Send communications | Deliver reports, request quotes, notify team |
| **Calendar** | Scheduling | Book broker consultations, set reminders |
| **Browser** | Web research | Verify supplier websites, check CBP rulings |
| **Slack/Teams** | Team notifications | Alert channels, share findings |

#### Database MCPs

| MCP | Purpose | Example Actions |
|-----|---------|-----------------|
| **Neon/Supabase** | Direct database access | Complex queries, data updates, migrations |
| **Vector Search** | Semantic search | Find similar products, search rulings by meaning |

### 2.4 MCP-Powered Workflows

#### Example 1: "Create a sourcing proposal for my CEO"

```
USER: "Create a presentation comparing China vs Vietnam sourcing 
       for our top 10 products. Make it board-ready."

ARIA: I'll create a professional sourcing proposal. Let me gather 
      the data and build the presentation.
      
      ◉ Working...
      
      ├─ [Sourcify DB] Pulling your top 10 products by duty paid
      ├─ [Sourcify DB] Calculating landed costs for both countries
      ├─ [Trade Stats] Getting import volume trends
      ├─ [Supplier DB] Finding top suppliers in each country
      ├─ [Map MCP] Creating supplier location visualization
      ├─ [Chart MCP] Building cost comparison charts
      ├─ [PowerPoint MCP] Assembling presentation
      └─ [Figma MCP] Designing executive summary infographic
      
      ─────────────────────────────────────────────────────────────
      
      Done! I've created:
      
      📊 SOURCING PROPOSAL: China vs Vietnam
      
      DELIVERABLES:
      1. PowerPoint Presentation (18 slides)
         • Executive summary
         • Product-by-product analysis
         • Cost comparison charts
         • Supplier recommendations
         • Risk assessment
         • Implementation timeline
         
      2. Excel Model (5 tabs)
         • Detailed cost breakdown
         • Sensitivity analysis
         • Supplier comparison matrix
         • ROI calculator (with formulas)
         
      3. One-Page Infographic (Figma)
         • Visual summary for quick review
         • Shareable with stakeholders
      
      [Download All] [Open in Figma] [Send to CEO]
```

#### Example 2: "Visualize my tariff exposure"

```
USER: "Show me a visual breakdown of where my duty dollars are going"

ARIA: I'll create an interactive visualization of your tariff exposure.
      
      ◉ Working...
      
      ├─ [Sourcify DB] Aggregating duty by country, product, tariff type
      ├─ [Chart MCP] Creating treemap of duty by country
      ├─ [Chart MCP] Creating stacked bar of tariff layers
      ├─ [Chart MCP] Creating trend line of duty over time
      ├─ [Map MCP] Creating world heat map of exposure
      └─ [Figma MCP] Designing dashboard layout
      
      ─────────────────────────────────────────────────────────────
      
      [WORKSPACE displays interactive dashboard]
      
      ┌─────────────────────────────────────────────────────────┐
      │  YOUR TARIFF EXPOSURE - $890K Annual                    │
      ├─────────────────────────────────────────────────────────┤
      │                                                          │
      │  BY COUNTRY (Treemap)         BY TARIFF TYPE (Stacked)  │
      │  ┌─────────────────────┐     ┌─────────────────────┐   │
      │  │ ████████████████    │     │ ████ Base MFN       │   │
      │  │ █ China $650K ████  │     │ ████ Section 301    │   │
      │  │ ████████████████    │     │ ████ IEEPA Fentanyl │   │
      │  │ ████ Vietnam $180K  │     │ ████ IEEPA Recip.   │   │
      │  │ ██ Mexico $40K      │     │ ████ Section 232    │   │
      │  └─────────────────────┘     └─────────────────────┘   │
      │                                                          │
      │  TREND OVER TIME              GEOGRAPHIC HEAT MAP       │
      │  ┌─────────────────────┐     ┌─────────────────────┐   │
      │  │      ╱──────        │     │   [World map with   │   │
      │  │    ╱                │     │    countries shaded │   │
      │  │ ──╱                 │     │    by duty amount]  │   │
      │  │ 2023  2024  2025    │     │                     │   │
      │  └─────────────────────┘     └─────────────────────┘   │
      │                                                          │
      └─────────────────────────────────────────────────────────┘
      
      KEY INSIGHT: 73% of your duty exposure is from China.
      IEEPA tariffs alone cost you $340K this year.
      
      [Download Dashboard] [Export to PowerPoint] [Share Link]
```

#### Example 3: "Design a compliance checklist for my team"

```
USER: "Create a visual compliance checklist my team can use 
       when onboarding new China suppliers"

ARIA: I'll design a professional compliance checklist.
      
      ◉ Working...
      
      ├─ [Sourcify DB] Getting China-specific compliance requirements
      ├─ [Compliance MCP] Pulling UFLPA, Section 301, screening reqs
      ├─ [Figma MCP] Designing checklist template
      ├─ [PDF MCP] Creating printable version
      └─ [Word MCP] Creating editable version
      
      ─────────────────────────────────────────────────────────────
      
      Done! I've created a China Supplier Compliance Checklist:
      
      [WORKSPACE shows Figma design preview]
      
      ┌─────────────────────────────────────────────────────────┐
      │  🇨🇳 CHINA SUPPLIER COMPLIANCE CHECKLIST                 │
      │  Version 1.0 • January 2026                              │
      ├─────────────────────────────────────────────────────────┤
      │                                                          │
      │  BEFORE ENGAGEMENT                                       │
      │  ☐ Denied party screening (OFAC, BIS, UFLPA)           │
      │  ☐ Entity list verification                             │
      │  ☐ Xinjiang region check                                │
      │  ☐ Business license verification                        │
      │                                                          │
      │  DUE DILIGENCE                                           │
      │  ☐ Factory audit (social compliance)                    │
      │  ☐ Supply chain mapping                                 │
      │  ☐ Forced labor declaration                             │
      │  ☐ Cotton/polysilicon origin verification               │
      │                                                          │
      │  DOCUMENTATION                                           │
      │  ☐ Supplier declaration form                            │
      │  ☐ Traceability documentation                           │
      │  ☐ Audit reports on file                                │
      │                                                          │
      │  [Branded with your company logo]                        │
      └─────────────────────────────────────────────────────────┘
      
      DELIVERABLES:
      • Figma file (editable, add your branding)
      • PDF (print-ready, 1 page)
      • Word doc (editable checklist)
      • Google Form (digital submission)
      
      [Open in Figma] [Download PDF] [Download Word] [Create Form]
```

### 2.5 Custom MCP Development

For enterprise customers, Aria can connect to custom MCPs:

```typescript
// Example: Custom ERP MCP for SAP integration

interface SAPMcpTools {
  // Product data
  getProductMaster(materialNumber: string): Product;
  searchProducts(query: string): Product[];
  
  // Purchase orders
  getPurchaseOrders(filters: POFilters): PurchaseOrder[];
  createPurchaseOrder(po: NewPurchaseOrder): PurchaseOrder;
  
  // Vendor data
  getVendor(vendorId: string): Vendor;
  searchVendors(query: string): Vendor[];
  
  // Customs data
  getImportDeclarations(filters: DeclarationFilters): Declaration[];
  getCustomsInvoices(poNumber: string): CustomsInvoice[];
}

// Aria can then use these tools:
USER: "Pull all POs from last quarter with duty over $10K"

ARIA: ◉ Working...
      ├─ [SAP MCP] Querying purchase orders Q4 2025
      ├─ [Sourcify DB] Calculating duty for each PO
      ├─ [Excel MCP] Creating filtered report
      
      Found 47 POs with duty over $10K.
      Total duty: $892,000
      
      [Download Excel Report]
```

---

## 3. USER EXPERIENCE

### 2.1 The Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                            ◉                                     │
│                          ARIA                                    │
│               Your Trade Intelligence Agent                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  CONVERSATION              │  WORKSPACE                          │
│  ─────────────────────────│─────────────────────────────────────│
│                           │                                      │
│  [Conversation thread     │  [Rich visual outputs:               │
│   with Aria - natural     │   - Charts & graphs                  │
│   language back and       │   - Comparison tables                │
│   forth]                  │   - Cost breakdowns                  │
│                           │   - Documents                        │
│                           │   - Maps                             │
│                           │   - Timelines]                       │
│                           │                                      │
│  ┌─────────────────────┐ │                                      │
│  │ Ask Aria...         │ │                                      │
│  └─────────────────────┘ │                                      │
│                           │                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Conversation Modes

#### Mode 1: Quick Query
User asks a simple question, gets immediate answer.

```
USER: "What's the duty rate on cotton t-shirts from China?"

ARIA: Cotton t-shirts (HTS 6109.10.00.12) from China currently face 
      78% total duty:
      
      • Base MFN: 16.5%
      • Section 301: 7.5%
      • IEEPA Fentanyl: 20%
      • IEEPA Reciprocal: 34%
      
      This is one of the highest-duty product/country combinations.
      Would you like me to find lower-cost alternatives?
```

#### Mode 2: Analysis Task
User requests analysis, Aria works on it.

```
USER: "Analyze my options for importing wireless earbuds"

ARIA: I'll analyze wireless earbuds importing options for you.
      
      ◉ Working...
      
      ├─ Classifying product
      ├─ Calculating duties by country
      ├─ Checking compliance requirements
      └─ Finding optimization opportunities
      
      [WORKSPACE shows progress and intermediate results]
      
      ─────────────────────────────────────────────────────────
      
      Analysis complete. Here's what I found:
      
      [Summary in conversation]
      [Detailed breakdown in workspace]
```

#### Mode 3: Long-Running Task
User requests complex work, Aria executes over time.

```
USER: "Analyze my entire product catalog and find all savings opportunities"

ARIA: I'll analyze your 500 products. This will take about 10 minutes.
      
      You can:
      • Watch the progress here
      • Step away and I'll notify you when done
      • Ask me questions while I work
      
      ◉ Analyzing products... (47/500)
      
      [Progress updates in real-time]
      
      ─────────────────────────────────────────────────────────
      
      [10 minutes later]
      
      Analysis complete! I found $340,000 in potential annual savings.
      
      Key findings:
      1. 47 products could switch countries (save $180K)
      2. 23 products may qualify for FTA (save $120K)
      3. 15 products have classification alternatives (save $40K)
      
      I've prepared a detailed report. Want me to:
      • Walk you through the top opportunities?
      • Generate an executive summary for your team?
      • Create action items for your broker?
```

#### Mode 4: Proactive Alert
Aria initiates conversation based on monitoring.

```
ARIA: 🔔 Tariff Alert
      
      Vietnam's IEEPA rate increased from 10% to 46% yesterday.
      
      This affects 12 of your products:
      • SKU-023, SKU-045, SKU-089... (+8 more)
      
      Annual impact: +$36,200 in duties
      
      I've identified 3 mitigation options:
      1. Shift to India (similar cost, lower tariff)
      2. Accelerate Mexico sourcing (USMCA = 0%)
      3. Absorb cost (margin impact: -4.2%)
      
      Want me to model any of these scenarios?
```

### 2.3 Rich Workspace Outputs

Aria doesn't just respond with text. It generates rich visual outputs:

#### Charts & Graphs
```
┌─────────────────────────────────────────────────────────────────┐
│ DUTY EXPOSURE BY COUNTRY                                        │
│                                                                  │
│ $700K ┤                                                         │
│       │ ████                                                    │
│ $500K ┤ ████                                                    │
│       │ ████  ████                                              │
│ $300K ┤ ████  ████                                              │
│       │ ████  ████  ████                                        │
│ $100K ┤ ████  ████  ████  ████                                  │
│       └──────────────────────────────────────────               │
│         China Vietnam India Mexico                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Comparison Tables
```
┌─────────────────────────────────────────────────────────────────┐
│ SOURCING COMPARISON                                             │
├─────────────────────────────────────────────────────────────────┤
│           │ China    │ Vietnam  │ Mexico   │ India    │        │
│ ──────────┼──────────┼──────────┼──────────┼──────────┤        │
│ Duty Rate │ 78%      │ 27%      │ 0%*      │ 35%      │        │
│ Lead Time │ 25 days  │ 30 days  │ 5 days   │ 35 days  │        │
│ Suppliers │ Many     │ Good     │ Limited  │ Good     │        │
│ Risk      │ High     │ Medium   │ Low      │ Medium   │        │
│ ──────────┼──────────┼──────────┼──────────┼──────────┤        │
│ LANDED    │ $19,147  │ $12,647  │ $10,350  │ $13,547  │        │
│                                                                  │
│ * Requires USMCA qualification                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Generated Documents
```
┌─────────────────────────────────────────────────────────────────┐
│ 📄 GENERATED DOCUMENT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  IMPORT COST ANALYSIS REPORT                            │   │
│  │  Prepared by Aria • January 29, 2026                    │   │
│  │                                                          │   │
│  │  Executive Summary                                       │   │
│  │  Your company paid $890,000 in import duties last       │   │
│  │  year. This analysis identifies $340,000 in potential   │   │
│  │  annual savings through three strategies...             │   │
│  │                                                          │   │
│  │  [Full professional report with charts, tables, etc.]   │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Download PDF] [Download Excel] [Email to Team]                │
└─────────────────────────────────────────────────────────────────┘
```

#### Interactive Maps
```
┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ SUPPLIER LOCATIONS                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Interactive world map showing:]                               │
│  • Your current suppliers (red pins)                            │
│  • Recommended alternatives (green pins)                        │
│  • Shipping routes                                              │
│  • Transit times                                                │
│                                                                  │
│  Click any pin for supplier details                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. ENTERPRISE CAPABILITIES

### 3.1 The Enterprise Challenge

For a single product, conversational AI is perfect. But enterprise customers have:
- 500-10,000+ products
- Multiple team members
- Compliance requirements
- Audit trails
- Scheduled reporting
- System integrations

Aria handles this through **Portfolio Intelligence** and **Autonomous Operations**.

### 3.2 Portfolio Intelligence

Instead of analyzing one product at a time, Aria understands your entire portfolio:

```
USER: "How are my imports doing?"

ARIA: Here's your January 2026 portfolio summary:
      
      OVERVIEW
      ├─ 500 active products
      ├─ $2.4M monthly import value
      ├─ $890K monthly duty (37% effective rate)
      └─ vs. December: +$45K duty (+5%)
      
      WHAT CHANGED
      The increase is due to:
      • Vietnam rate hike: +$28K (12 products)
      • Higher China volume: +$12K (seasonal)
      • New SKU launches: +$5K (3 products)
      
      ATTENTION NEEDED
      🔴 3 products have compliance issues
      🟡 8 products have optimization opportunities
      🟢 489 products are healthy
      
      [Workspace shows portfolio dashboard]
      
      Want me to drill into any of these?
```

### 3.3 Batch Operations

Aria can perform operations across your entire portfolio:

```
USER: "Find all products that could benefit from FTA qualification"

ARIA: I'll scan your portfolio for FTA opportunities.
      
      ◉ Analyzing 500 products...
      
      Found 47 products from FTA countries that may qualify:
      
      BY FTA:
      • USMCA (Mexico): 23 products, $120K potential savings
      • KORUS (Korea): 15 products, $45K potential savings
      • AUSFTA (Australia): 9 products, $22K potential savings
      
      TOTAL POTENTIAL SAVINGS: $187,000/year
      
      ⚠️ Note: FTA qualification requires BOM verification.
      These are candidates, not confirmed qualifications.
      
      Want me to:
      • Prioritize by savings potential?
      • Generate a verification checklist for your team?
      • Start the qualification process for top candidates?
```

### 3.4 Scheduled Operations

Aria can run tasks on a schedule:

```
USER: "Every Monday, send me a summary of tariff changes affecting my products"

ARIA: I've set up a weekly tariff monitoring report.
      
      SCHEDULE: Every Monday at 8:00 AM
      
      REPORT INCLUDES:
      • Tariff changes in the past week
      • Products affected
      • Dollar impact
      • Recommended actions
      
      DELIVERY: Email to you (chris@company.com)
      
      Want to add anyone else to this report?
      
      [First report will be sent Monday, February 3]
```

### 3.5 Team Collaboration

Aria understands team context:

```
USER: "Share the Vietnam analysis with Sarah for review"

ARIA: I'll share the Vietnam sourcing analysis with Sarah.
      
      SHARED: Vietnam Sourcing Analysis (Jan 29, 2026)
      WITH: Sarah Chen (sarah@company.com)
      PERMISSION: Can view and comment
      
      Sarah will receive an email notification.
      
      Want me to add a note for her?

USER: "Yes, ask her to review the supplier recommendations"

ARIA: Done. I've added your note:
      
      "Sarah - please review the supplier recommendations 
       in Section 3. Let me know if you have questions. -Chris"
      
      Sarah can respond directly in the shared workspace,
      and I'll notify you when she does.
```

### 3.6 Audit Trail

For compliance teams, Aria maintains detailed records:

```
USER: "Show me the audit trail for SKU-045 classification"

ARIA: Here's the classification history for SKU-045:
      
      CURRENT CLASSIFICATION
      HTS: 6109.10.00.12
      Classified: January 15, 2026
      By: Aria (AI-assisted)
      Approved by: Chris Smith
      
      DECISION RECORD
      ┌─────────────────────────────────────────────────────────┐
      │ Product: Cotton T-Shirts                                 │
      │                                                          │
      │ Classification reasoning:                                │
      │ • Knit construction → Chapter 61 (not 62)               │
      │ • >50% cotton by weight → 6109.10 (not 6109.90)        │
      │ • T-shirt construction → .00.12 statistical suffix      │
      │                                                          │
      │ Supporting evidence:                                     │
      │ • Supplier spec sheet (attached)                        │
      │ • Lab test: 95% cotton, 5% elastane                     │
      │ • CBP Ruling N123456 (similar product)                  │
      │                                                          │
      │ Alternatives considered:                                 │
      │ • 6109.90.10.40 - Rejected (cotton >50%)               │
      │ • 6110.20.20.10 - Rejected (not sweater/pullover)      │
      └─────────────────────────────────────────────────────────┘
      
      CHANGE HISTORY
      • Jan 15, 2026: Initial classification (Aria + Chris)
      • No changes since
      
      [Download Audit Report]
```

---

## 4. AGENT CAPABILITIES

### 4.1 Tool Functions

Aria has access to these tools (similar to Cowork's capabilities):

```typescript
// Classification
classifyProduct(description: string): HtsClassification
findAlternativeClassifications(description: string): HtsAlternative[]
explainClassification(htsCode: string): ClassificationExplanation

// Cost Calculation
calculateLandedCost(params: LandedCostInput): LandedCostResult
compareCountries(htsCode: string): CountryComparison[]
estimateShippingCost(origin: string, destination: string, weight: number): number

// Compliance
checkDeniedParties(name: string): DeniedPartyResult
checkADCVD(htsCode: string, country: string): ADCVDResult
getComplianceAlerts(htsCode: string, country: string): ComplianceAlert[]
getDocumentationRequirements(htsCode: string, attributes: ProductAttributes): DocumentRequirement[]

// FTA
checkFTAEligibility(htsCode: string, country: string): FTAEligibility
calculateRVC(bom: BOMComponent[], transactionValue: number): RVCResult
getFTARules(htsCode: string, ftaCode: string): FTARule[]

// Suppliers
findSuppliers(htsCode: string, country: string): Supplier[]
getSupplierProfile(supplierId: string): SupplierProfile
requestQuote(supplierId: string, productDetails: ProductDetails): QuoteRequest

// Portfolio
getPortfolioSummary(): PortfolioSummary
getProductAnalysis(sku: string): ProductAnalysis
findOptimizationOpportunities(): OptimizationOpportunity[]

// Monitoring
getTariffChanges(since: Date): TariffChange[]
getAffectedProducts(tariffChange: TariffChange): Product[]
setAlert(alertConfig: AlertConfig): Alert

// Document Generation
generateReport(reportType: string, data: any): Document
generateChecklist(requirements: DocumentRequirement[]): Checklist
generateCertificateOfOrigin(product: Product, fta: string): Document

// Data Retrieval
getHtsHistory(htsCode: string): HtsHistoryEntry[]
getCBPRulings(htsCode: string): CBPRuling[]
getTradeStatistics(htsCode: string): TradeStats
```

### 4.2 Document Generation (Cowork-Style)

Like Cowork, Aria doesn't just describe documents - it **actually creates them** with:
- Working formulas in Excel
- Proper formatting and styling
- Interactive elements where applicable
- Professional design standards
- Direct file delivery to your system

#### Excel Spreadsheets (With Working Formulas)

Unlike simple CSV exports, Aria generates **real Excel files** with:

```
USER: "Create a spreadsheet comparing all my China products with Vietnam alternatives"

ARIA: I'll create that comparison spreadsheet.
      
      ◉ Generating...
      
      ├─ [Sourcify DB] Pulling 247 China products
      ├─ [Sourcify DB] Calculating Vietnam alternatives
      ├─ [Excel MCP] Building workbook structure
      ├─ [Excel MCP] Adding formulas and formatting
      └─ [File System] Saving to your Downloads
      
      Done! I've created an Excel file with:
      
      SHEETS:
      1. Summary - Key metrics and recommendations
      2. Product Comparison - Side-by-side China vs Vietnam
      3. Cost Breakdown - Detailed duty calculations
      4. Supplier Options - Vietnam suppliers by product
      5. Action Plan - Prioritized switching recommendations
      
      WORKING FORMULAS INCLUDED:
      • =VLOOKUP() for product matching
      • =SUMIFS() for category totals
      • =IF() logic for recommendation flags
      • Conditional formatting rules
      • Data validation dropdowns
      • Pivot tables with slicers
      • Charts linked to data
      
      EXAMPLE FORMULA (Cell E5):
      =IF(D5>C5,"⚠️ Higher",IF(D5<C5,"✓ Savings","= Same"))
      
      [Download: China_Vietnam_Comparison.xlsx]
      [Open in Google Sheets]
      [Preview in Workspace]
```

**What makes this different from typical exports:**

| Traditional Export | Aria-Generated Excel |
|-------------------|---------------------|
| Static CSV data | Dynamic .xlsx with formulas |
| No formatting | Professional styling |
| Single flat table | Multiple linked sheets |
| Manual analysis needed | Built-in calculations |
| No visualizations | Embedded charts |
| Copy/paste to analyze | Ready-to-use model |

#### PDF Reports
```
USER: "Generate an executive report on our tariff exposure"

ARIA: I'll create an executive tariff exposure report.
      
      ◉ Generating...
      
      Done! Here's your report:
      
      TARIFF EXPOSURE ANALYSIS
      Prepared for: Acme Corp
      Date: January 29, 2026
      
      [Professional PDF with:]
      • Executive summary
      • Duty breakdown by country/product
      • Risk assessment
      • Optimization recommendations
      • Financial projections
      • Appendix with detailed data
      
      [Download PDF] [Email to Leadership]
```

#### Visual Infographics (Figma Integration)

Aria can create **actual Figma designs** - not just descriptions:

```
USER: "Create a one-page visual summary of our tariff situation 
       that I can share with the board"

ARIA: I'll design an executive infographic in Figma.
      
      ◉ Designing...
      
      ├─ [Sourcify DB] Aggregating key metrics
      ├─ [Chart MCP] Creating mini visualizations
      ├─ [Figma MCP] Creating new design file
      ├─ [Figma MCP] Adding components and styling
      └─ [Figma MCP] Generating shareable link
      
      Done! I've created a board-ready infographic:
      
      ┌─────────────────────────────────────────────────────────┐
      │  TARIFF EXPOSURE SUMMARY • Q1 2026                      │
      │  ─────────────────────────────────────────────────────  │
      │                                                          │
      │  $890K          78%           $340K         3            │
      │  Annual Duty    Avg Rate      Savings Opp.  Risk Alerts  │
      │                                                          │
      │  [Donut Chart]  [Bar Chart]   [Trend Line]              │
      │   By Country     By Tariff     Over Time                │
      │                                                          │
      │  TOP RECOMMENDATIONS                                     │
      │  1. Shift 47 products to Vietnam → Save $180K           │
      │  2. Qualify 23 products for FTA → Save $120K            │
      │  3. Review 15 classifications → Save $40K               │
      │                                                          │
      │  [Your Company Logo]                                     │
      └─────────────────────────────────────────────────────────┘
      
      FIGMA FILE INCLUDES:
      • Editable components (swap your logo, colors)
      • Auto-layout for easy modifications
      • Export presets (PNG, PDF, SVG)
      • Presentation mode ready
      
      [Open in Figma] [Download PNG] [Download PDF] [Copy Link]
```

#### Interactive Dashboards

Aria can generate **live, interactive dashboards**:

```
USER: "Build me a dashboard to monitor my tariff exposure in real-time"

ARIA: I'll create an interactive monitoring dashboard.
      
      ◉ Building...
      
      ├─ [Sourcify DB] Setting up data connections
      ├─ [Chart MCP] Creating interactive visualizations
      ├─ [Dashboard MCP] Assembling components
      └─ [Hosting] Deploying to your workspace
      
      Done! Your dashboard is live:
      
      TARIFF MONITORING DASHBOARD
      URL: https://app.sourcify.com/dashboards/your-tariffs
      
      FEATURES:
      • Real-time data (refreshes hourly)
      • Interactive filters (country, product, date range)
      • Drill-down capability (click any chart element)
      • Alert indicators (flashing when thresholds exceeded)
      • Mobile responsive
      • Shareable link (view-only for stakeholders)
      
      WIDGETS INCLUDED:
      1. Total duty exposure (big number + trend)
      2. Duty by country (interactive treemap)
      3. Tariff layer breakdown (stacked bar)
      4. Recent changes (alert feed)
      5. Top optimization opportunities (ranked list)
      6. Upcoming tariff changes (calendar view)
      
      [Open Dashboard] [Share Link] [Embed in Slack] [Add to Home]
```

#### Compliance Documents
```
USER: "Generate the USMCA certificate of origin for SKU-003"

ARIA: I'll generate the USMCA Certificate of Origin.
      
      ⚠️ Before I generate this, I need to confirm:
      
      PRODUCT: SKU-003 (Plastic Parts)
      HTS: 3926.90.99.10
      
      ORIGIN CRITERIA:
      You previously indicated this product qualifies under:
      • Tariff shift from outside Chapter 39
      • RVC: 68% (minimum 60% required)
      
      Is this still accurate?
      
      [Yes, generate certificate] [Update information]

USER: "Yes, generate certificate"

ARIA: Done! I've generated the USMCA Certificate of Origin.
      
      ┌─────────────────────────────────────────────────────────┐
      │ UNITED STATES-MEXICO-CANADA AGREEMENT                   │
      │ CERTIFICATE OF ORIGIN                                    │
      │                                                          │
      │ 1. Exporter: Acme Corp                                  │
      │ 2. Producer: [As specified]                             │
      │ 3. Importer: [As specified]                             │
      │ 4. Description: Plastic parts for...                    │
      │ 5. HTS: 3926.90.99.10                                   │
      │ 6. Origin Criterion: B (Tariff shift)                   │
      │ 7. Blanket Period: Jan 1 - Dec 31, 2026                │
      │                                                          │
      │ [Signature block]                                        │
      └─────────────────────────────────────────────────────────┘
      
      ⚠️ IMPORTANT: This certificate must be signed by an 
      authorized person before use. The importer is responsible
      for the accuracy of this certificate.
      
      [Download PDF] [Download Editable Word]
```

### 4.3 Browser-Based Research (Browser MCP)

Aria can browse the web to gather real-time information:

```
USER: "Research the latest Section 301 exclusion updates"

ARIA: I'll research the current Section 301 exclusion status.
      
      ◉ Researching...
      
      ├─ [Browser MCP] Navigating to USTR.gov
      ├─ [Browser MCP] Finding exclusion announcements
      ├─ [Browser MCP] Checking Federal Register
      ├─ [Browser MCP] Reviewing trade news sources
      └─ Synthesizing findings
      
      SECTION 301 EXCLUSION UPDATE (as of Jan 29, 2026):
      
      CURRENT STATUS:
      • Most exclusions expired December 31, 2024
      • Limited machinery exclusions extended to June 2026
      • No new broad exclusion program announced
      
      RECENT DEVELOPMENTS:
      • Jan 15, 2026: USTR denied 847 exclusion requests
      • Jan 8, 2026: 23 machinery exclusions extended
      • Dec 20, 2025: Final exclusion batch expired
      
      SOURCES:
      • USTR.gov/301exclusions (official)
      • Federal Register 91 FR 1234 (Jan 15 notice)
      • Reuters Trade News (analysis)
      
      IMPACT ON YOUR PRODUCTS:
      Checking your portfolio... 3 products were previously excluded:
      • SKU-102: Exclusion expired, now paying full 25%
      • SKU-156: Exclusion extended to June 2026 ✓
      • SKU-201: Exclusion expired, now paying full 7.5%
      
      Annual impact of expired exclusions: +$18,400
      
      [View Full Research] [Set Alert for Updates] [Appeal Options]
```

```
USER: "Verify this supplier's business registration in China"

ARIA: I'll verify the supplier's registration.
      
      ◉ Verifying...
      
      ├─ [Browser MCP] Accessing SAMR database (China registry)
      ├─ [Browser MCP] Searching company name
      ├─ [Browser MCP] Capturing registration details
      ├─ [Compliance MCP] Cross-checking denied party lists
      └─ Compiling verification report
      
      SUPPLIER VERIFICATION REPORT
      
      Company: Shenzhen Electronics Co., Ltd.
      
      REGISTRATION STATUS: ✓ VERIFIED
      ┌─────────────────────────────────────────────────────────┐
      │ Unified Social Credit Code: 91440300MA5XXXXXX           │
      │ Registration Date: March 15, 2018                       │
      │ Registered Capital: ¥10,000,000                         │
      │ Legal Representative: Zhang Wei                         │
      │ Business Scope: Electronic products manufacturing...    │
      │ Status: Active (in good standing)                       │
      │ Last Annual Report: 2025 (filed)                        │
      └─────────────────────────────────────────────────────────┘
      
      COMPLIANCE SCREENING: ✓ CLEAR
      • OFAC SDN List: No match
      • BIS Entity List: No match
      • UFLPA Entity List: No match
      • Xinjiang Region: Not located in restricted area
      
      RISK FACTORS:
      ⚠️ Relatively new company (7 years)
      ⚠️ No third-party audit on file
      ✓ Registered capital adequate
      ✓ Business scope matches your products
      
      RECOMMENDATION: Proceed with caution. Request:
      • Factory audit report
      • Supply chain documentation
      • References from other buyers
      
      [Download Verification Report] [Request Audit] [Add to Approved List]
```

### 4.4 External Actions

With user permission, Aria can take external actions:

#### Request Supplier Quotes
```
USER: "Request quotes from the top 3 Vietnam suppliers for SKU-045"

ARIA: I'll request quotes from these suppliers:
      
      1. Vietnam Textile Co. (Premium verified)
      2. Saigon Garments Ltd. (Verified)
      3. Hanoi Manufacturing (Standard)
      
      QUOTE REQUEST DETAILS:
      • Product: Cotton T-Shirts (SKU-045)
      • Quantity: 10,000 units
      • Specifications: [From your product record]
      
      ⚠️ This will send emails to these suppliers on your behalf.
      They will reply directly to your email (chris@company.com).
      
      [Send Quote Requests] [Edit Details First] [Cancel]

USER: "Send quote requests"

ARIA: Done! Quote requests sent to 3 suppliers.
      
      I'll monitor your inbox and alert you when responses arrive.
      Typical response time: 1-3 business days.
      
      Want me to remind you if no response in 5 days?
```

#### Schedule Broker Consultation
```
USER: "I need to talk to a customs broker about the FTA qualification"

ARIA: I can help you schedule a consultation.
      
      TOPIC: USMCA Qualification for SKU-003
      
      I'll prepare a briefing document with:
      • Product details and classification
      • Current FTA analysis
      • Specific questions to address
      • Supporting documentation
      
      BROKER OPTIONS:
      1. Your existing broker (if connected)
      2. Sourcify partner brokers
      3. I can recommend based on your needs
      
      How would you like to proceed?
```

---

## 5. ENTERPRISE FEATURES

### 5.1 Multi-User & Roles

```
ORGANIZATION: Acme Corp

USERS:
├─ Chris Smith (Admin)
│   • Full access to all features
│   • Can manage team members
│   • Can approve classifications
│
├─ Sarah Chen (Compliance Manager)
│   • Full access to compliance tools
│   • Can approve FTA certifications
│   • Read-only on cost data
│
├─ Mike Johnson (Analyst)
│   • Can run analyses
│   • Can generate reports
│   • Cannot approve or take external actions
│
└─ Aria (AI Agent)
    • Operates on behalf of authorized users
    • Actions logged with user attribution
    • Requires approval for sensitive operations
```

### 5.2 Approval Workflows

```
ARIA: I've completed the FTA qualification analysis for 23 products.
      
      READY FOR APPROVAL:
      • 18 products clearly qualify (high confidence)
      • 5 products need manual review (medium confidence)
      
      APPROVAL REQUIRED FROM: Sarah Chen (Compliance Manager)
      
      I've sent Sarah a notification with the analysis.
      She can approve, reject, or request changes.
      
      [View Pending Approvals]
```

### 5.3 Integration Capabilities

Aria can integrate with enterprise systems:

```
INTEGRATIONS:

ERP SYSTEMS:
├─ SAP (Product master, PO data)
├─ Oracle (Product master, PO data)
├─ NetSuite (Product master, PO data)
└─ Custom API (Your systems)

CUSTOMS/TRADE:
├─ Customs broker systems
├─ Freight forwarder platforms
├─ Trade management systems
└─ ABI/ACE (future)

COMMUNICATION:
├─ Email (notifications, reports)
├─ Slack (alerts, quick queries)
├─ Microsoft Teams (alerts, quick queries)
└─ Webhooks (custom integrations)

DATA SYNC:
• Product catalog sync (daily)
• Shipment data import
• Tariff rate updates (real-time)
• Compliance list updates (daily)
```

### 5.4 Database Direct Access (Neon/Supabase MCPs)

For power users and enterprise, Aria can execute complex database operations:

```
USER: "Run a custom analysis: find all products where the tariff 
       increased more than 20% in the last year"

ARIA: I'll query the database directly for this analysis.
      
      ◉ Executing...
      
      ├─ [Neon MCP] Building SQL query
      ├─ [Neon MCP] Executing against tariff history
      ├─ [Neon MCP] Joining with product data
      └─ Processing results
      
      QUERY EXECUTED:
      ```sql
      SELECT p.sku, p.description, p.country_code,
             th_old.effective_rate as rate_2025,
             th_new.effective_rate as rate_2026,
             (th_new.effective_rate - th_old.effective_rate) as increase
      FROM products p
      JOIN tariff_history th_old ON p.hts_code = th_old.hts_code 
           AND th_old.effective_date = '2025-01-01'
      JOIN tariff_history th_new ON p.hts_code = th_new.hts_code
           AND th_new.effective_date = '2026-01-01'
      WHERE th_new.effective_rate > th_old.effective_rate * 1.20
      ORDER BY increase DESC;
      ```
      
      RESULTS: 67 products with >20% tariff increase
      
      TOP 10 BY INCREASE:
      │ SKU      │ Product        │ Country │ 2025  │ 2026  │ +%    │
      │ ─────────┼────────────────┼─────────┼───────┼───────┼───────│
      │ SKU-045  │ T-Shirts       │ VN      │ 17%   │ 53%   │ +212% │
      │ SKU-102  │ Earbuds        │ VN      │ 12%   │ 48%   │ +300% │
      │ SKU-089  │ Handbags       │ VN      │ 15%   │ 51%   │ +240% │
      │ ...                                                          │
      
      INSIGHT: Vietnam products hit hardest by April 2025 IEEPA.
      
      [Download Full Results] [Create Alert] [Optimize These Products]
```

```
USER: "Create a custom report that our finance team can run monthly"

ARIA: I'll create a saved report with a database view.
      
      ◉ Creating...
      
      ├─ [Neon MCP] Creating materialized view
      ├─ [Neon MCP] Setting up refresh schedule
      ├─ [Supabase MCP] Creating API endpoint
      └─ [Excel MCP] Creating template with live connection
      
      CUSTOM REPORT CREATED: "Monthly Duty Exposure Report"
      
      DATABASE VIEW: monthly_duty_exposure_v1
      REFRESH: Daily at 2:00 AM UTC
      
      REPORT INCLUDES:
      • Duty paid by country (current month vs. prior)
      • Duty paid by product category
      • Top 20 products by duty
      • Tariff rate changes
      • Optimization opportunities identified
      
      ACCESS OPTIONS:
      1. Excel with Live Connection
         [Download Excel Template]
         Data refreshes when you open the file
         
      2. API Endpoint
         GET /api/reports/monthly-duty-exposure
         Returns JSON, supports filters
         
      3. Scheduled Email
         [Set up monthly delivery]
         PDF + Excel attachment
         
      4. Dashboard Widget
         [Add to your dashboard]
         Real-time visualization
      
      [Test Report Now] [Schedule Delivery] [Share with Finance]
```

### 5.5 API Access

Enterprise customers can interact with Aria programmatically:

```typescript
// Aria API - Enterprise

// Natural language query
POST /api/aria/query
{
  "message": "What's the landed cost for HTS 6109.10.00.12 from China?",
  "context": {
    "userId": "user-123",
    "sessionId": "session-456"
  }
}

// Structured task
POST /api/aria/task
{
  "task": "analyze_portfolio",
  "parameters": {
    "scope": "all_products",
    "analysisTypes": ["landed_cost", "optimization", "compliance"]
  },
  "callback": "https://your-system.com/webhook/aria-complete"
}

// Batch operation
POST /api/aria/batch
{
  "operation": "calculate_landed_cost",
  "products": [
    { "htsCode": "6109.10.00.12", "country": "CN", "value": 10000 },
    { "htsCode": "8518.30.20.00", "country": "VN", "value": 5000 }
  ]
}

// Monitoring subscription
POST /api/aria/subscribe
{
  "event": "tariff_change",
  "filters": {
    "countries": ["CN", "VN", "MX"],
    "htsChapters": ["61", "62", "85"]
  },
  "webhook": "https://your-system.com/webhook/tariff-alert"
}
```

---

## 6. TECHNICAL ARCHITECTURE

### 6.0 MCP Integration Architecture

The core of Aria's power comes from its MCP (Model Context Protocol) integration layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                             │
│  "Create a board presentation comparing sourcing options"       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ARIA REASONING ENGINE                         │
│                                                                  │
│  1. Parse intent: "board presentation" + "sourcing comparison"  │
│  2. Plan tasks: data gathering → analysis → visualization →     │
│                 document creation → delivery                     │
│  3. Select MCPs: Database, Charts, Figma, PowerPoint, Email    │
│  4. Coordinate execution (parallel where possible)              │
│  5. Synthesize results and present to user                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  DATA MCPs    │    │ VISUAL MCPs   │    │ OUTPUT MCPs   │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ • Sourcify DB │    │ • Chart Gen   │    │ • PowerPoint  │
│ • Neon/Supa   │    │ • Map Service │    │ • Excel       │
│ • Trade Stats │    │ • Figma       │    │ • PDF         │
│ • Compliance  │    │ • Diagram     │    │ • Email       │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MCP EXECUTION LAYER                         │
│                                                                  │
│  Each MCP exposes tools via standardized protocol:              │
│                                                                  │
│  interface McpTool {                                            │
│    name: string;           // e.g., "create_chart"              │
│    description: string;    // What it does                      │
│    parameters: Schema;     // Input schema                      │
│    execute(params): Result; // Actual execution                 │
│  }                                                              │
│                                                                  │
│  Aria calls tools like:                                         │
│  await mcp.figma.createDesign({ template: "infographic", ... }) │
│  await mcp.excel.createWorkbook({ sheets: [...], formulas: []}) │
│  await mcp.email.send({ to: "ceo@company.com", attach: [...] }) │
└─────────────────────────────────────────────────────────────────┘
```

#### MCP Tool Definitions

```typescript
// Example: Figma MCP Tools
interface FigmaMcp {
  tools: {
    // Create new design
    createDesign: {
      params: {
        template: 'infographic' | 'dashboard' | 'report' | 'checklist';
        title: string;
        data: Record<string, any>;
        branding?: { logo?: string; colors?: string[] };
      };
      returns: { fileId: string; url: string; previewUrl: string };
    };
    
    // Add component to existing design
    addComponent: {
      params: {
        fileId: string;
        component: 'chart' | 'table' | 'text' | 'image';
        data: any;
        position: { x: number; y: number };
      };
      returns: { componentId: string };
    };
    
    // Export design
    exportDesign: {
      params: {
        fileId: string;
        format: 'png' | 'pdf' | 'svg';
        scale?: number;
      };
      returns: { downloadUrl: string };
    };
  };
}

// Example: Excel MCP Tools
interface ExcelMcp {
  tools: {
    createWorkbook: {
      params: {
        sheets: Array<{
          name: string;
          data: any[][];
          formulas?: Array<{ cell: string; formula: string }>;
          formatting?: Array<{ range: string; style: CellStyle }>;
          charts?: Array<ChartDefinition>;
        }>;
        pivotTables?: Array<PivotTableDefinition>;
      };
      returns: { filePath: string; downloadUrl: string };
    };
    
    addFormula: {
      params: {
        workbookId: string;
        sheet: string;
        cell: string;
        formula: string;  // e.g., "=VLOOKUP(A2,Sheet2!A:B,2,FALSE)"
      };
      returns: { success: boolean };
    };
    
    createChart: {
      params: {
        workbookId: string;
        sheet: string;
        type: 'bar' | 'line' | 'pie' | 'scatter' | 'treemap';
        dataRange: string;
        options: ChartOptions;
      };
      returns: { chartId: string };
    };
  };
}

// Example: Browser MCP Tools
interface BrowserMcp {
  tools: {
    navigate: {
      params: { url: string };
      returns: { success: boolean; title: string };
    };
    
    screenshot: {
      params: { selector?: string; fullPage?: boolean };
      returns: { imageUrl: string };
    };
    
    extractData: {
      params: { 
        selector: string; 
        attributes?: string[];
        multiple?: boolean;
      };
      returns: { data: any };
    };
    
    fillForm: {
      params: { fields: Array<{ selector: string; value: string }> };
      returns: { success: boolean };
    };
    
    click: {
      params: { selector: string };
      returns: { success: boolean };
    };
  };
}
```

#### MCP Registry

```typescript
// Aria's MCP Registry - all available tool connections
const mcpRegistry = {
  // Data Sources
  'sourcify-db': SourceifyDatabaseMcp,      // Internal HTS, tariffs, products
  'neon': NeonMcp,                           // Direct PostgreSQL access
  'supabase': SupabaseMcp,                   // Supabase operations
  'trade-stats': TradeStatsMcp,              // USITC DataWeb
  
  // Visualizations
  'charts': ChartGeneratorMcp,               // D3/Chart.js generation
  'maps': MapServiceMcp,                     // Mapbox/Google Maps
  'diagrams': DiagramMcp,                    // Mermaid/D2 diagrams
  
  // Design Tools
  'figma': FigmaMcp,                         // Figma design creation
  'canva': CanvaMcp,                         // Canva templates
  
  // Document Generation
  'excel': ExcelMcp,                         // .xlsx with formulas
  'powerpoint': PowerPointMcp,               // .pptx presentations
  'pdf': PdfMcp,                             // PDF reports
  'word': WordMcp,                           // .docx documents
  
  // External Services
  'browser': BrowserMcp,                     // Web browsing/research
  'email': EmailMcp,                         // Send emails
  'calendar': CalendarMcp,                   // Schedule events
  'slack': SlackMcp,                         // Slack notifications
  'teams': TeamsMcp,                         // Teams notifications
  
  // Enterprise Integrations (custom per customer)
  'sap': SapMcp,                             // SAP ERP
  'oracle': OracleMcp,                       // Oracle ERP
  'netsuite': NetSuiteMcp,                   // NetSuite
  'customs-broker': CustomsBrokerMcp,        // Broker systems
};
```

### 6.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
├─────────────────────────────────────────────────────────────────┤
│  Web App        │  Mobile App     │  Slack/Teams   │  API       │
│  (Primary)      │  (Alerts)       │  (Quick Query) │  (Integr.) │
└────────┬────────┴────────┬────────┴────────┬───────┴─────┬──────┘
         │                 │                 │             │
         └─────────────────┼─────────────────┼─────────────┘
                           │                 │
                           ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ARIA AGENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Conversation │  │   Task      │  │  Monitoring │             │
│  │   Manager    │  │ Orchestrator│  │    Engine   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    LLM REASONING ENGINE                   │   │
│  │                    (Claude / GPT-4 / etc.)               │   │
│  │                                                           │   │
│  │  • Intent understanding                                   │   │
│  │  • Context management                                     │   │
│  │  • Tool selection                                         │   │
│  │  • Response synthesis                                     │   │
│  │  • Multi-step planning                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    TOOL EXECUTION LAYER                   │   │
│  │                                                           │   │
│  │  classify()  calculate()  compare()  generate()  ...     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA & SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   HTS    │ │  Tariff  │ │Compliance│ │ Supplier │           │
│  │ Database │ │ Registry │ │  Lists   │ │   Data   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   User   │ │ Product  │ │ Analysis │ │  Audit   │           │
│  │ Profiles │ │ Library  │ │  History │ │   Logs   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Sub-Agent Coordination (Cowork Pattern)

Like Cowork, Aria breaks complex tasks into subtasks and coordinates parallel execution:

```typescript
interface SubAgentCoordinator {
  // Break task into subtasks
  planExecution(task: Task): ExecutionPlan;
  
  // Spawn sub-agents for parallel work
  spawnSubAgents(plan: ExecutionPlan): SubAgent[];
  
  // Monitor progress across all sub-agents
  monitorProgress(agents: SubAgent[]): ProgressReport;
  
  // Merge results from sub-agents
  mergeResults(results: SubAgentResult[]): FinalResult;
  
  // Handle failures and retries
  handleFailure(agent: SubAgent, error: Error): RecoveryAction;
}

interface ExecutionPlan {
  id: string;
  task: Task;
  stages: ExecutionStage[];
  dependencies: Map<string, string[]>;  // stage -> depends on stages
  estimatedDuration: number;
}

interface ExecutionStage {
  id: string;
  name: string;
  mcps: string[];           // Which MCPs this stage uses
  canParallelize: boolean;  // Can run alongside other stages
  subtasks: Subtask[];
}
```

**Example: Complex Task Decomposition**

```
USER: "Analyze my entire portfolio and create an optimization 
       report with recommendations for the board"

ARIA: This is a complex task. I'll break it into parallel workstreams.
      
      EXECUTION PLAN:
      
      Stage 1: Data Gathering (Parallel)
      ├─ Agent A: Pull product catalog [Sourcify DB]
      ├─ Agent B: Get current tariff rates [Sourcify DB]
      ├─ Agent C: Fetch trade statistics [Trade Stats MCP]
      └─ Agent D: Check compliance status [Compliance MCP]
      
      Stage 2: Analysis (Parallel, after Stage 1)
      ├─ Agent E: Calculate optimization opportunities
      ├─ Agent F: Identify FTA qualification candidates
      ├─ Agent G: Find country switching options
      └─ Agent H: Assess compliance risks
      
      Stage 3: Visualization (Parallel, after Stage 2)
      ├─ Agent I: Create cost comparison charts [Chart MCP]
      ├─ Agent J: Build geographic heat map [Map MCP]
      └─ Agent K: Design executive infographic [Figma MCP]
      
      Stage 4: Document Generation (Sequential, after Stage 3)
      ├─ Agent L: Compile PowerPoint [PowerPoint MCP]
      ├─ Agent M: Generate Excel model [Excel MCP]
      └─ Agent N: Create PDF summary [PDF MCP]
      
      Stage 5: Delivery (after Stage 4)
      └─ Agent O: Package and deliver [File System + Email]
      
      PROGRESS:
      ████████████████░░░░░░░░░░░░░░░░ 45%
      
      Currently executing: Stage 2 (Analysis)
      Estimated completion: 8 minutes
      
      [View Details] [Pause] [Cancel]
```

### 6.3 Conversation Manager

```typescript
interface ConversationManager {
  // Start new conversation
  startConversation(userId: string): Conversation;
  
  // Process user message
  processMessage(
    conversationId: string, 
    message: string
  ): Promise<AriaResponse>;
  
  // Get conversation history
  getHistory(conversationId: string): Message[];
  
  // Manage context
  updateContext(conversationId: string, context: Context): void;
  
  // Handle interruptions
  handleInterrupt(conversationId: string, newMessage: string): Promise<AriaResponse>;
}

interface Conversation {
  id: string;
  userId: string;
  organizationId: string;
  messages: Message[];
  context: Context;
  activeTask?: Task;
  createdAt: Date;
  lastActivity: Date;
}

interface Context {
  // User context
  user: UserProfile;
  organization: Organization;
  
  // Product context
  currentProduct?: Product;
  recentProducts: Product[];
  
  // Analysis context
  currentAnalysis?: Analysis;
  recentAnalyses: Analysis[];
  
  // Conversation context
  topic?: string;
  intent?: string;
  entities: Entity[];
}
```

### 6.3 Task Orchestrator

```typescript
interface TaskOrchestrator {
  // Create and execute task
  createTask(
    type: TaskType,
    parameters: TaskParameters,
    userId: string
  ): Promise<Task>;
  
  // Monitor task progress
  getTaskStatus(taskId: string): TaskStatus;
  
  // Cancel task
  cancelTask(taskId: string): void;
  
  // Handle long-running tasks
  scheduleTask(task: Task, schedule: Schedule): void;
}

interface Task {
  id: string;
  type: TaskType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  steps: TaskStep[];
  result?: TaskResult;
  error?: Error;
  createdAt: Date;
  completedAt?: Date;
}

type TaskType = 
  | 'analyze_product'
  | 'analyze_portfolio'
  | 'compare_countries'
  | 'check_fta_qualification'
  | 'find_suppliers'
  | 'generate_report'
  | 'monitor_tariffs'
  | 'batch_classification';
```

### 6.4 Monitoring Engine

```typescript
interface MonitoringEngine {
  // Set up monitoring
  createMonitor(config: MonitorConfig): Monitor;
  
  // Check for changes
  checkForChanges(): Change[];
  
  // Process alerts
  processAlerts(changes: Change[]): Alert[];
  
  // Notify users
  sendNotifications(alerts: Alert[]): void;
}

interface MonitorConfig {
  type: 'tariff_change' | 'compliance_update' | 'supplier_change';
  scope: {
    products?: string[];      // Specific products
    countries?: string[];     // Specific countries
    htsChapters?: string[];   // Specific HTS chapters
  };
  threshold?: number;         // Minimum change to alert
  frequency: 'realtime' | 'daily' | 'weekly';
  notifications: {
    email?: boolean;
    slack?: boolean;
    inApp?: boolean;
    webhook?: string;
  };
}
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)

#### Week 1-2: Conversation Interface
- [ ] Build chat UI component
- [ ] Implement conversation state management
- [ ] Create basic intent recognition
- [ ] Connect to existing tools via function calling

#### Week 3-4: Rich Responses
- [ ] Build workspace panel
- [ ] Implement chart generation
- [ ] Implement table generation
- [ ] Add document preview

### Phase 2: Core Intelligence (Weeks 5-8)

#### Week 5-6: Tool Integration
- [ ] Connect all existing services as tools
- [ ] Implement tool selection logic
- [ ] Add multi-step task planning
- [ ] Build response synthesis

#### Week 7-8: Context & Memory
- [ ] Implement conversation context
- [ ] Add user preference learning
- [ ] Build product library integration
- [ ] Add conversation history

### Phase 3: Enterprise Features (Weeks 9-12)

#### Week 9-10: Portfolio Intelligence
- [ ] Build portfolio analysis capabilities
- [ ] Implement batch operations
- [ ] Add optimization scanning
- [ ] Create portfolio dashboards

#### Week 11-12: Collaboration & Workflow
- [ ] Implement multi-user support
- [ ] Build approval workflows
- [ ] Add audit trail
- [ ] Create sharing capabilities

### Phase 4: Proactive Intelligence (Weeks 13-16)

#### Week 13-14: Monitoring
- [ ] Build monitoring engine
- [ ] Implement change detection
- [ ] Create alert system
- [ ] Add notification channels

#### Week 15-16: Document Generation
- [ ] Implement Excel generation
- [ ] Implement PDF generation
- [ ] Add compliance document templates
- [ ] Build report customization

### Phase 5: External Actions (Weeks 17-20)

#### Week 17-18: Integrations
- [ ] Build integration framework
- [ ] Implement email actions
- [ ] Add webhook support
- [ ] Create API endpoints

#### Week 19-20: Advanced Actions
- [ ] Implement supplier quote requests
- [ ] Add broker scheduling
- [ ] Build document signing workflow
- [ ] Create external system sync

---

## 8. EXAMPLE CONVERSATIONS

### 8.1 First-Time User

```
ARIA: Welcome to Sourcify! I'm Aria, your trade intelligence agent.
      
      I can help you with:
      • Classifying products for import
      • Calculating landed costs and duties
      • Finding lower-cost sourcing options
      • Ensuring compliance with trade regulations
      • Generating required documentation
      
      What would you like to explore?

USER: "I'm thinking about importing phone cases from China"

ARIA: Great! Let me help you understand the costs and requirements.
      
      First, a few questions to give you accurate information:
      
      1. What material are the phone cases made of?
         □ Plastic/TPU
         □ Silicone
         □ Leather
         □ Metal
         □ Mixed/Other
      
      2. Approximate value per unit?
         □ Under $1
         □ $1-5
         □ $5-20
         □ Over $20
      
      Or just describe them and I'll figure it out!

USER: "Plastic TPU cases, about $2 each, planning to import 10,000 units"

ARIA: Perfect! Here's what you need to know about importing 
      10,000 plastic phone cases from China:
      
      CLASSIFICATION
      HTS: 3926.90.99.60
      Description: Other articles of plastics
      
      LANDED COST ESTIMATE
      ┌─────────────────────────────────────────────────────┐
      │ Product cost (10,000 × $2)              $20,000    │
      │ Shipping (estimated)                     $1,200    │
      │ Duty (52%)                              $10,400    │
      │ Fees (MPF, HMF)                            $100    │
      │ ─────────────────────────────────────────────────  │
      │ TOTAL LANDED COST                       $31,700    │
      │ Per unit                                  $3.17    │
      └─────────────────────────────────────────────────────┘
      
      ⚠️ KEY INSIGHT
      52% duty is high! You're paying more in duty ($10,400) 
      than half the product cost.
      
      💡 ALTERNATIVES
      • Vietnam: 27% duty → Save $5,000
      • Mexico: 0% duty (if USMCA) → Save $10,400
      
      Want me to explore these alternatives?
```

### 8.2 Experienced User

```
USER: "Compare my top 5 China products against Vietnam alternatives"

ARIA: I'll analyze your top 5 China products by duty paid.
      
      ◉ Analyzing...
      
      TOP 5 CHINA PRODUCTS BY DUTY
      
      │ Product          │ China    │ Vietnam  │ Savings  │
      │ ─────────────────┼──────────┼──────────┼──────────│
      │ SKU-045 T-Shirts │ $117K    │ $40K     │ $77K     │
      │ SKU-102 Earbuds  │ $52K     │ $27K     │ $25K     │
      │ SKU-089 Bags     │ $45K     │ $18K     │ $27K     │
      │ SKU-201 Toys     │ $38K     │ $15K     │ $23K     │
      │ SKU-156 Tools    │ $32K     │ $14K     │ $18K     │
      │ ─────────────────┼──────────┼──────────┼──────────│
      │ TOTAL            │ $284K    │ $114K    │ $170K    │
      
      ANNUAL SAVINGS POTENTIAL: $170,000
      
      TRADE-OFFS TO CONSIDER:
      • Lead time: +3-5 days from Vietnam
      • Supplier qualification: Need to vet new suppliers
      • MOQ: May be higher with new suppliers
      • Quality: Verify with samples before switching
      
      RECOMMENDATION:
      Start with SKU-045 (T-Shirts) - highest savings, 
      established Vietnam supplier ecosystem for textiles.
      
      Want me to:
      • Find qualified Vietnam suppliers for SKU-045?
      • Create a detailed switching plan?
      • Model the transition timeline and costs?
```

### 8.3 Compliance Team

```
USER: "Run a full compliance audit on our China imports"

ARIA: I'll run a comprehensive compliance audit on your 
      247 China-origin products.
      
      ◉ Running audit...
      
      ├─ Checking denied party matches
      ├─ Reviewing AD/CVD exposure
      ├─ Verifying UFLPA compliance
      ├─ Checking documentation completeness
      └─ Reviewing classification accuracy
      
      ─────────────────────────────────────────────────────
      
      COMPLIANCE AUDIT COMPLETE
      
      🔴 CRITICAL ISSUES (3)
      ┌─────────────────────────────────────────────────────┐
      │ 1. SKU-089: Supplier on UFLPA Entity List           │
      │    Supplier: Xinjiang Textile Co.                   │
      │    Risk: Shipment detention/seizure                 │
      │    Action: Immediate supplier change required       │
      │                                                     │
      │ 2. SKU-201: Missing CPSC certification              │
      │    Product: Children's toys                         │
      │    Risk: Entry refusal                              │
      │    Action: Obtain testing certificate               │
      │                                                     │
      │ 3. SKU-156: Potential misclassification             │
      │    Current: 8205.59.30 (Hand tools)                │
      │    Should be: 8467.11.50 (Power tools)             │
      │    Risk: Duty underpayment, penalties               │
      │    Action: Review with broker                       │
      └─────────────────────────────────────────────────────┘
      
      🟡 WARNINGS (12)
      • 8 products missing UFLPA documentation
      • 4 products with AD/CVD exposure (verify rates)
      
      🟢 PASSED (232)
      • Denied party screening: Clear
      • Classification: Verified
      • Documentation: Complete
      
      [Download Full Audit Report]
      [Create Action Items]
      [Schedule Broker Review]
```

---

## 9. SUCCESS METRICS

### User Engagement
- Daily active conversations
- Tasks completed per user
- Time saved vs. manual process
- Feature adoption rates

### Business Impact
- Duty savings identified
- Duty savings realized (acted upon)
- Compliance issues prevented
- Support ticket reduction

### Agent Performance
- Response accuracy
- Task completion rate
- User satisfaction (thumbs up/down)
- Escalation rate (to human)

### Enterprise Metrics
- Portfolio coverage
- Alert response time
- Approval workflow efficiency
- Integration adoption

---

## 10. COMPETITIVE POSITIONING

### What Makes Aria Different

| Capability | Traditional Tools | Aria |
|------------|-------------------|------|
| Interface | Forms & tables | Natural conversation |
| Output | Raw data | Synthesized insights |
| Behavior | Reactive (user asks) | Proactive (agent alerts) |
| Scope | Single query | Ongoing relationship |
| Action | Information only | Can execute tasks |
| Scale | One at a time | Portfolio-wide |
| Learning | Static | Learns preferences |

### The Moat

1. **Domain Expertise** - Deep trade compliance knowledge baked in
2. **Data Advantage** - Proprietary tariff registry, supplier data
3. **Network Effects** - More users = better recommendations
4. **Switching Cost** - Portfolio history, learned preferences
5. **Integration Depth** - Connected to user's systems

---

*Document Version: 1.0*
*Last Updated: January 29, 2026*
*Vision: The Future of Trade Intelligence*
