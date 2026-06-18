import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Categories from './Categories'

vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn() } }))
import { supabase } from '../../lib/supabase'

const mockCats = [
  { id: 'cat-1', name: 'Poppers', sort_order: 1 },
  { id: 'cat-2', name: 'Drinks', sort_order: 2 },
]

function mockSupabase() {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === 'categories') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCats, error: null }),
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
    if (table === 'menu_items') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any
    }
    return {} as any
  })
}

function renderCategories() {
  return render(
    <MemoryRouter>
      <Categories />
    </MemoryRouter>
  )
}

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase()
  })

  it('renders category names after loading', async () => {
    renderCategories()
    await waitFor(() => expect(screen.getByText('Poppers')).toBeInTheDocument())
    expect(screen.getByText('Drinks')).toBeInTheDocument()
  })

  it('shows Add Category button', async () => {
    renderCategories()
    await waitFor(() => screen.getByText('Poppers'))
    expect(screen.getByText('+ Add Category')).toBeInTheDocument()
  })

  it('opens new category form when Add Category clicked', async () => {
    renderCategories()
    await waitFor(() => screen.getByText('Poppers'))
    await userEvent.click(screen.getByText('+ Add Category'))
    expect(screen.getByText('New Category')).toBeInTheDocument()
  })

  it('opens edit form pre-filled when Edit clicked', async () => {
    renderCategories()
    await waitFor(() => screen.getByText('Poppers'))
    await userEvent.click(screen.getAllByText('Edit')[0])
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Poppers')).toBeInTheDocument()
  })

  it('shows empty state when no categories', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any))
    renderCategories()
    await waitFor(() =>
      expect(screen.getByText(/no categories yet/i)).toBeInTheDocument()
    )
  })
})
