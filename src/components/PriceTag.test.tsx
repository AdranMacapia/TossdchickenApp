import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PriceTag } from './PriceTag'

describe('PriceTag', () => {
  it('formats price with peso sign and two decimals', () => {
    render(<PriceTag price={89} />)
    expect(screen.getByText('₱89.00')).toBeInTheDocument()
  })

  it('formats large price with comma separator', () => {
    render(<PriceTag price={1299} />)
    expect(screen.getByText('₱1,299.00')).toBeInTheDocument()
  })

  it('shows no warning when cost is not provided', () => {
    render(<PriceTag price={89} />)
    expect(screen.queryByText(/below margin/i)).not.toBeInTheDocument()
  })

  it('shows no warning when margin is above 65% target', () => {
    // price=100, cost=30 → margin = 70% > 65%
    render(<PriceTag price={100} cost={30} />)
    expect(screen.queryByText(/below margin/i)).not.toBeInTheDocument()
  })

  it('shows warning when margin is below 65% target', () => {
    // price=100, cost=40 → margin = 60% < 65%
    render(<PriceTag price={100} cost={40} />)
    expect(screen.getByText(/below margin/i)).toBeInTheDocument()
  })

  it('respects custom marginTarget', () => {
    // price=100, cost=35 → margin = 65% < 70% → warning at 0.70 target
    render(<PriceTag price={100} cost={35} marginTarget={0.70} />)
    expect(screen.getByText(/below margin/i)).toBeInTheDocument()
  })
})
