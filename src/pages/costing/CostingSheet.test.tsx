import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CostingSheet from './CostingSheet'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

// 50ml oil at ₱0.12/ml = ₱6 base cost
// Original: price=89, cost=6  → margin 93.3% → OK
// Honey Garlic: price=99 (89+10), cost=9 (6+3) → margin 90.9% → OK
const mockItems = [{ id: 'item-1', name: 'Solo', base_price: 89 }]
const mockFlavors = [
  { id: 'flv-1', menu_item_id: 'item-1', name: 'Original', price_surcharge: 0, flavor_cost: 0 },
  { id: 'flv-2', menu_item_id: 'item-1', name: 'Honey Garlic', price_surcharge: 10, flavor_cost: 3 },
]
const mockRecipes = [
  { id: 'rec-1', menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 50 },
]
const mockIngredients = [
  { id: 'ing-1', purchase_price: 120, purchase_qty: 1, purchase_unit: 'L', usage_unit: 'ml' },
]

function mockSupabase() {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === 'menu_items') {
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: mockItems, error: null }) }) } as any
    }
    if (table === 'flavors') {
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: mockFlavors, error: null }) }) } as any
    }
    if (table === 'recipes') {
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: mockRecipes, error: null }) }) } as any
    }
    if (table === 'ingredients') {
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: mockIngredients, error: null }) }) } as any
    }
    return {} as any
  })
}

function renderCostingSheet() {
  return render(<MemoryRouter><CostingSheet /></MemoryRouter>)
}

describe('CostingSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders page heading', async () => {
    renderCostingSheet()
    await waitFor(() => expect(screen.getByText('Costing Sheet')).toBeInTheDocument())
  })

  it('renders one row per flavor', async () => {
    renderCostingSheet()
    await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument())
    expect(screen.getByText('Honey Garlic')).toBeInTheDocument()
  })

  it('renders the item name', async () => {
    renderCostingSheet()
    await waitFor(() => expect(screen.getAllByText('Solo').length).toBeGreaterThan(0))
  })

  it('shows OK status for items above target margin', async () => {
    // Both flavors have margin well above 65%
    renderCostingSheet()
    await waitFor(() => screen.getByText('Original'))
    expect(screen.getAllByText('OK').length).toBeGreaterThan(0)
  })
})
