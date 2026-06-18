# TOSS D' CHICKEN — Session Handoff

> This file is injected at every session start. Update it before clearing context.

---

## Project Status

**Phase:** Pre-build (Day 0 of 14)
**Last updated:** 2026-06-18
**Last session:** Initial planning — no code written yet.
**Next action:** Set up Supabase project + scaffold React/Vite PWA (Days 1–2).

---

## What Was Done Last Session

- Reviewed full project plan PDF.
- Created HANDOFF.md, CLAUDE.md, and SessionStart hook (auto-injects this file into every new session).
- Mapped out all installed skills and plugins and their roles in the build.
- Ran `buildable-planner` — produced app spec, screen list, design system direction, phase plan, mock seed data, non-goals, plan audit gates.
- Confirmed skill workflow: `buildable-planner` (product plan) → `superpowers:writing-plans` (code-level implementation plan) → `superpowers:executing-plans` / `buildable-web-builder` (build).
- No source code written yet.

---

## What To Do Next

**Start of next session — run this exact skill sequence:**

### Step 1: `buildable-planner`
Properly run the Buildable Planner with the project PDF as input. Produces the official app spec + phase plan saved to `.buildable/phase-plan.md`. Note: Buildable CLI is not installed — will run the skill manually using the knowledge base if available, or follow the skill workflow against the PDF.

### Step 2: `superpowers:writing-plans`
Write the Days 1–2 implementation plan (scaffold + auth). Input = app spec from Step 1. Output = `docs/superpowers/plans/YYYY-MM-DD-scaffold-auth.md` with exact file paths, TDD steps, git commits.

### Step 3: `buildable-web-builder` + `superpowers:executing-plans`
Execute the plan — scaffold Vite PWA, install deps, set up Supabase auth, role-based routing.

**Days 1–2 deliverables:**
1. `npm create vite@latest tossdchicken -- --template react-ts`
2. Install: `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`, `vite-plugin-pwa`
3. Create Supabase project (walk user through it — provide exact steps)
4. Run DB schema SQL in Supabase SQL editor (full script is in this HANDOFF under Database Schema)
5. Wire up auth: Login + Register pages with Supabase Auth
6. Role-based route guards (owner vs cashier)
7. Seed: default settings row + at least one category

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| PWA | vite-plugin-pwa (Workbox) |
| Backend / DB / Auth | Supabase (free tier) — PostgreSQL + Row Level Security |
| Hosting | Vercel (free) |
| Currency | Philippine Peso (₱) |
| State | React Context or Zustand (decide at scaffold time) |

---

## Database Schema (all tables to create)

```sql
-- Run in Supabase SQL editor

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  base_price numeric(10,2) not null default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table flavors (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id),
  name text not null,
  price_surcharge numeric(10,2) default 0,
  flavor_cost numeric(10,2) default 0
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purchase_unit text not null,       -- e.g. 'L', 'kg', 'box'
  purchase_qty numeric not null,     -- e.g. 1
  purchase_price numeric(10,2) not null,
  usage_unit text not null,          -- e.g. 'ml', 'g', 'piece'
  current_stock numeric default 0,
  low_stock_threshold numeric default 0
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id),
  flavor_id uuid references flavors(id),  -- null = base recipe
  ingredient_id uuid references ingredients(id),
  usage_qty numeric not null
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial,
  cashier_id uuid references auth.users(id),
  total numeric(10,2) not null,
  payment_type text default 'cash',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  menu_item_id uuid references menu_items(id),
  flavor_id uuid references flavors(id),
  qty int not null default 1,
  unit_price numeric(10,2) not null,
  unit_cost numeric(10,2) not null
);

create table inventory_log (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references ingredients(id),
  change_qty numeric not null,
  reason text,   -- 'sale', 'restock', 'adjustment'
  reference_id uuid,
  created_at timestamptz default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,  -- 'rent','wages','utilities','gas','other'
  amount numeric(10,2) not null,
  note text,
  expense_date date not null default current_date
);

create table settings (
  id int primary key default 1,
  business_name text default 'Toss D'' Chicken',
  receipt_address text,
  receipt_contact text,
  target_margin_pct numeric(5,2) default 65,
  vat_enabled boolean default false,
  vat_rate numeric(5,2) default 12,
  vat_inclusive boolean default false
);

-- Seed default settings row
insert into settings (id) values (1) on conflict do nothing;
```

