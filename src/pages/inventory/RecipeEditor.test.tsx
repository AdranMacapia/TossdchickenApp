import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RecipeEditor from './RecipeEditor'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

const mockItem = { id: 'item-1', name: 'Solo' }
const mockIngredients = [
  { id: 'ing-1', name: 'Cooking Oil', purchase_unit: 'L', purchase_qty: 1, purchase_price: 120, usage_unit: 'ml' },
  { id: 'ing-2', name: 'Flour', purchase_unit: 'kg', purchase_qty: 1, purchase_price: 55, usage_unit: 'g' },
]
const mockRecipes = [
  { id: 'rec-1', menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 50 },
]

function mockSupabase() {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === 'menu_items') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          }),
        }),
      } as any
    }
    if (table === 'recipes') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockRecipes, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any
    }
    if (table === 'ingredients') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockIngredients, error: null }),
        }),
      } as any
    }
    return {} as any
  })
}

function renderRecipeEditor() {
  return render(
    <MemoryRouter initialEntries={['/inventory/recipes/item-1']}>
      <Routes>
        <Route path="/inventory/recipes/:itemId" element={<RecipeEditor />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RecipeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders item name in header', async () => {
    renderRecipeEditor()
    await waitFor(() => expect(screen.getByText(/Solo/)).toBeInTheDocument())
  })

  it('renders existing recipe rows with ingredient name', async () => {
    renderRecipeEditor()
    await waitFor(() => expect(screen.getByText('Cooking Oil')).toBeInTheDocument())
    expect(screen.getByText(/50/)).toBeInTheDocument()
  })

  it('shows Total COGS line', async () => {
    renderRecipeEditor()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.getByText(/Total COGS/i)).toBeInTheDocument()
  })

  it('shows Add Ingredient button', async () => {
    renderRecipeEditor()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.getByText('+ Add Ingredient')).toBeInTheDocument()
  })

  it('removes recipe row when Remove clicked', async () => {
    renderRecipeEditor()
    await waitFor(() => screen.getByText('Cooking Oil'))
    await userEvent.click(screen.getByText('Remove'))
    await waitFor(() => expect(screen.queryByText('Cooking Oil')).not.toBeInTheDocument())
  })
})
