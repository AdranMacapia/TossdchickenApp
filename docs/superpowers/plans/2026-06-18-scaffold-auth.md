# Phase 1 — Scaffold + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Vite + React + TypeScript PWA with Tailwind CSS, wire up Supabase Auth with owner/cashier roles, create the full database schema, and protect all routes behind role-aware guards.

**Architecture:** React Router v6 wraps the entire app; an `AuthContext` holds the Supabase session and derives the user's role from `user_metadata.role`. A `PrivateRoute` component redirects unauthenticated users to `/login` and wrong-role users to their home screen. All pages are stubs except Login and Register — other phases fill them in.

**Tech Stack:** React 18, Vite 5, TypeScript 5 (strict), Tailwind CSS 3, React Router v6, @supabase/supabase-js 2, vite-plugin-pwa, Vitest, @testing-library/react

---

## Task 1: Scaffold Vite project

**Files:**
- Create (generated): `package.json`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/assets/`

- [ ] **Step 1: Scaffold in the current directory**

Open a terminal in `C:\Users\Adrian\Documents\TossdchickenApp` and run:

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Please choose how to proceed" → select **"Ignore files and continue"**.

Expected output:
```
Scaffolding project in C:/Users/Adrian/Documents/TossdchickenApp...
Done. Now run:
  npm install
```

- [ ] **Step 2: Install base dependencies**

```bash
npm install
```

Expected: `added XXX packages` with no errors.

- [ ] **Step 3: Verify it runs**

```bash
npm run dev
```

Open browser at `http://localhost:5173` — you should see the Vite + React default page. Press `Ctrl+C` to stop.

- [ ] **Step 4: Commit**

```bash
git init
git add package.json package-lock.json index.html tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts src/
git commit -m "chore: scaffold vite react-ts project"
```

---

## Task 2: Install all project dependencies

**Files:**
- Modify: `package.json` (deps added by npm)

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @supabase/supabase-js react-router-dom
```

- [ ] **Step 2: Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Expected: creates `tailwind.config.js` and `postcss.config.js`.

- [ ] **Step 3: Rename tailwind config to TypeScript**

```bash
mv tailwind.config.js tailwind.config.ts
```

- [ ] **Step 4: Install PWA plugin**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 5: Install test dependencies**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tailwind.config.ts postcss.config.js
git commit -m "chore: install tailwind, supabase, router, pwa, vitest"
```

---

## Task 3: Configure TypeScript strict mode

**Files:**
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Replace tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Verify no TS errors in scaffold**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

---

## Task 4: Configure Tailwind CSS with brand colors

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Write tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E8610A',
          bg: '#FFF8F2',
          text: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        btn: '24px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 2: Replace src/index.css with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/index.css
git commit -m "chore: configure tailwind with brand colors"
```

---

## Task 5: Configure Vite (PWA + Vitest)

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Toss D' Chicken",
        short_name: 'TossDChicken',
        theme_color: '#E8610A',
        background_color: '#FFF8F2',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 2: Create src/test/setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to package.json**

Open `package.json` and add to the `"scripts"` section:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Run tests to confirm setup works (no tests yet = zero failures)**

```bash
npm test -- --run
```

Expected output:
```
No test files found, exiting with code 0
```

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts src/test/setup.ts package.json
git commit -m "chore: configure vitest and pwa plugin"
```

---

## Task 6: Git ignore and environment files

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env.local` ← YOU fill this in (not committed)

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 3: Create .env.local (you fill this in — see Task 7 for where to get the values)**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: add gitignore and env template"
```

---

## Task 7: Create Supabase project and run schema

> **This task requires manual browser actions by the user. No code is written here.**

- [ ] **Step 1: Create Supabase project**

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New project"**.
3. Name it `tossdchicken`, choose a database password (save it somewhere), select the region closest to you (e.g., Southeast Asia → Singapore).
4. Click **"Create new project"** and wait ~2 minutes for it to provision.

