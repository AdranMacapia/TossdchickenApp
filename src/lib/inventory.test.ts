import { describe, it, expect } from 'vitest'
import { buildDeductions } from './inventory'

describe('buildDeductions', () => {
  it('returns empty map when no recipes exist', () => {
    const result = buildDeductions([], [{ menuItemId: 'item-1', quantity: 2 }])
    expect(result.size).toBe(0)
  })

  it('returns empty map when cart is empty', () => {
    const result = buildDeductions(
      [{ menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 10 }],
      []
    )
    expect(result.size).toBe(0)
  })

  it('computes deduction for a single cart item', () => {
    const recipes = [{ menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 10 }]
    const cart = [{ menuItemId: 'item-1', quantity: 3 }]
    const result = buildDeductions(recipes, cart)
    expect(result.get('ing-1')).toBe(30)
  })

  it('sums deductions when two cart items share an ingredient', () => {
    const recipes = [
      { menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 10 },
      { menu_item_id: 'item-2', ingredient_id: 'ing-1', qty_used: 5 },
    ]
    const cart = [
      { menuItemId: 'item-1', quantity: 2 },
      { menuItemId: 'item-2', quantity: 1 },
    ]
    const result = buildDeductions(recipes, cart)
    expect(result.get('ing-1')).toBe(25) // (10 * 2) + (5 * 1)
  })

  it('handles multiple ingredients per menu item', () => {
    const recipes = [
      { menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 10 },
      { menu_item_id: 'item-1', ingredient_id: 'ing-2', qty_used: 20 },
    ]
    const cart = [{ menuItemId: 'item-1', quantity: 2 }]
    const result = buildDeductions(recipes, cart)
    expect(result.get('ing-1')).toBe(20)
    expect(result.get('ing-2')).toBe(40)
  })

  it('ignores recipe rows for items not in the cart', () => {
    const recipes = [
      { menu_item_id: 'item-1', ingredient_id: 'ing-1', qty_used: 10 },
      { menu_item_id: 'item-2', ingredient_id: 'ing-2', qty_used: 5 },
    ]
    const cart = [{ menuItemId: 'item-1', quantity: 1 }]
    const result = buildDeductions(recipes, cart)
    expect(result.get('ing-1')).toBe(10)
    expect(result.has('ing-2')).toBe(false)
  })
})
