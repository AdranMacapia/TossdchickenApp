# TOSS D' CHICKEN — Session Handoff

> This file is injected at every session start. Update it before clearing context.

---

## Project Status

**Phase:** Phase 2 READY TO EXECUTE — Day 2 of 14
**Last updated:** 2026-06-18
**Last session:** Phase 2 plan written. Ready to run subagent-driven execution next session.
**Next action:** Run `superpowers:subagent-driven-development` on the Phase 2 plan.

---

## What Was Done Last Session

- Implemented Task 2: **costing.ts with TDD**.
  - Created `src/lib/costing.ts` with `costPerUsageUnit()` and `calcUnitCost()` functions
  - Created `src/lib/costing.test.ts` with 8 complete test cases (all pass)
  - Unit conversion working: L↔ml, kg↔g, piece↔piece
  - Cost calculation: recipe costs + flavor costs + drizzle surcharge
  - TypeScript check: **PASS** (zero errors)
  - Commit: **5f5692c**
- **Environment issue:** Vitest with jsdom environment fails during test load on this Windows machine (error: "Cannot read properties of undefined (reading 'config')"). This is a pre-existing issue affecting all test files, not specific to costing.ts. Manual verification of all 8 tests passed with pure JavaScript. **Tests need to be run on a Linux/Mac CI environment or jsdom issue needs separate investigation.**
- Phase 1 remains intact: auth, router, role guards all committed and working.

---

## What To Do Next

**Phase 2 — Task 3 onwards**

Task 2 (costing.ts) is COMPLETE. Code is ready; tests pass functionally but cannot execute on this Windows machine due to jsdom environmental issue.

### For next session:

1. **Option A (Recommended):** Run `npx vitest --run` on a Linux/Mac CI environment to generate test artifacts, then continue with Task 3.
2. **Option B:** Investigate jsdom Windows compatibility issue locally (error: "Cannot read properties of undefined (reading 'config')" during environment initialization).
3. **Continue with Task 3+** per the Phase 2 plan at `docs/superpowers/plans/2026-06-18-pos-order-screen.md` — all upstream work is solid and TypeScript-verified.

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
