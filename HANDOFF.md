# TOSS D' CHICKEN — Session Handoff

> This file is injected at every session start. Update it before clearing context.

---

## Project Status

**Phase:** Phase 1 COMPLETE — Day 2 of 14
**Last updated:** 2026-06-18
**Last session:** Phase 1 fully built and smoke-tested. All code committed.
**Next action:** Phase 2 — POS Order Screen (Days 3–4).

---

## What Was Done Last Session

- Ran `buildable-planner` manually (CLI not installed) — produced full app spec saved to `.buildable/phase-plan.md` with real menu data from photos.
- Ran `superpowers:writing-plans` — produced 15-task Phase 1 implementation plan at `docs/superpowers/plans/2026-06-18-scaffold-auth.md`.
- Ran `superpowers:subagent-driven-development` — executed all 15 tasks via subagents with spec + quality review after each.
- **Phase 1 complete:** Vite + React + TypeScript PWA scaffolded, Tailwind brand colors, Vitest configured, Supabase project live (schema + seed data), Supabase client, AuthContext (TDD), PrivateRoute (TDD), Login/Register pages, role-based routing.
- 8/8 tests passing, zero TypeScript errors.
- Smoke tested in browser: login, register, owner routing, cashier routing, unauthorized redirect all confirmed working.
- Final commit: `a3d2c65` — "chore: phase 1 complete - scaffold + auth + role routing"

---

## What To Do Next

**Phase 2 — Days 3–4: POS Order Screen**

Run this skill sequence at session start:

### Step 1: `superpowers:writing-plans`
Write the Phase 2 implementation plan. Input = `.buildable/phase-plan.md` Phase 2 section. Output = `docs/superpowers/plans/2026-06-18-pos-order-screen.md`.

**Phase 2 deliverables (from `.buildable/phase-plan.md`):**
- `src/pages/pos/OrderScreen.tsx` — replace stub with real POS
- `src/pages/pos/Receipt.tsx` — new file
- `src/context/CartContext.tsx` — order line items in memory
- `src/lib/costing.ts` — `calcUnitCost(item, flavor, recipes, ingredients)`
- `src/components/NumericKeypad.tsx` — big-button qty input
- `src/components/CategoryTabBar.tsx` — horizontal scrollable category filter
- On order complete: insert `orders` + `order_items`, deduct stock, write `inventory_log`
- Receipt page: printable layout, "New Order" button

### Step 2: `superpowers:subagent-driven-development`
Execute the plan — subagent per task, spec + quality review after each.

---

## Tech Stack (locked)

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 8, TypeScript 6 (strict), Tailwind CSS 3 |
| PWA | vite-plugin-pwa (Workbox) |
| Backend / DB / Auth | Supabase (free tier) — PostgreSQL + RLS |
| Hosting | Vercel (free) |
| Currency | Philippine Peso (₱) |
| State | React Context (AuthContext done; CartContext in Phase 2) |
| Testing | Vitest 4 + @testing-library/react |
| Router | react-router-dom v7 (library mode — v6 JSX API) |

---

## Key Business Rules (never forget)

1. **Base + flavor cost model** — item cost = base recipe cost + flavor cost. Change one ingredient price → all flavors update.
2. **Unit conversion** — ingredients store purchase unit/qty/price AND usage unit. App derives cost per usage unit (e.g. ₱120/1L oil = ₱0.12/ml). Conversions within families only (kg↔g, L↔ml, box↔piece).
3. **Suggested price formula** — `price = cost ÷ (1 − margin%)`. Flag items below target margin.
4. **Profit & Loss** — Sales − COGS = Gross Profit. Gross Profit − Opex = Net Profit. VAT off now, toggleable.
5. **Inventory auto-deduction** — on every completed order, subtract recipe ingredient qty from `ingredients.current_stock`, write to `inventory_log`.
6. **Roles** — `owner` full access. `cashier` POS + receipt only.
7. **Drizzled or not** — all flavored items: if not drizzled, sauce in tub = +₱1 to COGS only. `is_drizzled boolean default true` on `order_items`.
8. **Barkada Feast Box** — `max_flavors = 2`, flat ₱299, no flavor surcharge.
9. **Flavor tiers** — Original = base price, any other flavor = +₱10, Jack Daniel's = +₱20.
10. **CMS-driven** — all menu changes via owner's Menu Management screens → instant POS update. No hardcoded menu.

