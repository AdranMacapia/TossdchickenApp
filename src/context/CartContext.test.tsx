import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { CartProvider, useCart } from './CartContext'

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

const sampleItem = {
  menuItemId: 'item-solo',
  menuItemName: 'Solo',
  selectedFlavors: [{ id: 'flv-hg', name: 'Honey Garlic', surcharge: 10 }],
  quantity: 1,
  unitPrice: 99,
  isDrizzled: true,
}

describe('CartContext', () => {
  it('starts with empty items and takeout order type', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.orderType).toBe('takeout')
    expect(result.current.total).toBe(0)
  })

  it('addItem adds a new line item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(sampleItem))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].menuItemName).toBe('Solo')
  })

  it('addItem always creates a new line (no auto-merge)', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(sampleItem))
    act(() => result.current.addItem(sampleItem))
    expect(result.current.items).toHaveLength(2)
  })

  it('removeItem removes item by cartItemId', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(sampleItem))
    const { cartItemId } = result.current.items[0]
    act(() => result.current.removeItem(cartItemId))
    expect(result.current.items).toHaveLength(0)
  })

  it('updateQty sets new quantity for a cart item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(sampleItem))
    const { cartItemId } = result.current.items[0]
    act(() => result.current.updateQty(cartItemId, 3))
    expect(result.current.items[0].quantity).toBe(3)
  })

  it('clearCart empties all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(sampleItem))
    act(() => result.current.addItem(sampleItem))
    act(() => result.current.clearCart())
    expect(result.current.items).toHaveLength(0)
  })

  it('setOrderType changes order type', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.setOrderType('dine_in'))
    expect(result.current.orderType).toBe('dine_in')
  })

  it('total is sum of unitPrice × quantity across all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem({ ...sampleItem, quantity: 2, unitPrice: 99 }))
    act(() => result.current.addItem({ ...sampleItem, quantity: 1, unitPrice: 15 }))
    expect(result.current.total).toBe(2 * 99 + 1 * 15)
  })
})