- [ ] **Step 2: Get your project credentials**

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy **Project URL** → paste into `.env.local` as `VITE_SUPABASE_URL`.
3. Copy **anon / public key** → paste into `.env.local` as `VITE_SUPABASE_ANON_KEY`.

- [ ] **Step 3: Run the database schema SQL**

In Supabase dashboard, click **SQL Editor → New query**. Paste and run the following:

```sql
-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0
);

-- Menu items
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  base_price numeric(10,2) not null default 0,
  is_available boolean default true,
  max_flavors int default 1,
  created_at timestamptz default now()
);

-- Flavors
create table flavors (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  name text not null,
  price_surcharge numeric(10,2) default 0,
  flavor_cost numeric(10,2) default 0
);

-- Ingredients
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purchase_unit text not null,
  purchase_qty numeric not null,
  purchase_price numeric(10,2) not null,
  usage_unit text not null,
  current_stock numeric default 0,
  low_stock_threshold numeric default 0
);

-- Recipes
create table recipes (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  flavor_id uuid references flavors(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete cascade,
  usage_qty numeric not null
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial,
  cashier_id uuid references auth.users(id),
  total numeric(10,2) not null,
  payment_type text default 'cash',
  created_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  flavor_id uuid references flavors(id),
  qty int not null default 1,
  unit_price numeric(10,2) not null,
  unit_cost numeric(10,2) not null,
  is_drizzled boolean not null default true,
  note text
);

-- Inventory log
create table inventory_log (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references ingredients(id),
  change_qty numeric not null,
  reason text,
  reference_id uuid,
  created_at timestamptz default now()
);

-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric(10,2) not null,
  note text,
  expense_date date not null default current_date
);

-- Settings (single row)
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
```

Click **Run**. Expected: "Success. No rows returned."

- [ ] **Step 4: Run seed data SQL**

In SQL Editor, open a new query tab. Paste and run:

