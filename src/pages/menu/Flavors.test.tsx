import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Flavors from './Flavors'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

const mockItem = { id: 'item-1', name: 'Solo' }
const mockFlavors = [
  { id: 'flv-1', menu_item_id: 'item-1', name: 'Original', price_surcharge: 0, flavor_cost: 0 },
  { id: 'flv-2', menu_item_id: 'item-1', name: 'Honey Garlic', price_surcharge: 10, flavor_cost: 3 },
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
    if (table === 'flavors') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFlavors, error: null }),
          }),
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

function renderFlavors() {
  return render(
    <MemoryRouter initialEntries={['/menu/items/item-1/flavors']}>
      <Routes>
        <Route path="/menu/items/:itemId/flavors" element={<Flavors />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Flavors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders item name in the header', async () => {
    renderFlavors()
    await waitFor(() => expect(screen.getByText(/Solo/)).toBeInTheDocument())
  })

  it('renders all flavors', async () => {
    renderFlavors()
    await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument())
    expect(screen.getByText('Honey Garlic')).toBeInTheDocument()
  })

  it('shows Add Flavor button', async () => {
    renderFlavors()
    await waitFor(() => screen.getByText('Original'))
    expect(screen.getByText('+ Add Flavor')).toBeInTheDocument()
  })

  it('opens new flavor form when Add Flavor clicked', async () => {
    renderFlavors()
    await waitFor(() => screen.getByText('Original'))
    await userEvent.click(screen.getByText('+ Add Flavor'))
    expect(screen.getByText('New Flavor')).toBeInTheDocument()
  })

  it('opens edit form pre-filled when Edit clicked', async () => {
    renderFlavors()
    await waitFor(() => screen.getByText('Original'))
    await userEvent.click(screen.getAllByText('Edit')[1])
    expect(screen.getByText('Edit Flavor')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Honey Garlic')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('removes flavor from list when Delete clicked', async () => {
    renderFlavors()
    await waitFor(() => screen.getByText('Original'))
    await userEvent.click(screen.getAllByText('Delete')[0])
    await waitFor(() => expect(screen.queryByText('Original')).not.toBeInTheDocument())
  })
})
