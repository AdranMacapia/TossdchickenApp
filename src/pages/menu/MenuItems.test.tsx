import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MenuItems from './MenuItems'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

const mockCats = [{ id: 'cat-1', name: 'Poppers', sort_order: 1 }]
const mockItems = [
  { id: 'item-1', name: 'Solo', category_id: 'cat-1', base_price: 89, is_available: true, max_flavors: 1 },
  { id: 'item-2', name: 'Meal', category_id: 'cat-1', base_price: 75, is_available: false, max_flavors: 1 },
]

function mockSupabase() {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCats, error: null }),
        }),
      } as any
    }
    if (table === 'menu_items') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
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

function renderMenuItems() {
  return render(<MemoryRouter><MenuItems /></MemoryRouter>)
}

describe('MenuItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders all items after loading', async () => {
    renderMenuItems()
    await waitFor(() => expect(screen.getByText('Solo')).toBeInTheDocument())
    expect(screen.getByText('Meal')).toBeInTheDocument()
  })

  it('shows Add Item button', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    expect(screen.getByText('+ Add Item')).toBeInTheDocument()
  })

  it('shows a Flavors button for each item', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    expect(screen.getAllByText('Flavors')).toHaveLength(2)
  })

  it('opens add form when Add Item clicked', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    await userEvent.click(screen.getByText('+ Add Item'))
    expect(screen.getByText('New Item')).toBeInTheDocument()
  })

  it('opens edit form pre-filled when Edit clicked', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    await userEvent.click(screen.getAllByText('Edit')[0])
    expect(screen.getByText('Edit Item')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Solo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('89')).toBeInTheDocument()
  })

  it('optimistically flips availability label when toggle clicked', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    const toggle = screen.getAllByRole('button', { name: /available|unavailable/i })[0]
    expect(toggle).toHaveAccessibleName('Available')
    await userEvent.click(toggle)
    expect(toggle).toHaveAccessibleName('Unavailable')
  })

  it('shows a Recipe button for each item', async () => {
    renderMenuItems()
    await waitFor(() => screen.getByText('Solo'))
    expect(screen.getAllByText('Recipe')).toHaveLength(2)
  })
})