---

## Key Business Rules (never forget)

1. **Base + flavor cost model** — item cost = base recipe cost + flavor add-on cost. Change one base ingredient price and every flavor updates automatically.
2. **Unit conversion** — ingredients store purchase unit/qty/price AND usage unit. App auto-derives cost per usage unit (e.g. ₱120/1L oil = ₱0.12/ml). Conversions within families only (kg↔g, L↔ml, box↔piece).
3. **Suggested price formula** — `price = cost ÷ (1 − margin%)`. Flag items priced below target margin.
4. **Profit & Loss** — Sales − COGS = Gross Profit. Gross Profit − Opex = Net Profit. VAT is off now (non-VAT business), toggleable later.
5. **Inventory auto-deduction** — on every completed order, subtract each recipe ingredient qty from `ingredients.current_stock` and write to `inventory_log`.
6. **Roles** — `owner` can manage menu/costing/inventory/expenses/reports. `cashier` can only take orders and view receipt.

---

## File Structure (target)

```
tossdchicken/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── auth/         Login, Register
│   │   ├── pos/          OrderScreen, Receipt
│   │   ├── menu/         MenuItems, Categories, Flavors
│   │   ├── costing/      CostingSheet
│   │   ├── inventory/    IngredientList, RecipeEditor
│   │   ├── expenses/     ExpenseLog
│   │   └── reports/      Dashboard, PnL
│   ├── lib/
│   │   ├── supabase.ts   Supabase client
│   │   └── costing.ts    Cost calculation helpers
│   ├── context/          Auth context, Cart context
│   └── App.tsx
├── public/
│   └── manifest.json     PWA manifest
├── vite.config.ts
└── index.html
```

---

## Confirmed Skills Workflow

| Phase | Skills |
|---|---|
| Plan — Product level | `buildable-planner` ← START HERE next session |
| Plan — Code level | `superpowers:writing-plans` |
| Build each feature | `buildable-web-builder` + `feature-dev:feature-dev` + `superpowers:executing-plans` |
| React/UI patterns | `react-best-practices` + `react-ui-patterns` |
| Lib docs | `context7` MCP |
| Daily verification | `gsd-verify-work` + `superpowers:verification-before-completion` |
| Week 1 audit | `gsd-audit-milestone` |
| Security | `security-audit` |
| Mobile/PWA | `buildable-mobile-builder` + `web-to-mobile-audit` + `mobile-parity-check` |
| Pre-release QA | `mobile-qa-release` + `gsd-audit-uat` |
| Final review | `buildable-reviewer` + `code-review` |
| Deploy | `deploy-to-vercel` |
| Debugging | `superpowers:systematic-debugging` |

---

## Decisions Still Pending (ask user at next session start)

- [ ] Supabase project URL and anon key (user must create project — walk them through it)
- [ ] Base menu items and prices to seed (fried chicken piece, bucket, etc.)
- [ ] Flavor list (Plain, Spicy, Garlic, Honey Butter +₱10 surcharge — confirm)
- [ ] Receipt header: business name only, or also address + contact number?
- [ ] Separate staff logins now, or owner-only account first?
- [ ] Cashier role: can they see prices/costs, or just order screen + receipt?

---

## Context Limit Protocol

When context reaches ~70–80%:
1. Update the "What Was Done Last Session" and "What To Do Next" sections above.
2. Note any in-progress files or half-done work.
3. Tell the user: "Context is getting full — handoff updated. Please clear the session."
4. Stop working and wait.
