# TOSS D' CHICKEN — Session Handoff

> This file is injected at every session start. Update it before clearing context.

---

## Project Status

**Phase:** Phase 3 COMPLETE — Menu Management (6 of 6 tasks done). Merged master → main.
**Last updated:** 2026-06-19
**Last session:** Completed Task 5 code quality review (4 fixes applied), implemented Task 6 (Flavors), merged to main. 56/56 tests passing.
**Next action:** Phase 3 UI Polish — run `minimalist-ui` + `react-view-transitions` skills for full visual redesign.

---

## What Was Done Last Session

Phase 3 Menu Management — COMPLETE:

- **PR #1 merged** — master → main merged via `gh`
- **Plan written** — `docs/superpowers/plans/2026-06-18-menu-management.md`
- **Task 1 ✅** — `src/components/PriceTag.tsx` + tests (6/6). SHA: `992facf`
- **Task 2 ✅** — `src/components/OwnerNav.tsx`. SHA after task 2 committed.
- **Task 3 ✅** — `src/App.tsx` — added lazy routes for Categories, MenuItems, Flavors. SHA: `d9a19a4`
- **Task 4 ✅** — `src/pages/menu/Categories.tsx` + tests (6/6 after fix). Fix: load error handling + delete protection test. SHA: `7db3c1d`
- **Task 5 ✅ FIXED** — Code quality review applied 4 fixes (toggle rollback, items-fetch error, test strengthened, delete guard). SHA: `91f988e`.
- **Task 6 ✅** — `src/pages/menu/Flavors.tsx` + tests (6/6). SHA: `79ca436`.
- **Merged to main** — master → main merged locally. 56/56 tests passing.

---

## What To Do Next

### Phase 3 UI Polish

Run `minimalist-ui` + `react-view-transitions` skills for full visual redesign.
Brand: Yellow `#FFCC00`, Black `#1A1A1A`, Hot Pink `#FF2D55`, White bg.
Goal: clean, minimalist, subtle animations.

Pages to polish: Login, Categories, MenuItems, Flavors, OrderScreen, Receipt.

### After UI Polish

Run `minimalist-ui` + `react-view-transitions` skills for full visual redesign.
Brand: Yellow `#FFCC00`, Black `#1A1A1A`, Hot Pink `#FF2D55`, White bg.
Goal: clean, minimalist, subtle animations.

---

## Brand Colors (locked)

| Token | Hex | Usage |
|---|---|---|
| `brand.primary` | `#FFCC00` | Yellow — buttons, active states, highlights |
| `brand.accent` | `#FF2D55` | Hot pink — badges, CTAs, "CHICKEN" energy |
| `brand.text` | `#1A1A1A` | Black — all text |
| `brand.bg` | `#FFFFFF` | White — page background |

> Buttons: yellow bg + black text. Never white text on yellow.
> UI polish scheduled after Phase 3 using `minimalist-ui` + `react-view-transitions`.

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
7. **Drizzled or not** — applies to DIPPING SAUCES (Ranch/Cheddar), not chicken flavors. If drizzled on food vs in cup = +₱1 COGS. `is_drizzled boolean default true` on `order_items`.
8. **Barkada Feast Box** — `max_flavors = 4` (2 chicken flavors + 2 dipping sauces), flat ₱299, no flavor surcharge. Jack Daniel's = +₱20 surcharge.
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

**Drinks:** Bottled Water ₱15, Soft Drinks ₱15 (Coke/Royal/Sprite)

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
│   ├── 2026-06-18-scaffold-auth.md   ← Phase 1 plan (done)
│   └── 2026-06-18-menu-management.md ← Phase 3 plan (in progress)
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts                    ← PWA + Vitest (env.NODE_ENV=test fix)
├── src/
│   ├── App.tsx                       ← router + AuthProvider + all lazy routes
│   ├── main.tsx
│   ├── index.css                     ← Tailwind directives only
│   ├── test/setup.ts                 ← jest-dom import
│   ├── lib/
│   │   ├── supabase.ts               ← Supabase client singleton
│   │   └── costing.ts                ← calcUnitCost, costPerUsageUnit (done)
│   ├── context/
│   │   ├── AuthContext.tsx           ← session, role, signIn, signOut
│   │   └── CartContext.tsx           ← cart state for POS
│   ├── hooks/
│   │   └── useMenuData.ts            ← loads categories/items/flavors (available only)
│   ├── components/
│   │   ├── PrivateRoute.tsx          ← role-based route guard
│   │   ├── CategoryTabBar.tsx        ← horizontal scrollable category tabs
│   │   ├── NumericKeypad.tsx         ← big-button qty input
│   │   ├── FlavorPicker.tsx          ← flavor selection modal
│   │   ├── PriceTag.tsx              ← ₱ formatted price + margin warning ✅ Phase 3
│   │   └── OwnerNav.tsx              ← owner page top bar ✅ Phase 3
│   └── pages/
│       ├── auth/
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── pos/
│       │   ├── OrderScreen.tsx       ← full POS (Phase 2 done)
│       │   └── Receipt.tsx           ← receipt view (Phase 2 done)
│       ├── reports/
│       │   └── Dashboard.tsx         ← STUB (Phase 6)
│       └── menu/
│           ├── Categories.tsx        ← CRUD ✅ Phase 3
│           ├── Categories.test.tsx
│           ├── MenuItems.tsx         ← CRUD + availability toggle ✅ Phase 3
│           ├── MenuItems.test.tsx
│           ├── Flavors.tsx           ← ⏳ Task 6 NOT YET DONE
│           └── Flavors.test.tsx      ← ⏳ Task 6 NOT YET DONE
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
