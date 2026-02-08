# AGENTS.md - Tarifyx Project Context

## Platform
**Tarifyx** (tarifyx.com) — AI-powered import intelligence for SMB importers.
Rebranding from "Sourcify". See `.cursor/rules/tarifyx-rebrand.mdc` for active work.

## Tech Stack
- Next.js 14+ (App Router) / TypeScript / Ant Design 5 / Tailwind
- PostgreSQL + Prisma ORM / pgvector for semantic search
- Better Auth (session-based) / xAI (Grok) via `src/lib/xai.ts`

## Directory Layout
```
src/app/          → Pages + API routes (App Router)
src/features/     → Feature components (compliance, import-intelligence, dashboard, sourcing)
src/services/     → Business logic (classification, tariff, hts, compliance, sourcing)
src/components/   → Shared UI (layouts, shared)
src/lib/          → Third-party clients (db, auth, xai)
src/data/         → Static data files (tariffPrograms, ftaRules, adcvdOrders, etc.)
src/types/        → TypeScript types
src/utils/        → Utilities (htsFormatting, etc.)
prisma/           → Schema + migrations
docs/             → PRDs and specs
```

## Critical Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/services/classification/engine-v10.ts` | AI classification engine (DO NOT BREAK) |
| `src/services/tariff/registry.ts` | Tariff rate source of truth |
| `src/services/usitcDataWeb.ts` | USITC DataWeb API integration |
| `src/data/tariffPrograms.ts` | Special tariff programs (301/IEEPA/232) |
| `src/components/layouts/DashboardLayout.tsx` | Main nav + layout |
| `src/theme/themeConfig.ts` | Ant Design theme |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Auth config |

## Key Patterns
- **API routes:** `src/app/api/[name]/route.ts` → `NextResponse.json({ success, data })`
- **Features:** `src/features/[domain]/components/ComponentName.tsx` (client components)
- **DB access:** `import { prisma } from '@/lib/db'`
- **Auth:** `import { useSession } from '@/lib/auth-client'`
- **HTS codes:** Store without dots (`6109100012`), display with (`6109.10.00.12`)
- **Country codes:** ISO 3166-1 alpha-2 (CN, VN, MX)
- **Classification:** Always use V10 engine (`engine-v10.ts`)
- **Tariff layers:** MFN → Section 301 → IEEPA fentanyl → IEEPA reciprocal → Section 232 → AD/CVD

## Dev Commands
```bash
npm run dev                    # Start dev server
npx prisma generate           # Regen types after schema change
npx prisma db push            # Push schema to dev DB
http://localhost:3000/dashboard?dev=1  # Dev login
```

## Current Status
- **Phase 1 COMPLETE:** Core Engine Audit — Classification (1A), Tariff Calculation (1B), USITC DataWeb Integration (1C)
- **Phase 2A COMPLETE:** New User Flow Audit (Landing → Login → Onboarding → Dashboard)
- **Phase 2B COMPLETE:** Classification Flow Audit (Input → AI classify → Results)
- **Active:** Phase 2C-E — Landed Cost Flow, Compliance Flow, Portfolio Flow
- **Next:** Phase 3 (Polish), Phase 4 (Stripe integration, usage limits, feature gating)
- **Future:** BOL data licensing, interactive cost map (Mapbox), supplier discovery

## Source of Truth Docs
| Doc | Purpose |
|-----|---------|
| `docs/tarifyx-prd-v2.md` | Product strategy & roadmap (READ FOR STRATEGY) |
| `docs/prd-trade-intelligence.md` | Feature status tracking |
| `docs/landedcost-master.md` | Landed cost calculator reference |
| `docs/tarifyx-prd.md` | v1 PRD (archived reference, don't delete) |
