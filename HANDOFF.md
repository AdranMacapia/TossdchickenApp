# TOSS D' CHICKEN — Session Handoff

> This file is injected at every session start. Update it before clearing context.

---

## Project Status

**Phase:** Phase 2 COMPLETE — Phase 3 ready
**Last updated:** 2026-06-18
**Last session:** Phase 2 fully implemented via subagent-driven development. All 9 tasks done, 32 tests passing, PR open.
**Next action:** Merge PR #1, then start Phase 3 (Inventory Management).

---

## What Was Done Last Session

Phase 2 fully implemented via subagent-driven development (Tasks 2–10):

- **costing.ts** — `costPerUsageUnit()` + `calcUnitCost()` with unit conversion (TDD, 8 tests)
- **CartContext** — cart state + order type defaulting to 'takeout' (TDD, 8 tests)
- **NumericKeypad** — big-button qty input component (TDD, 5 tests)
- **CategoryTabBar** — horizontal scrollable category filter (TDD, 3 tests)
- **useMenuData** — fetches categories/items/flavors from Supabase in parallel
- **FlavorPicker** — flavor selection modal with drizzle toggle + qty; drizzle resets when reverting to Original
- **OrderScreen** — full POS: takeout/dine-in toggle, menu grid, cart drawer, Supabase order insert, packaging deduction on takeout
- **Receipt** — thermal-paper style receipt with order type badge; proper Supabase error handling
- **PrivateRoute** — updated to accept array of roles; owner can now access POS
- **App.tsx** — CartProvider wrapping POS routes, Receipt route wired

**Test result:** 32/32 tests passing across 6 files. Zero TypeScript errors.
**PR:** https://github.com/AdranMacapia/TossdchickenApp/pull/1 (master → main)
**GitHub CLI:** Now installed and authenticated as AdranMacapia.

---

## What To Do Next

### Step 1: Run SQL migrations (if not done yet — Task 1 from Phase 2 plan)

If you haven't run the SQL in Supabase yet, do it now (see `docs/superpowers/plans/2026-06-18-pos-order-screen.md` Task 1).

### Step 2: Smoke test the POS (Task 11 from Phase 2 plan)

Run `npm run dev` and test the full order flow end-to-end per the checklist in Task 11.

### Step 3: Merge PR #1

Go to https://github.com/AdranMacapia/TossdchickenApp/pull/1 and merge.

### Step 4: Start Phase 3 — Inventory Management

Run `superpowers:writing-plans` for Phase 3.

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