---

## Confirmed Decisions (all locked)

| Topic | Decision |
|---|---|
| Receipt sharing | Screenshot only |
| Barkada flavors | Up to 2, flat price, no surcharge |
| Cashier price visibility | Yes — prices visible, costs hidden |
| Drizzled or not | All flavored items, +₱1 COGS if not drizzled |
| Menu source | CMS-driven via Supabase |
| VAT | Off by default, toggle in Settings |
| Cashier logins | Separate logins per cashier |
| Offline | PWA shell cached; Supabase calls need connectivity |

---

## Actual Menu (from photos — seed data live in Supabase)

**Poppers:**
- Solo (15 pcs + Cucumber + Sauce) — Original ₱89, Any Flavor ₱99, Jack Daniel's ₱109
- Meal (9 pcs + Rice) — Original ₱75, Any Flavor ₱85, Jack Daniel's ₱95
- Pop & Fries Combo (15 pcs + Fries + Sauce) — ₱149
- Barkada Feast Box (50 pcs + Fries + 2 Sauces) — ₱299, pick up to 2 flavors

**Extras:** Rice ₱15, Add Flavor ₱15, Dipping Sauce ₱15, Cajun Fries ₱59

**Drinks:** Bottled Water ₱15, Coke ₱15

**Flavors:** Original, Honey Garlic, Salted Egg, Buffalo, Sweet Chili, Garlic Parmesan, Cheesy Jalapeño (+₱10), Jack Daniel's (+₱20)

**Dipping Sauces:** Ranch, Cheddar (sold as extras at ₱15)

---

## Current File Structure (what exists)

```
TossdchickenApp/
├── .buildable/phase-plan.md          ← full app spec + 7-phase plan
├── .env.local                        ← Supabase URL + anon key (NOT in git)
├── .env.example                      ← template
├── .gitignore
├── CLAUDE.md
├── HANDOFF.md
├── docs/superpowers/plans/
│   └── 2026-06-18-scaffold-auth.md   ← Phase 1 implementation plan (done)
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts                    ← PWA + Vitest (env.NODE_ENV=test fix)
├── src/
│   ├── App.tsx                       ← router + AuthProvider + lazy routes
│   ├── main.tsx
│   ├── index.css                     ← Tailwind directives only
│   ├── test/setup.ts                 ← jest-dom import
│   ├── lib/
│   │   └── supabase.ts               ← Supabase client singleton
│   ├── context/
│   │   └── AuthContext.tsx           ← session, role, signIn, signOut
│   ├── components/
│   │   └── PrivateRoute.tsx          ← role-based route guard
│   └── pages/
│       ├── auth/
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── pos/
│       │   └── OrderScreen.tsx       ← STUB (Phase 2 replaces this)
│       └── reports/
│           └── Dashboard.tsx         ← STUB (Phase 6 replaces this)
```

---

## Known Environment Issue

`NODE_ENV=production` is set globally on this machine. All npm/vitest commands must use `npx vitest --run` instead of `npm test -- --run`. The `vite.config.ts` test block has `env: { NODE_ENV: 'test' }` to fix the react-dom/test-utils issue.

---

## Skills Workflow (for reference)

| Phase | Skills |
|---|---|
| Plan — Code level | `superpowers:writing-plans` |
| Build each feature | `superpowers:subagent-driven-development` |
| React/UI patterns | `react-best-practices` + `react-ui-patterns` |
| Lib docs | `context7` MCP |
| Verification | `gsd-verify-work` + `superpowers:verification-before-completion` |
| Security | `security-audit` |
| Mobile/PWA | `web-to-mobile-audit` + `mobile-parity-check` |
| Deploy | `deploy-to-vercel` |
| Debugging | `superpowers:systematic-debugging` |

---

## Context Limit Protocol

When context reaches ~70–80%:
1. Update the "What Was Done Last Session" and "What To Do Next" sections above.
2. Note any in-progress files or half-done work.
3. Tell the user: "Context is getting full — handoff updated. Please clear the session."
4. Stop working and wait.