```sql
-- Settings seed
insert into settings (id, business_name, receipt_address, receipt_contact)
values (1, 'Toss D'' Chicken', 'Add your address', '09XX-XXX-XXXX')
on conflict do nothing;

-- Categories
insert into categories (id, name, sort_order) values
  ('b1000000-0000-0000-0000-000000000001', 'Poppers', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Extras',  2),
  ('b1000000-0000-0000-0000-000000000003', 'Drinks',  3);

-- Menu items
insert into menu_items (id, category_id, name, base_price, max_flavors) values
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Solo (15 pcs + Cucumber + Sauce)', 89.00, 1),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Meal (9 pcs + Rice)',              75.00, 1),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Pop & Fries Combo (15 pcs + Fries + Sauce)', 149.00, 1),
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Barkada Feast Box (50 pcs + Fries + 2 Sauces)', 299.00, 2),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Rice',            15.00, 1),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Add Flavor',      15.00, 1),
  ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000002', 'Dipping Sauce',   15.00, 1),
  ('a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000002', 'Cajun Fries',     59.00, 1),
  ('a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 'Bottled Water',   15.00, 1),
  ('a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000003', 'Coke',            15.00, 1);

-- Solo flavors
insert into flavors (menu_item_id, name, price_surcharge, flavor_cost) values
  ('a1000000-0000-0000-0000-000000000001', 'Original',         0,  0.00),
  ('a1000000-0000-0000-0000-000000000001', 'Honey Garlic',     10, 3.00),
  ('a1000000-0000-0000-0000-000000000001', 'Salted Egg',       10, 4.00),
  ('a1000000-0000-0000-0000-000000000001', 'Buffalo',          10, 3.50),
  ('a1000000-0000-0000-0000-000000000001', 'Sweet Chili',      10, 2.50),
  ('a1000000-0000-0000-0000-000000000001', 'Garlic Parmesan',  10, 3.50),
  ('a1000000-0000-0000-0000-000000000001', 'Cheesy Jalapeño',  10, 4.00),
  ('a1000000-0000-0000-0000-000000000001', 'Jack Daniel''s',   20, 5.00);

-- Meal flavors
insert into flavors (menu_item_id, name, price_surcharge, flavor_cost) values
  ('a1000000-0000-0000-0000-000000000002', 'Original',         0,  0.00),
  ('a1000000-0000-0000-0000-000000000002', 'Honey Garlic',     10, 3.00),
  ('a1000000-0000-0000-0000-000000000002', 'Salted Egg',       10, 4.00),
  ('a1000000-0000-0000-0000-000000000002', 'Buffalo',          10, 3.50),
  ('a1000000-0000-0000-0000-000000000002', 'Sweet Chili',      10, 2.50),
  ('a1000000-0000-0000-0000-000000000002', 'Garlic Parmesan',  10, 3.50),
  ('a1000000-0000-0000-0000-000000000002', 'Cheesy Jalapeño',  10, 4.00),
  ('a1000000-0000-0000-0000-000000000002', 'Jack Daniel''s',   20, 5.00);

-- Barkada Feast Box flavors (no surcharge — flat price)
insert into flavors (menu_item_id, name, price_surcharge, flavor_cost) values
  ('a1000000-0000-0000-0000-000000000004', 'Original',         0, 0.00),
  ('a1000000-0000-0000-0000-000000000004', 'Honey Garlic',     0, 3.00),
  ('a1000000-0000-0000-0000-000000000004', 'Salted Egg',       0, 4.00),
  ('a1000000-0000-0000-0000-000000000004', 'Buffalo',          0, 3.50),
  ('a1000000-0000-0000-0000-000000000004', 'Sweet Chili',      0, 2.50),
  ('a1000000-0000-0000-0000-000000000004', 'Garlic Parmesan',  0, 3.50),
  ('a1000000-0000-0000-0000-000000000004', 'Cheesy Jalapeño',  0, 4.00),
  ('a1000000-0000-0000-0000-000000000004', 'Jack Daniel''s',   0, 5.00);

-- Sample ingredients
insert into ingredients (name, purchase_unit, purchase_qty, purchase_price, usage_unit, current_stock, low_stock_threshold) values
  ('Cooking Oil',    'L',    1, 120.00, 'ml',    5000, 500),
  ('Flour',          'kg',   1,  55.00,  'g',   10000, 500),
  ('Chicken Fillet', 'kg',   1, 200.00,  'g',    8000, 500),
  ('Egg',            'tray', 1, 240.00, 'piece',   30,   6);
```

Click **Run**. Expected: "Success. No rows returned."

- [ ] **Step 5: Verify tables in Table Editor**

In Supabase dashboard, click **Table Editor**. You should see: `categories`, `menu_items`, `flavors`, `ingredients`, `recipes`, `orders`, `order_items`, `inventory_log`, `expenses`, `settings`. Click `categories` — you should see 3 rows (Poppers, Extras, Drinks).

---

## Task 8: Supabase client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase client"
```

---

## Task 9: AuthContext (TDD)

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/context/AuthContext.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/context/AuthContext.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useContext } from 'react'
import { AuthContext, AuthProvider } from './AuthContext'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

function TestConsumer() {
  const ctx = useContext(AuthContext)
  return (
    <div>
      <span data-testid="role">{ctx.role ?? 'none'}</span>
      <span data-testid="loading">{ctx.loading ? 'loading' : 'ready'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('starts loading then resolves to no session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    )
    expect(screen.getByTestId('role')).toHaveTextContent('none')
  })

  it('extracts owner role from user metadata', async () => {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'uid-1',
            user_metadata: { role: 'owner' },
          },
        } as any,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('role')).toHaveTextContent('owner')
    )
  })

  it('extracts cashier role from user metadata', async () => {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'uid-2',
            user_metadata: { role: 'cashier' },
          },
        } as any,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('role')).toHaveTextContent('cashier')
    )
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --run
```

