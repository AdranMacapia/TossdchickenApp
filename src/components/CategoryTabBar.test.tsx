import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CategoryTabBar } from './CategoryTabBar'

const categories = [
  { id: 'cat-1', name: 'Poppers' },
  { id: 'cat-2', name: 'Extras' },
  { id: 'cat-3', name: 'Drinks' },
]

describe('CategoryTabBar', () => {
  it('renders All tab and all category names', () => {
    render(<CategoryTabBar categories={categories} selectedId={null} onSelect={vi.fn()} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Poppers')).toBeInTheDocument()
    expect(screen.getByText('Extras')).toBeInTheDocument()
    expect(screen.getByText('Drinks')).toBeInTheDocument()
  })

  it('calls onSelect with null when All is clicked', async () => {
    const onSelect = vi.fn()
    render(<CategoryTabBar categories={categories} selectedId="cat-1" onSelect={onSelect} />)
    await userEvent.click(screen.getByText('All'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('calls onSelect with category id when a tab is clicked', async () => {
    const onSelect = vi.fn()
    render(<CategoryTabBar categories={categories} selectedId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Poppers'))
    expect(onSelect).toHaveBeenCalledWith('cat-1')
  })
})
