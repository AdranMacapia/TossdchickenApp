import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Ingredients from './Ingredients'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

const mockIngredients = [
  {
    id: 'ing-1', name: 'Cooking Oil',
    purchase_unit: 'L', purchase_qty: 1, purchase_price: 120, usage_unit: 'ml',
    current_stock: 5000, low_stock_threshold: 500,
  },
  {
    id: 'ing-2', name: 'Flour',
    purchase_unit: 'kg', purchase_qty: 1, purchase_price: 55, usage_unit: 'g',
    current_stock: 10000, low_stock_threshold: 500,
  },
]

function mockSupabase() {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === 'ingredients') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockIngredients, error: null }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any
    }
    return {} as any
  })
}

function renderIngredients() {
  return render(<MemoryRouter><Ingredients /></MemoryRouter>)
}

describe('Ingredients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders all ingredients after loading', async () => {
    renderIngredients()
    await waitFor(() => expect(screen.getByText('Cooking Oil')).toBeInTheDocument())
    expect(screen.getByText('Flour')).toBeInTheDocument()
  })

  it('shows Add Ingredient button', async () => {
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.getByText('+ Add Ingredient')).toBeInTheDocument()
  })

  it('opens add form when Add Ingredient clicked', async () => {
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    await userEvent.click(screen.getByText('+ Add Ingredient'))
    expect(screen.getByText('New Ingredient')).toBeInTheDocument()
  })

  it('opens edit form pre-filled when Edit clicked', async () => {
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    await userEvent.click(screen.getAllByText('Edit')[0])
    expect(screen.getByText('Edit Ingredient')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cooking Oil')).toBeInTheDocument()
    expect(screen.getByDisplayValue('120')).toBeInTheDocument()
  })

  it('removes ingredient from list when Delete clicked', async () => {
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    await userEvent.click(screen.getAllByText('Delete')[0])
    await waitFor(() => expect(screen.queryByText('Cooking Oil')).not.toBeInTheDocument())
  })

  it('shows Low Stock badge when current_stock is at or below threshold', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'ingredients') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { ...mockIngredients[0], current_stock: 400, low_stock_threshold: 500 },
                { ...mockIngredients[1], current_stock: 10000, low_stock_threshold: 500 },
              ],
              error: null,
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        } as any
      }
      return {} as any
    })
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
    expect(screen.getAllByText('Low Stock')).toHaveLength(1)
  })

  it('does not show Low Stock badge when stock is above threshold', async () => {
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.queryByText('Low Stock')).not.toBeInTheDocument()
  })

  it('does not show Low Stock badge when threshold is zero', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'ingredients') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { ...mockIngredients[0], current_stock: 0, low_stock_threshold: 0 },
              ],
              error: null,
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        } as any
      }
      return {} as any
    })
    renderIngredients()
    await waitFor(() => screen.getByText('Cooking Oil'))
    expect(screen.queryByText('Low Stock')).not.toBeInTheDocument()
  })
})