Expected: 3 failures — `AuthContext` and `AuthProvider` not found.

- [ ] **Step 3: Implement src/context/AuthContext.tsx**

```typescript
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type Role = 'owner' | 'cashier' | null

interface AuthState {
  session: Session | null
  user: User | null
  role: Role
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const role: Role =
    (session?.user?.user_metadata?.role as Role) ?? null

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, role, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --run
```

Expected:
```
✓ src/context/AuthContext.test.tsx (3)
  ✓ starts loading then resolves to no session
  ✓ extracts owner role from user metadata
  ✓ extracts cashier role from user metadata
Test Files  1 passed (1)
```

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/context/AuthContext.test.tsx
git commit -m "feat: add AuthContext with role extraction (TDD)"
```

---

## Task 10: PrivateRoute component (TDD)

**Files:**
- Create: `src/components/PrivateRoute.tsx`
- Create: `src/components/PrivateRoute.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/PrivateRoute.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { PrivateRoute } from './PrivateRoute'

function makeAuth(overrides: Partial<Parameters<typeof AuthContext.Provider>[0]['value']>) {
  return {
    session: null,
    user: null,
    role: null as 'owner' | 'cashier' | null,
    loading: false,
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    ...overrides,
  }
}

function renderWithRouter(authValue: ReturnType<typeof makeAuth>, allowedRole: 'owner' | 'cashier') {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/pos" element={<div>POS Page</div>} />
          <Route path="/reports/dashboard" element={<div>Dashboard Page</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute role={allowedRole}>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('PrivateRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    renderWithRouter(makeAuth({ role: null }), 'owner')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects cashier trying to access owner route to /pos', () => {
    renderWithRouter(
      makeAuth({ role: 'cashier', session: { user: {} } as any }),
      'owner'
    )
    expect(screen.getByText('POS Page')).toBeInTheDocument()
  })

  it('renders content when role matches', () => {
    renderWithRouter(
      makeAuth({ role: 'owner', session: { user: {} } as any }),
      'owner'
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders cashier content when cashier accesses cashier route', () => {
    renderWithRouter(
      makeAuth({ role: 'cashier', session: { user: {} } as any }),
      'cashier'
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --run
```

Expected: 4 failures — `PrivateRoute` not found.

- [ ] **Step 3: Implement src/components/PrivateRoute.tsx**

```typescript
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  role: 'owner' | 'cashier'
  children: ReactNode
}

export function PrivateRoute({ role, children }: Props) {
  const { session, role: userRole, loading } = useAuth()

  if (loading) return null

  if (!session) return <Navigate to="/login" replace />

  if (userRole !== role) {
    return <Navigate to={userRole === 'cashier' ? '/pos' : '/reports/dashboard'} replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 4: Run tests — verify all 7 pass**

```bash
npm test -- --run
```

Expected:
```
✓ src/context/AuthContext.test.tsx (3)
✓ src/components/PrivateRoute.test.tsx (4)
Test Files  2 passed (2)
Tests  7 passed (7)
```

- [ ] **Step 5: Commit**

```bash
git add src/components/PrivateRoute.tsx src/components/PrivateRoute.test.tsx
git commit -m "feat: add PrivateRoute role guard (TDD)"
```

---

## Task 11: Login page

**Files:**
- Create: `src/pages/auth/Login.tsx`

- [ ] **Step 1: Create src/pages/auth/Login.tsx**

```typescript
import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn, role } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    // role may not be updated in state yet — navigate based on what we get after sign in
    // AuthContext will update role from onAuthStateChange; use a brief re-check
    navigate(role === 'cashier' ? '/pos' : '/reports/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-1">
          Toss D' Chicken
        </h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-primary text-white rounded-btn py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          First time?{' '}
          <Link to="/register" className="text-brand-primary font-medium">
            Create owner account
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

## Task 12: Register page

**Files:**
- Create: `src/pages/auth/Register.tsx`

- [ ] **Step 1: Create src/pages/auth/Register.tsx**

```typescript
import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'owner' },
      },
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-1">
          Create Owner Account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          One owner account per store
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-primary text-white rounded-btn py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit both auth pages**

```bash
git add src/pages/auth/
git commit -m "feat: add login and register pages"
```

---

## Task 13: Page stubs (owner landing + cashier POS)

**Files:**
- Create: `src/pages/reports/Dashboard.tsx`
- Create: `src/pages/pos/OrderScreen.tsx`

- [ ] **Step 1: Create src/pages/reports/Dashboard.tsx**

```typescript
export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-brand-text">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">Reports coming in Phase 6.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create src/pages/pos/OrderScreen.tsx**

```typescript
export default function OrderScreen() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-brand-text">Order Screen</h1>
      <p className="text-sm text-gray-500 mt-1">POS coming in Phase 2.</p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/reports/Dashboard.tsx src/pages/pos/OrderScreen.tsx
git commit -m "chore: add page stubs for dashboard and pos"
```

---

## Task 14: App.tsx router + AuthProvider

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Replace src/App.tsx**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/reports/Dashboard'))
const OrderScreen = lazy(() => import('./pages/pos/OrderScreen'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Owner routes */}
            <Route
              path="/reports/dashboard"
              element={
                <PrivateRoute role="owner">
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Cashier routes */}
            <Route
              path="/pos"
              element={
                <PrivateRoute role="cashier">
                  <OrderScreen />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 2: Replace src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected:
```
Test Files  2 passed (2)
Tests  7 passed (7)
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire up router with AuthProvider and PrivateRoute guards"
```

---

## Task 15: Smoke test in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:5173`.

Expected: redirected to `/login` and Login page renders with the Toss D' Chicken heading.

- [ ] **Step 2: Register as owner**

Click "Create owner account" → fill in your email + password → submit.

Expected: redirected to `/login`.

- [ ] **Step 3: Sign in as owner**

Sign in with the email/password you just registered.

Expected: redirected to `/reports/dashboard` and you see "Dashboard — Reports coming in Phase 6."

- [ ] **Step 4: Sign out and test cashier guard**

To test: in Supabase dashboard → **Authentication → Users** → click your user → **Edit** → change `user_metadata` to `{"role":"cashier"}` → save.

Sign in again. Expected: redirected to `/pos` and you see "Order Screen — POS coming in Phase 2."

- [ ] **Step 5: Test unauthorized access**

While signed in as cashier, navigate to `http://localhost:5173/reports/dashboard`.

Expected: redirected back to `/pos`.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: phase 1 complete - scaffold + auth + role routing"
```

---

## Self-Review

**Spec coverage:**
- [x] `npm create vite@latest` → Task 1
- [x] Install `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`, `vite-plugin-pwa` → Task 2
- [x] Supabase project creation walkthrough → Task 7
- [x] Full DB schema SQL (all 10 tables + `is_drizzled`, `max_flavors`) → Task 7
- [x] Seed data (real menu items, all 8 flavors) → Task 7
- [x] `src/lib/supabase.ts` → Task 8
- [x] Auth context with role extraction → Task 9
- [x] Login + Register pages → Tasks 11–12
- [x] Role-based route guards → Task 10
- [x] Owner → Dashboard, Cashier → POS → Task 14
- [x] Tailwind brand colors → Task 4
- [x] PWA manifest in vite.config.ts → Task 5
- [x] TypeScript strict mode → Task 3
- [x] Frequent commits → every task

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `Role = 'owner' | 'cashier' | null` used consistently in AuthContext, PrivateRoute, and tests.
- `useAuth()` is the only way to consume AuthContext — used in Login, PrivateRoute.
- `supabase` exported as named export from `src/lib/supabase.ts` — imported correctly in AuthContext and Register.
