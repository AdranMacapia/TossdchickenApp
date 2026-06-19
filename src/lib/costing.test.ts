import { describe, it, expect } from 'vitest'
import { costPerUsageUnit, calcUnitCost, suggestedPrice, isUnderMargin } from './costing'

/**
 * @vitest environment node
 */
describe('costPerUsageUnit', () => {
  it('converts L → ml (₱120 / 1L = ₱0.12 / ml)', () => {
    expect(
      costPerUsageUnit({ purchase_price: 120, purchase_qty: 1, purchase_unit: 'L', usage_unit: 'ml' })
    ).toBeCloseTo(0.12)
  })

  it('converts kg → g (₱55 / 1kg = ₱0.055 / g)', () => {
    expect(
      costPerUsageUnit({ purchase_price: 55, purchase_qty: 1, purchase_unit: 'kg', usage_unit: 'g' })
    ).toBeCloseTo(0.055)
  })

  it('same unit returns price per qty (₱240 / 30 pieces = ₱8 / piece)', () => {
    expect(
      costPerUsageUnit({ purchase_price: 240, purchase_qty: 30, purchase_unit: 'piece', usage_unit: 'piece' })
    ).toBeCloseTo(8)
  })
})

describe('calcUnitCost', () => {
  it('returns 0 when no recipes and no flavor cost', () => {
    expect(calcUnitCost([], [], 0, true)).toBe(0)
  })

  it('adds ₱1 drizzle cost when isDrizzled is false', () => {
    expect(calcUnitCost([], [], 0, false)).toBe(1)
  })

  it('adds flavor cost', () => {
    expect(calcUnitCost([], [], 3.5, true)).toBe(3.5)
  })

  it('calculates recipe ingredient cost', () => {
    const recipes = [{ ingredient_id: 'ing-1', usage_qty: 100 }]
    const ingredients = [{
      id: 'ing-1',
      purchase_price: 120,
      purchase_qty: 1,
      purchase_unit: 'L',
      usage_unit: 'ml',
    }]
    // 100ml × ₱0.12/ml = ₱12
    expect(calcUnitCost(recipes, ingredients, 0, true)).toBeCloseTo(12)
  })

  it('sums recipe cost + flavor cost + drizzle cost', () => {
    const recipes = [{ ingredient_id: 'ing-1', usage_qty: 100 }]
    const ingredients = [{
      id: 'ing-1',
      purchase_price: 120,
      purchase_qty: 1,
      purchase_unit: 'L',
      usage_unit: 'ml',
    }]
    // ₱12 (100ml oil) + ₱3.50 (flavor) + ₱1 (not drizzled) = ₱16.50
    expect(calcUnitCost(recipes, ingredients, 3.5, false)).toBeCloseTo(16.5)
  })
})

describe('suggestedPrice', () => {
  it('returns cost / (1 - marginTarget)', () => {
    // 35 / (1 - 0.65) = 35 / 0.35 = 100
    expect(suggestedPrice(35, 0.65)).toBeCloseTo(100)
  })
  it('at 0% margin returns cost itself', () => {
    expect(suggestedPrice(50, 0)).toBeCloseTo(50)
  })
})

describe('isUnderMargin', () => {
  it('returns false when price equals suggested price', () => {
    expect(isUnderMargin(100, 35, 0.65)).toBe(false)
  })
  it('returns false when price exceeds suggested price', () => {
    expect(isUnderMargin(110, 35, 0.65)).toBe(false)
  })
  it('returns true when price is below suggested price', () => {
    expect(isUnderMargin(80, 35, 0.65)).toBe(true)
  })
  it('returns false when cost is 0 (no recipe yet)', () => {
    expect(isUnderMargin(89, 0, 0.65)).toBe(false)
  })
})
